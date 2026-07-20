import * as FileSystem from 'expo-file-system/legacy';

import type { Mood } from '@/constants/theme';
import { createId } from '@/lib/id';
import { persistImage } from '@/lib/storage';

export type GenerateInput = {
  bodyUri: string;
  faceUri: string;
  garmentUris: string[];
  mood: Mood;
};

export type GenerateResult =
  | { ok: true; uri: string; source: 'ai' }
  | { ok: false; reason: 'missing_key' | 'missing_assets' | 'api_error'; message: string };

/** Native image model used for try-on (Nano Banana / Flash Image). */
const MODEL = 'gemini-2.5-flash-image';

function getApiKey(): string {
  return (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

async function uriToBase64(uri: string): Promise<{ mimeType: string; data: string }> {
  const data = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const lower = uri.toLowerCase();
  const mimeType = lower.includes('.png')
    ? 'image/png'
    : lower.includes('.webp')
      ? 'image/webp'
      : 'image/jpeg';
  return { mimeType, data };
}

function buildPrompt(mood: Mood, garmentCount: number): string {
  return [
    'You are a professional virtual fashion try-on system.',
    'Create a single photorealistic full-body fashion photograph of the same person shown in the reference images.',
    'Use the full-body photo for body shape, pose, skin tone, and proportions.',
    'Use the face photo for accurate facial identity, hair, and expression.',
    `Dress them in the ${garmentCount} garment image(s) provided. Preserve fabric, color, pattern, and silhouette of each garment as closely as possible.`,
    `Style mood: ${mood}. Lighting and composition should feel ${mood.toLowerCase()} and editorial.`,
    'Natural body proportions, realistic fabric drape, clean background with soft studio or street atmosphere matching the mood.',
    'Do not add text, watermarks, logos, or collage borders. Output one polished fashion image only.',
  ].join(' ');
}

function parseGeminiError(status: number, errText: string): string {
  let message = errText;
  let retryHint: string | undefined;
  try {
    const json = JSON.parse(errText) as {
      error?: {
        message?: string;
        details?: Array<{
          '@type'?: string;
          retryDelay?: string;
          violations?: Array<{ quotaValue?: string; quotaMetric?: string }>;
        }>;
      };
    };
    message = json.error?.message ?? errText;
    for (const detail of json.error?.details ?? []) {
      if (detail.retryDelay) retryHint = detail.retryDelay;
      const zeroQuota = detail.violations?.some(
        (v) => v.quotaValue === '0' || v.quotaValue === '0'
      );
      if (zeroQuota || /limit:\s*0/i.test(message)) {
        return [
          'Gemini image quota is 0 for this project/key (common on free tier for image models).',
          'Open AI Studio → Rate limits / Billing, enable billing or use a project with image quota,',
          'then create a new API key and restart Expo.',
          'https://aistudio.google.com/rate-limit',
        ].join(' ');
      }
    }
  } catch {
    // keep raw text
  }

  if (status === 429) {
    return [
      'Gemini rate/quota limit (429).',
      retryHint ? `Retry after ~${retryHint}.` : 'Wait a minute and try again.',
      'Image models often have a separate (sometimes zero) free quota from text models.',
      message.slice(0, 180),
    ].join(' ');
  }

  return `Gemini error ${status}: ${message.slice(0, 280)}`;
}

async function callGemini(input: GenerateInput): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key');
  }

  const body = await uriToBase64(input.bodyUri);
  const face = await uriToBase64(input.faceUri);
  const garments = await Promise.all(input.garmentUris.map(uriToBase64));

  // Prefer camelCase (current REST style); keep payloads small where possible.
  const parts: Array<Record<string, unknown>> = [
    { text: buildPrompt(input.mood, garments.length) },
    { text: 'Full-body reference:' },
    { inlineData: { mimeType: body.mimeType, data: body.data } },
    { text: 'Face reference:' },
    { inlineData: { mimeType: face.mimeType, data: face.data } },
  ];

  garments.forEach((g, i) => {
    parts.push({ text: `Garment ${i + 1}:` });
    parts.push({ inlineData: { mimeType: g.mimeType, data: g.data } });
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(parseGeminiError(response.status, errText));
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; data?: string };
          inline_data?: { mime_type?: string; data?: string };
        }>;
      };
    }>;
  };

  const responseParts = json.candidates?.[0]?.content?.parts ?? [];
  for (const part of responseParts) {
    const inline = part.inlineData ?? part.inline_data;
    const data = inline && 'data' in inline ? inline.data : undefined;
    if (data) {
      const mime =
        ('mimeType' in (inline ?? {}) && (inline as { mimeType?: string }).mimeType) ||
        ('mime_type' in (inline ?? {}) && (inline as { mime_type?: string }).mime_type) ||
        'image/png';
      const ext = mime.includes('png') ? 'png' : 'jpg';
      const path = `${FileSystem.cacheDirectory}drape_gen_${createId('look')}.${ext}`;
      await FileSystem.writeAsStringAsync(path, data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return persistImage(path, createId('look'));
    }
  }

  throw new Error('No image returned from Gemini');
}

export async function generateLook(input: GenerateInput): Promise<GenerateResult> {
  if (!input.bodyUri || !input.faceUri) {
    return {
      ok: false,
      reason: 'missing_assets',
      message: 'Add a full-body and face photo first.',
    };
  }
  if (!input.garmentUris.length) {
    return {
      ok: false,
      reason: 'missing_assets',
      message: 'Select at least one garment from your wardrobe.',
    };
  }

  if (!hasApiKey()) {
    return {
      ok: false,
      reason: 'missing_key',
      message:
        'Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file, then restart Expo to generate AI looks.',
    };
  }

  try {
    const uri = await callGemini(input);
    return { ok: true, uri, source: 'ai' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    return { ok: false, reason: 'api_error', message };
  }
}

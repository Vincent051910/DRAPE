#!/usr/bin/env node
/**
 * Standalone tester for the DRAPE Gemini try-on pipeline.
 * Mirrors lib/generate.ts (same model, prompt, and payload) so you can
 * test the AI without running the app.
 *
 * Usage:
 *   node scripts/try-gemini.mjs --body body.jpg --face face.jpg \
 *     --garment top.png [--garment jeans.png] [--mood Editorial] [--out look.png]
 *
 * Quick key/quota check (no reference images, just text -> image):
 *   node scripts/try-gemini.mjs --smoke
 */
import fs from 'node:fs';
import path from 'node:path';

const MODEL = 'gemini-2.5-flash-image';
const MOODS = ['Clean', 'Editorial', 'Street', 'Evening'];

function loadApiKey() {
  if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim().replace(/^['"]|['"]$/g, '');
  }
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, 'utf8').match(/^EXPO_PUBLIC_GEMINI_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return '';
}

function parseArgs(argv) {
  const args = { garments: [], mood: 'Editorial', out: null, smoke: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--body') args.body = argv[++i];
    else if (a === '--face') args.face = argv[++i];
    else if (a === '--garment') args.garments.push(argv[++i]);
    else if (a === '--mood') args.mood = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--smoke') args.smoke = true;
    else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

function fileToInlineData(filePath) {
  const data = fs.readFileSync(filePath).toString('base64');
  const lower = filePath.toLowerCase();
  const mimeType = lower.endsWith('.png')
    ? 'image/png'
    : lower.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';
  return { mimeType, data };
}

// Same prompt as lib/generate.ts buildPrompt()
function buildPrompt(mood, garmentCount) {
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

async function callGemini(apiKey, parts) {
  // AQ. auth keys (new AI Studio default) should work with x-goog-api-key.
  // Some accounts hit ACCESS_TOKEN_TYPE_UNSUPPORTED on the header only —
  // retry with ?key= which is also documented.
  const payload = JSON.stringify({
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });
  const attempts = [
    {
      label: 'x-goog-api-key header',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    },
    {
      label: '?key= query',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      headers: { 'Content-Type': 'application/json' },
    },
  ];

  const started = Date.now();
  let response;
  let lastErr = '';
  for (const attempt of attempts) {
    response = await fetch(attempt.url, {
      method: 'POST',
      headers: attempt.headers,
      body: payload,
    });
    if (response.ok) {
      console.log(`Auth ok via ${attempt.label}`);
      break;
    }
    lastErr = await response.text();
    console.error(`Auth attempt failed (${attempt.label}): ${response.status}`);
    // Only fall through on auth errors; other errors (429 etc.) are final.
    if (response.status !== 401 && response.status !== 403) break;
  }
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  if (!response.ok) {
    const errText = lastErr;
    console.error(`Gemini error ${response.status} after ${elapsed}s:`);
    try {
      console.error(JSON.stringify(JSON.parse(errText).error, null, 2));
    } catch {
      console.error(errText.slice(0, 1000));
    }
    process.exit(1);
  }

  const json = await response.json();
  const responseParts = json.candidates?.[0]?.content?.parts ?? [];
  for (const part of responseParts) {
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      return {
        elapsed,
        mime: inline.mimeType ?? inline.mime_type ?? 'image/png',
        buffer: Buffer.from(inline.data, 'base64'),
        text: responseParts.find((p) => p.text)?.text,
      };
    }
  }
  console.error(`No image in response (${elapsed}s). Full response:`);
  console.error(JSON.stringify(json, null, 2).slice(0, 2000));
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('No API key. Set EXPO_PUBLIC_GEMINI_API_KEY in .env or the environment.');
    process.exit(1);
  }

  let parts;
  let outPath;
  if (args.smoke) {
    console.log(`Smoke test: asking ${MODEL} for a simple generated image...`);
    parts = [
      {
        text: 'Generate a simple photorealistic image of a folded olive-green sweater on a cream background.',
      },
    ];
    outPath = args.out ?? 'gemini-smoke.png';
  } else {
    if (!args.body || !args.face || args.garments.length === 0) {
      console.error(
        'Usage: node scripts/try-gemini.mjs --body body.jpg --face face.jpg --garment top.png [--garment ...] [--mood Editorial] [--out look.png]\n' +
          '       node scripts/try-gemini.mjs --smoke   (key/quota check, no reference images)'
      );
      process.exit(1);
    }
    if (!MOODS.includes(args.mood)) {
      console.error(`Mood must be one of: ${MOODS.join(', ')}`);
      process.exit(1);
    }
    for (const f of [args.body, args.face, ...args.garments]) {
      if (!fs.existsSync(f)) {
        console.error(`File not found: ${f}`);
        process.exit(1);
      }
    }

    parts = [
      { text: buildPrompt(args.mood, args.garments.length) },
      { text: 'Full-body reference:' },
      { inlineData: fileToInlineData(args.body) },
      { text: 'Face reference:' },
      { inlineData: fileToInlineData(args.face) },
    ];
    args.garments.forEach((g, i) => {
      parts.push({ text: `Garment ${i + 1}:` });
      parts.push({ inlineData: fileToInlineData(g) });
    });
    outPath = args.out ?? `look-${Date.now()}.png`;
    console.log(
      `Generating try-on (mood: ${args.mood}, ${args.garments.length} garment(s)) with ${MODEL}...`
    );
  }

  const result = await callGemini(apiKey, parts);
  fs.writeFileSync(outPath, result.buffer);
  console.log(`Saved ${result.mime} (${(result.buffer.length / 1024).toFixed(0)} KB) to ${outPath} in ${result.elapsed}s`);
  if (result.text) console.log(`Model note: ${result.text.slice(0, 300)}`);
}

main();

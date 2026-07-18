import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import UPNG from 'upng-js';

import { createId } from '@/lib/id';

const MAX_WIDTH = 720;
const COLOR_THRESHOLD = 48;
const OUTLINE_WIDTH = 3;
const OUTLINE_RGB = { r: 26, g: 26, b: 24 }; // charcoal

type Rgba = { r: number; g: number; b: number; a: number };

function colorDistance(a: Rgba, b: Rgba): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function samplePatch(
  data: Uint8Array,
  width: number,
  height: number,
  sx: number,
  sy: number,
  size: number
): Rgba {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const x0 = Math.max(0, Math.min(width - 1, sx));
  const y0 = Math.max(0, Math.min(height - 1, sy));
  const x1 = Math.min(width, x0 + size);
  const y1 = Math.min(height, y0 + size);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  return { r: r / n, g: g / n, b: b / n, a: 255 };
}

function averageColors(colors: Rgba[]): Rgba {
  const n = colors.length || 1;
  return {
    r: colors.reduce((s, c) => s + c.r, 0) / n,
    g: colors.reduce((s, c) => s + c.g, 0) / n,
    b: colors.reduce((s, c) => s + c.b, 0) / n,
    a: 255,
  };
}

function getPixel(
  data: Uint8Array | Uint8ClampedArray,
  width: number,
  x: number,
  y: number
): Rgba {
  const i = (y * width + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
}

/** Flood-fill from image edges to clear background-like pixels. */
function removeBackground(data: Uint8Array, width: number, height: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data);
  const bg = averageColors([
    samplePatch(data, width, height, 0, 0, 12),
    samplePatch(data, width, height, width - 12, 0, 12),
    samplePatch(data, width, height, 0, height - 12, 12),
    samplePatch(data, width, height, width - 12, height - 12, 12),
    samplePatch(data, width, height, Math.floor(width / 2) - 6, 0, 12),
    samplePatch(data, width, height, Math.floor(width / 2) - 6, height - 12, 12),
  ]);

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const pixel = getPixel(data, width, x, y);
    if (colorDistance(pixel, bg) > COLOR_THRESHOLD) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * 4;
    out[i + 3] = 0;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  // Soften leftover near-bg speckles inside clear regions
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      if (out[i + 3] === 0) continue;
      const pixel = getPixel(out, width, x, y);
      if (colorDistance(pixel, bg) > COLOR_THRESHOLD * 0.75) continue;
      let transparentNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (out[((y + dy) * width + (x + dx)) * 4 + 3] === 0) transparentNeighbors++;
        }
      }
      if (transparentNeighbors >= 5) out[i + 3] = 0;
    }
  }

  return out;
}

/** Paint a charcoal outline around the opaque silhouette. */
function applyOutline(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const opaque = new Uint8Array(width * height);
  for (let i = 0; i < opaque.length; i++) {
    opaque[i] = data[i * 4 + 3] > 16 ? 1 : 0;
  }

  const dilated = new Uint8Array(opaque);
  for (let pass = 0; pass < radius; pass++) {
    const prev = dilated.slice();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (prev[idx]) continue;
        let near = false;
        for (let dy = -1; dy <= 1 && !near; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (prev[ny * width + nx]) {
              near = true;
              break;
            }
          }
        }
        if (near) dilated[idx] = 1;
      }
    }
  }

  const out = new Uint8ClampedArray(data);
  for (let i = 0; i < opaque.length; i++) {
    if (!dilated[i] || opaque[i]) continue;
    const p = i * 4;
    out[p] = OUTLINE_RGB.r;
    out[p + 1] = OUTLINE_RGB.g;
    out[p + 2] = OUTLINE_RGB.b;
    out[p + 3] = 255;
  }
  return out;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

/**
 * Removes the photo background (edge flood-fill) and adds a charcoal outline
 * around the clothing silhouette. Returns a local PNG URI.
 */
export async function cutoutGarment(sourceUri: string): Promise<string> {
  const resized = await manipulateAsync(
    sourceUri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: 0.92, format: SaveFormat.JPEG, base64: true }
  );

  if (!resized.base64) {
    throw new Error('Failed to read garment image');
  }

  const jpegBytes = Buffer.from(resized.base64, 'base64');
  const decoded = jpeg.decode(jpegBytes, { useTArray: true, formatAsRGBA: true });
  const { width, height, data } = decoded;

  const cleared = removeBackground(data as Uint8Array, width, height);
  const outlined = applyOutline(cleared, width, height, OUTLINE_WIDTH);

  // Crop tightly around the subject so cutouts fill the tile better
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (outlined[(y * width + x) * 4 + 3] < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  let outW = width;
  let outH = height;
  let outData: Uint8ClampedArray = outlined;

  if (maxX >= minX && maxY >= minY) {
    const pad = OUTLINE_WIDTH + 8;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);
    outW = maxX - minX + 1;
    outH = maxY - minY + 1;
    outData = new Uint8ClampedArray(outW * outH * 4);
    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        const src = ((minY + y) * width + (minX + x)) * 4;
        const dst = (y * outW + x) * 4;
        outData[dst] = outlined[src];
        outData[dst + 1] = outlined[src + 1];
        outData[dst + 2] = outlined[src + 2];
        outData[dst + 3] = outlined[src + 3];
      }
    }
  }

  const rgbaCopy = new Uint8Array(outData.byteLength);
  rgbaCopy.set(outData);
  const png = UPNG.encode([rgbaCopy.buffer], outW, outH, 0);
  const path = `${FileSystem.cacheDirectory}drape_cutout_${createId('cut')}.png`;
  await FileSystem.writeAsStringAsync(path, arrayBufferToBase64(png), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return path;
}

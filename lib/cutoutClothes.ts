import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { removeBackground } from '@six33/react-native-bg-removal';

/**
 * On-device subject cutout for wardrobe pieces and full-body likeness
 * (iOS 17+ Vision / Android ML Kit).
 * - iOS: physical device only; simulator returns a no-op / original.
 * - Android: first run may download the ML Kit model (~10MB) via Play Services.
 * - Segments the main foreground subject. Best with a single subject, plain
 *   background, and good contrast.
 *
 * Always downscales before native ML — large images can hard-crash the process.
 */

const MAX_WIDTH = 1280;
const LOG = '[cutoutClothes]';

export type CutoutResult = {
  uri: string;
  /** True when native ML produced a transparent PNG cutout. */
  cutout: boolean;
};

export type CutoutOptions = {
  /**
   * Trim transparent edges after cutout. Default true for clothes.
   * Use false for head/neck so soft neck edges are not cropped away.
   */
  trim?: boolean;
};

export async function cutoutClothes(
  sourceUri: string,
  options: CutoutOptions = {}
): Promise<CutoutResult> {
  const trim = options.trim ?? true;
  try {
    const probe = await manipulateAsync(sourceUri, [], {
      compress: 1,
      format: SaveFormat.JPEG,
    });
    const actions =
      probe.width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
    const prepared = await manipulateAsync(sourceUri, actions, {
      compress: 0.85,
      format: SaveFormat.JPEG,
    });

    console.log(LOG, 'start', {
      sourceW: probe.width,
      sourceH: probe.height,
      outW: prepared.width,
      outH: prepared.height,
      downscaled: actions.length > 0,
      trim,
    });

    const resultUri = await removeBackground(prepared.uri, { trim });

    if (!resultUri || resultUri === prepared.uri || resultUri === sourceUri) {
      console.log(LOG, 'noop — keeping original');
      return { uri: sourceUri, cutout: false };
    }

    console.log(LOG, 'ok', { resultUri: resultUri.slice(0, 80) });
    return { uri: resultUri, cutout: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(LOG, 'failed — keeping original', message);
    return { uri: sourceUri, cutout: false };
  }
}

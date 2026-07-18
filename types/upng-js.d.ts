declare module 'upng-js' {
  export function encode(
    bufs: ArrayBuffer[],
    w: number,
    h: number,
    cnum?: number,
    dels?: number[]
  ): ArrayBuffer;

  export function decode(buffer: ArrayBuffer | ArrayBufferView): {
    width: number;
    height: number;
    data: ArrayBuffer;
    depth: number;
    ctype: number;
  };
}

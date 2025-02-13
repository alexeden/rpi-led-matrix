import { createRequire } from 'node:module';
import { type LedMatrixAddon } from './types';
export * from './layout-utils';
export * from './types';
export * from './utils';
export const { Font, isSupported, LedMatrix } = (() => {
  try {
    return createRequire(import.meta.url)(
      '../build/Release/rpi-led-matrix.node'
    ) as LedMatrixAddon;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../build/Release/rpi-led-matrix.node') as LedMatrixAddon;
  }
})();

import { type LedMatrixAddon } from './types';
export * from './layout-utils';
export * from './types';
export * from './utils';
export const { Font, isSupported, LedMatrix } =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../build/Release/rpi-led-matrix.node') as LedMatrixAddon;

import { createRequire } from 'node:module';
import { type LedMatrixAddon } from './types';
export * from './layout-utils';
export * from './types';
export * from './utils';

const require = globalThis.require ?? createRequire(import.meta.url);
// createRequire(import.meta.url);

export const { Font, isSupported, LedMatrix } =
  require('../build/Release/rpi-led-matrix.node') as LedMatrixAddon;

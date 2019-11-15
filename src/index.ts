export * from './layout-utils';
export * from './types';
export * from './utils';

import { LedMatrixAddon } from './types';
const { Font, isSupported, LedMatrix }: LedMatrixAddon = require('bindings')('rpi-led-matrix');

export {
  Font,
  isSupported,
  LedMatrix,
};

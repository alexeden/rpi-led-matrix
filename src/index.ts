export * from './types';

import { LedMatrixAddon } from 'types';
const { Font, LedMatrix }: LedMatrixAddon = require('bindings')('rpi-led-matrix');

export {
  Font,
  LedMatrix,
};

export * from './types';

import { LedMatrixAddon } from 'types';
const { Font, LedMatrix }: LedMatrixAddon = require('bindings')('led-matrix');

export {
  Font,
  LedMatrix,
};

export * from './layout-utils';
export * from './types';
export * from './utils';
import { type LedMatrixAddon } from './types';

const bindings = require('bindings') as (id: string) => LedMatrixAddon;
const { Font, isSupported, LedMatrix } = bindings('rpi-led-matrix');
export { Font, isSupported, LedMatrix };

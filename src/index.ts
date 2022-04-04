export * from './native-types';
export * from './layout-utils';
export * from './types';
export * from './utils';
import { LedMatrixAddon } from './types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bindings = require('bindings') as (id: string) => LedMatrixAddon;
const { Font, isSupported, LedMatrix } = bindings('rpi-led-matrix');
export { Font, isSupported, LedMatrix };

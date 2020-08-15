/* eslint-disable @typescript-eslint/unbound-method */

/**
 * Re-export relevant functions and values from the canvas dependency.
 */
export {
  registerFont,
} from 'canvas';

export * from './led-matrix';
export * from './types';
export * from './utils';

/**
 * Export the default option functions individually,
 * i.e. without the `NativeLedMatrix` wrapper.
 */
import { addon, } from './addon';
export const {
  defaultMatrixOptions,
  defaultRuntimeOptions,
} = addon.NativeLedMatrix;

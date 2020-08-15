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
 * Export the default option functions from the native module.
 */
import { addon, } from './addon';
export const {
  defaultMatrixOptions,
  defaultRuntimeOptions,
} = addon;

import { Canvas } from 'canvas';
import { LedMatrixAddon, LedMatrixInstance, MatrixOptions, RuntimeOptions } from './types';

export const {
  isSupported,
  NativeLedMatrix,
}: LedMatrixAddon = require('bindings')('rpi-led-matrix');

export const {
  defaultMatrixOptions,
  defaultRuntimeOptions,
} = NativeLedMatrix;

export class LedMatrix extends Canvas {
  static fromOptions(
    matrixOpts: MatrixOptions,
    runtimeOpts: RuntimeOptions
  ) {
    return new LedMatrix(
      new NativeLedMatrix(matrixOpts, runtimeOpts)
    );
  }


  private constructor(
    readonly matrix: LedMatrixInstance
  ) {
    super(matrix.width(), matrix.height());
    // const canvas = createCanvas(matrix.width(), matrix.height());
    // super(canvas)
  }

}

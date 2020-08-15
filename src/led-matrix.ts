/* eslint-disable @typescript-eslint/unbound-method */
import { Canvas, } from 'canvas';

import { LedMatrixAddon, LedMatrixInstance, MatrixOptions, RuntimeOptions, } from './types';

export const {
  isSupported,
  NativeLedMatrix,
}: LedMatrixAddon = require('bindings')('rpi-led-matrix'); // eslint-disable-line

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

  readonly center: [number, number];

  private constructor(
    readonly matrix: LedMatrixInstance
  ) {
    super(matrix.width(), matrix.height());
    this.center = [ matrix.width() / 2, matrix.height() / 2, ];
  }

  sync() {
    const buffer = this.toBuffer('raw').filter((_, i) => (i + 1) % 4 !== 0);
    this.matrix.drawBuffer(buffer).sync();
  }
}

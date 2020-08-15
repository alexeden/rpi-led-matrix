/* eslint-disable @typescript-eslint/unbound-method */
import { addon, } from './addon';
import { Canvas, } from 'canvas';
import { MatrixOptions, RuntimeOptions, } from './types';

const {
  NativeLedMatrix,
} = addon;

export const matrixFromOptions = (
  matrixOpts: MatrixOptions,
  runtimeOpts: RuntimeOptions
) => {
  const nativeMatrix = new NativeLedMatrix(matrixOpts, runtimeOpts);
  const canvas = new Canvas(nativeMatrix.width(), nativeMatrix.height());
  const ctx = canvas.getContext('2d', {
    alpha: false,
    pixelFormat: 'RGB24',
  });

  return Object.assign(ctx, {
    center: [ canvas.width / 2, canvas.height / 2, ] as const,
    height: canvas.height,
    width: canvas.width,

    native: nativeMatrix,

    sync() {
      const buffer = canvas.toBuffer('raw').filter((_, i) => (i + 1) % 4 !== 0);
      nativeMatrix.drawBuffer(buffer).sync();
    },
  });
};

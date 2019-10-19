import {
  GpioMapping,
  LedMatrix,
  // LedMatrixUtils,
  MatrixOptions,
  // PixelMapperType,
  RuntimeOptions,
} from '../src';

export const matrixOptions: MatrixOptions = {
  ...LedMatrix.defaultMatrixOptions(),
  rows: 32,
  cols: 64,
  chainLength: 5,
  hardwareMapping: GpioMapping.AdafruitHatPwm,
  // pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
};

export const runtimeOptions: RuntimeOptions = {
  ...LedMatrix.defaultRuntimeOptions(),
  gpioSlowdown: 1,
};

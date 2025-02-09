import {
  GpioMapping,
  LedMatrix,
  LedMatrixUtils,
  type MatrixOptions,
  PixelMapperType,
  RuntimeFlag,
  type RuntimeOptions,
} from '../src';

export const matrixOptions: MatrixOptions = {
  ...LedMatrix.defaultMatrixOptions(),
  rows: 32,
  cols: 64,
  chainLength: 2,
  hardwareMapping: GpioMapping.Regular,
  parallel: 3,
  brightness: 100,
  pixelMapperConfig: LedMatrixUtils.encodeMappers(
    {
      type: PixelMapperType.Chainlink,
    },
    {
      type: PixelMapperType.Rotate,
      angle: 180,
    }
  ),
};

console.log('matrix options: ', JSON.stringify(matrixOptions, null, 2));

export const runtimeOptions: RuntimeOptions = {
  ...LedMatrix.defaultRuntimeOptions(),
  gpioSlowdown: 4,
  dropPrivileges: RuntimeFlag.Off,
};

console.log('runtime options: ', JSON.stringify(runtimeOptions, null, 2));

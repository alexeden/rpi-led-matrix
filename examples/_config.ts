import {
  // GpioMapping,
  LedMatrix,
  // LedMatrixUtils,
  MatrixOptions,
  // RuntimeFlag,
  // PixelMapperType,
  RuntimeOptions,
} from '../src';

export const matrixOptions: MatrixOptions = {
  ...LedMatrix.defaultMatrixOptions(),
  rows: 64,
  cols: 64,
  chainLength: 2,
  // hardwareMapping: GpioMapping.Regular,
  parallel: 2,
  // panelType: 'FM6127',
  // limitRefreshRateHz: 1,
  // showRefreshRate: true,
  // pixelMapperConfig: LedMatrixUtils.encodeMappers(
  //   { type: PixelMapperType.Chainlink }
  // ),
  // pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
};

console.log('matrix options: ', JSON.stringify(matrixOptions, null, 2));

export const runtimeOptions: RuntimeOptions = {
  ...LedMatrix.defaultRuntimeOptions(),
  gpioSlowdown: 4,
  // dropPrivileges: RuntimeFlag.Off,
};

console.log('runtime options: ', JSON.stringify(runtimeOptions, null, 2));

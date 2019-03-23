import { addon } from './led-matrix';

try {
  console.log('addon: ', addon);
  console.log('addon.LedMatrix: ', addon.LedMatrix);
  console.log('addon.LedMatrix.defaultMatrixOptions(): ', addon.LedMatrix.defaultMatrixOptions());
  console.log('addon.LedMatrix.defaultRuntimeOptions(): ', addon.LedMatrix.defaultRuntimeOptions());
  const matrixOpts = addon.LedMatrix.defaultMatrixOptions();
  const runtimeOpts = addon.LedMatrix.defaultRuntimeOptions();
  console.log('new addon.LedMatrix: ', new addon.LedMatrix(matrixOpts, runtimeOpts));
}
catch (error) {
  console.error(error);
}

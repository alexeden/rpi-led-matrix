import { LedMatrix, NodeLedMatrix } from './led-matrix';

try {
  LedMatrix.validateMatrixOptions({ pwm_dither_bits: 0 });
  LedMatrix.validateRuntimeOptions({ });
  const addon = new NodeLedMatrix();
  console.log('NodeMatrixAddonInstance: ', addon);
  console.log('NodeLedMatrix keys: ', Object.keys(NodeLedMatrix));
  // tslint:disable-next-line:no-any
  console.log('typeof NodeLedMatrix.defaultMatrixOptions: ', (NodeLedMatrix as any).defaultMatrixOptions);
  // tslint:disable-next-line:no-any
  console.log('NodeLedMatrix.defaultMatrixOptions: ', (NodeLedMatrix as any).defaultMatrixOptions());


}
catch (error) {
  console.error(error);
}

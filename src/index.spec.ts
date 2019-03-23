import { LedMatrix } from './led-matrix';

try {
  LedMatrix.validateMatrixOptions({ pwm_dither_bits: 0 });
  LedMatrix.validateRuntimeOptions({ });
}
catch (error) {
  console.error(error);
}

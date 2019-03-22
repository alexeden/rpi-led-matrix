import { LedMatrix } from './led-matrix';

console.log(LedMatrix);

console.log(LedMatrix.validateMatrixOptions({
  pwm_dither_bits: 0,
}));

console.log(LedMatrix.validateRuntimeOptions({
}));

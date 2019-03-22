import { LedMatrix } from './led-matrix';

console.log(LedMatrix);

console.log(LedMatrix.validateOptions({
  pwm_dither_bits: -1,
}));

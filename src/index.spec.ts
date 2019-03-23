import { addon } from './led-matrix';
import { MatrixOptions } from './types';

try {
  console.log('addon: ', addon);
  console.log('addon.LedMatrix: ', addon.LedMatrix);
  console.log('addon.LedMatrix.defaultMatrixOptions(): ', addon.LedMatrix.defaultMatrixOptions());
  console.log('addon.LedMatrix.defaultRuntimeOptions(): ', addon.LedMatrix.defaultRuntimeOptions());
  const matrixOpts: MatrixOptions = {
    ...addon.LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    chain_length: 2,
    hardware_mapping: 'adafruit-hat',
  };
  const runtimeOpts = addon.LedMatrix.defaultRuntimeOptions();
  console.log('new addon.LedMatrix: ', new addon.LedMatrix(matrixOpts, runtimeOpts));
}
catch (error) {
  console.error(error);
}

/*

sudo ./scrolling-text-example \
  --led-rows=32 \
  --led-cols=64 \
  --led-chain=2 \
  --led-pixel-mapper="U-mapper" \
  -C 255,0,255 \
  -s 5 \
  -S -1 \
  -f ../fonts/helvR12.bdf \
  "YAAAAAS! yas."
*/

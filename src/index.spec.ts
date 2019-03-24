import { addon } from './addon';
import { MatrixOptions, RuntimeOptions, GpioMapping } from './types';

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
    // disable_hardware_pulsing: true,
    hardware_mapping: GpioMapping.AdafruitHatPwm,
  };
  const runtimeOpts: RuntimeOptions = {
    ...addon.LedMatrix.defaultRuntimeOptions(),
    gpio_slowdown: 0,
  };

  const instance = new addon.LedMatrix(matrixOpts, runtimeOpts);
  console.log('new addon.LedMatrix: ', instance);
  // tslint:disable-next-line:no-any
  console.log('instance.pwmBits(): ', instance.pwmBits());
  console.log('instance.pwmBits(1): ', instance.pwmBits(1));
  console.log('instance.pwmBits(12): ', instance.pwmBits(12));
  console.log('instance.pwmBits(11): ', instance.pwmBits(11));
  console.log('instance.brightness(): ', instance.brightness());
  console.log('instance.brightness(0): ', instance.brightness(0));
  console.log('instance.brightness(100): ', instance.brightness(100));
  console.log('instance.height(): ', instance.height());
  console.log('instance.width(): ', instance.width());


  const interval = 333;
  setTimeout(() => instance.fill(0, 0, 255), 0);
  setTimeout(() => instance.fill(0, 255, 0), 1 * interval);
  setTimeout(() => instance.fill(255, 0, 0), 2 * interval);
  setTimeout(() => instance.clear(), 3 * interval);

  setTimeout(
    () => {
      const y = Math.floor(instance.height() / 2);
      Array.from(Array(instance.width())).map((_, x) => {
        instance.setPixel(x, y, 255, 0, 0);
      });
    },
    4 * interval
  );

  setTimeout(() => console.log('bye!'), 5000);

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

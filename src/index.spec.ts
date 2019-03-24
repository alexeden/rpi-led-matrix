import { addon } from './addon';
import { MatrixOptions, RuntimeOptions, GpioMapping, PixelMapperType } from './types';
import { LedMatrixUtils } from './utils';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
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
      hardware_mapping: GpioMapping.AdafruitHatPwm,
      pixel_mapper_config: LedMatrixUtils.encodeMappers(
        { type: PixelMapperType.U }
        // { type: PixelMapperType.Rotate, angle: 90 }
      ),
    };
    const runtimeOpts: RuntimeOptions = {
      ...addon.LedMatrix.defaultRuntimeOptions(),
      gpio_slowdown: 0,
    };

    const instance = new addon.LedMatrix(matrixOpts, runtimeOpts);
    console.log('new addon.LedMatrix: ', instance);
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
    instance.fill(0, 0, 255);
    await wait(interval);
    instance.fill(0, 255, 0);
    await wait(interval);
    instance.fill(255, 0, 0);
    await wait(interval);
    instance.clear();
    await wait(interval);

    const y = Math.floor(instance.height() / 2);
    Array.from(Array(instance.width())).map((_, x) => {
      instance.setPixel(x, y, 255, 0, 0);
    });
    await wait(5000);

    console.log('instance.luminanceCorrect(true): ', instance.luminanceCorrect(true));
    // console.log('instance.brightness(50): ', instance.brightness(50));
    instance.fill(0, 255, 0);
    await wait(2000);
    console.log('instance.luminanceCorrect(false): ', instance.luminanceCorrect(false));
    instance.fill(0, 255, 0);
    await wait(2000);
    // console.log('instance.pwmBits(1): ', instance.pwmBits(1));

  }
  catch (error) {
    console.error(error);
  }

})();


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

import { addon } from './addon';
import { GpioMapping, PixelMapperType } from './types';
import { LedMatrixUtils } from './utils';
import globby from 'globby';
import { basename } from 'path';


// tslint:disable-next-line:variable-name
enum Colors {
  black = 0x000000,
  red = 0xFF0000,
  green = 0x00FF00,
  blue = 0x0000FF,
  magenta = 0xFF00FF,
  cyan = 0x00FFFF,
  yellow = 0xFFFF00,
}

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));


(async () => {
  try {
    const fontExt = '.bdf';
    const fontPaths = await globby(`../rpi-rgb-led-matrix/fonts/*${fontExt}`);

    fontPaths.forEach((path, i) => {
      console.log(`${i + 1} created font ${basename(path, fontExt)} `, new addon.Font(path));
    });
    // const f1 = new addon.Font(fontPaths[0]);
    // const f2 = new addon.Font(fontPaths[1]);
    // console.log(f1, f2);
    // const fonts = fontPaths.reduce(
    //   (map, path) => ({
    //     ...map,
    //     [basename(path, fontExt)]: new addon.Font(path),
    //   }),
    //   { }
    // );

    // console.log('fonts: ', fonts);

    const matrix = new addon.LedMatrix(
      {
        ...addon.LedMatrix.defaultMatrixOptions(),
        rows: 32,
        cols: 64,
        chainLength: 2,
        hardwareMapping: GpioMapping.AdafruitHatPwm,
        pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
      },
      {
        ...addon.LedMatrix.defaultRuntimeOptions(),
        gpioSlowdown: 1,
      }
    );

    const font = new addon.Font('../rpi-rgb-led-matrix/fonts/helvR12.bdf');

    matrix.brightness(33);

    console.log('font paths: ', fontPaths);



    {
      const str = 'Jaguar! ';
      const strWidth = font.stringWidth(str);
      console.log('strWidth: ', strWidth);
      matrix.clear();
      console.log('clear');
      matrix
      .fgColor(Colors.red)
      .drawRect(0, 0, strWidth, font.height());
      console.log('draw rect');

      const advanced = matrix
        .fgColor(Colors.yellow)
        .drawText(str, 0, 0);

      console.log('draw text');
      str.split('').map(char => console.log(`${char} width: ${font.stringWidth(char)}`));
      console.log('advanced: ', advanced);
      matrix.sync();
      await wait(30000);
    }


  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }

})();

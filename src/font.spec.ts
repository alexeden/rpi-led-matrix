import { addon } from './addon';
import { GpioMapping, PixelMapperType, FontInstance } from './types';
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

type FontMap = { [name: string]: FontInstance };

(async () => {
  try {
    const fontExt = '.bdf';
    const fontPaths = (await globby(`${process.cwd()}/fonts/*${fontExt}`))
      .filter(path => !Number.isSafeInteger(+basename(path, fontExt)[0]));
    console.log(fontPaths);

    const fonts: FontMap = fontPaths
      .reduce(
        (map, path) => ({
          ...map,
          [basename(path, fontExt)]: new addon.Font(path),
        }),
        { }
      );

    console.log('fonts: ', fonts);

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


    for (const [name, font] of Object.entries(fonts)) {
      const nameWidth = font.stringWidth(name);
      const nameX = Math.floor((matrix.width() - nameWidth) / 2);
      const nameY = Math.floor((matrix.height() - font.height()) / 2);
      console.log('nameWidth: ', nameWidth);
      matrix.clear().setFont(font);

      matrix
        .fgColor(Colors.red)
        .drawRect(nameX, nameY, nameX + nameWidth, nameY + font.height())
        .fgColor(Colors.yellow)
        .drawText(name, nameX, nameY);


      name.split('').map(char => console.log(`${char} width: ${font.stringWidth(char)}`));
      matrix.sync();
      await wait(4000);
    }
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }

})();

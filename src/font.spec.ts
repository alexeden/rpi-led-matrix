import { addon } from './addon';
import { GpioMapping, PixelMapperType, FontInstance } from './types';
import { LedMatrixUtils } from './utils';
import globby from 'globby';
import { basename } from 'path';
import { LayoutUtils } from './layout-utils';
import ora from 'ora';

// import * as prompts from 'prompts';
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

    const fontLoader = ora({ color: 'magenta' }).start('Loading fonts').stopAndPersist();

    const fontExt = '.bdf';
    const fontList = (await globby(`${process.cwd()}/fonts/*${fontExt}`))
      .filter(path => !Number.isSafeInteger(+basename(path, fontExt)[0]))
      .map(path => {
        const name = basename(path, fontExt);
        fontLoader.start(`"${name}"`);
        const font = new addon.Font(basename(path, fontExt), path);
        fontLoader.succeed();

        return font;
      });

    const fonts: FontMap = fontList.reduce((map, font) => ({ ...map, [font.name()]: font }), { });

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
      matrix.clear().setFont(font);

      matrix
        .fgColor(Colors.red)
        .drawRect(nameX, nameY, nameWidth, font.height());

      const wrapped = LayoutUtils.wrapText(font, matrix.width(), matrix.height(), `I'm a sentence to be split into lines`);

      wrapped.glyphs.forEach(glyph => {
        matrix
          .fgColor(wrapped.fits ? Colors.green : Colors.red)
          .drawText(glyph.char, glyph.x, glyph.y);
      });

      name.split('').map(char => console.log(`${char} width: ${font.stringWidth(char)}`));
      matrix.sync();
      await wait(1000);
    }
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }

})();

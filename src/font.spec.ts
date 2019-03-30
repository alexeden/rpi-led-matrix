import { addon } from './addon';
import { GpioMapping, PixelMapperType, FontInstance, Color } from './types';
import { LedMatrixUtils } from './utils';
import globby from 'globby';
import { basename } from 'path';
import { LayoutUtils } from './layout-utils';
import ora from 'ora';
import * as prompts from 'prompts';

const Colors = {
  Aquamarine: 0x7FFFD4,
  Black: 0x000000,
  Red: 0xFF0000,
  Green: 0x00FF00,
  Blue: 0x0000FF,
  Magenta: 0xFF00FF,
  Cyan: 0x00FFFF,
  Purple: 0x800080,
  Yellow: 0xFFFF00,
};

enum CliMode {
  Text = 'text',
  Font = 'font',
  Exit = 'exit',
  BgColor = 'bgColor',
  FgColor = 'fgColor',
}

type FontMap = { [name: string]: FontInstance };

const createColorSelector = (colorType: string, colors: { [name: string]: number }) => {
  const colorIndex: { [hex: number]: string } = Object.entries(colors).reduce((index, [name, value]) => ({ ...index, [value]: name }), { });
  const findColorName = ({ r, g, b }: Color) => colorIndex[((r << 16) | (g << 8) | b) & 0xFFFFFF];

  return async (currentColor: Color) => {
    const currentColorName = findColorName(currentColor);

    return prompts({
      name: 'color',
      type: 'select',
      // tslint:disable-next-line: max-line-length
      message: `Select a ${colorType} color ${!currentColorName ? '' : `(current ${colorType} color is ${currentColorName.toLowerCase()})` }`,
      choices: Object.entries(colors).map(([title, value]) => ({ title, value: `${value}` })),
    });
  };
};

const createFontSelector = (fontList: FontInstance[]) => {
  return async (currentFont = '') => {
    return prompts({
      name: 'font',
      type: 'select',
      message: `Select a font ${!currentFont ? '' : `(current font is "${currentFont}")` }`,
      choices: fontList.map(font => ({
        title: `${font.name()}\t(height ${font.height()}px)`,
        value: font.name(),
      })),
    });
  };
};

const createModeSelector = () => {
  return async () => {
    const { mode } = await prompts({
      name: 'mode',
      type: 'select',
      message: 'CLI Mode',
      choices: [
        { value: CliMode.Text, title: 'Text input' },
        { value: CliMode.Font, title: 'Select font' },
        { value: CliMode.BgColor, title: 'Select background color' },
        { value: CliMode.FgColor, title: 'Select foreground color' },
        { value: CliMode.Exit, title: 'Exit' },
      ],
    });

    return mode as CliMode;
  };
};

const createTextPrompter = () => {
  return async () => {
    return prompts({
      name: 'text',
      type: 'text',
      message: 'Input text to display',
    });
  };
};



(async () => {
  try {
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

    if (fontList.length < 1) {
      throw new Error(`No fonts were loaded!`);
    }
    else {
      matrix.font(fontList[0]);
    }

    const fonts: FontMap = fontList.reduce((map, font) => ({ ...map, [font.name()]: font }), { });

    const chooseBgColor = createColorSelector('background', Colors);
    const chooseFgColor = createColorSelector('foreground', Colors);
    const chooseMode = createModeSelector();
    const chooseFont = createFontSelector(fontList);
    const inputText = createTextPrompter();

    // Maintain a thunk of the latest render operation so that it can be repeated when options change
    let render = () => { };

    while (true) {
      switch (await chooseMode()) {
        case CliMode.BgColor: {
          const { color } = await chooseBgColor(matrix.bgColor());
          if (color && Number.isSafeInteger(+color)) {
            matrix.bgColor(+color);
            render();
          }
          break;
        }
        case CliMode.FgColor: {
          const { color } = await chooseFgColor(matrix.fgColor());
          if (color && Number.isSafeInteger(+color)) {
            matrix.fgColor(+color);
            render();
          }
          break;
        }
        case CliMode.Font: {
          const { font } = await chooseFont(matrix.font());
          if (font in fonts) {
            matrix.font(fonts[font]);
            render();
          }
          break;
        }
        case CliMode.Text: {
          // Stay in text mode until escaped
          while (true) {
            const { text } = await inputText();
            // Go back to mode select if escape was pressed (text will be undefined)
            if (typeof text !== 'string') break;
            // Otherwise, show'em some text and save the operation thunk
            render = () => {
              matrix.clear();
              LayoutUtils.wrapText(fonts[matrix.font()], matrix.width(), matrix.height(), text).glyphs.forEach(glyph => {
                matrix.drawText(glyph.char, glyph.x, glyph.y);
              });
              matrix.sync();
            };

            render();
          }
          break;
        }
        case CliMode.Exit: {
          console.log('Bye!');
          process.exit(0);
        }
      }
    }
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();

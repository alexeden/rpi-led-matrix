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
  Blue: 0x0000FF,
  Cyan: 0x00FFFF,
  Green: 0x00FF00,
  Magenta: 0xFF00FF,
  Purple: 0x800080,
  Red: 0xFF0000,
  White: 0xFFFFFF,
  Yellow: 0xFFFF00,
};

enum CliMode {
  BgColor = 'bgColor',
  Brightness = 'brightness',
  Exit = 'exit',
  FgColor = 'fgColor',
  Font = 'font',
  Text = 'text',
}

type FontMap = { [name: string]: FontInstance };

const appendChoiceToGoBack = (choices: prompts.Choice[]) => [
  ...choices,
  { title: 'Go back', value: '' },
];

const createBrightnessPrompter = () => {
  return async (currentBrightness = 100) => {
    return prompts({
      name: 'brightness',
      type: 'number',
      max: 100,
      min: 0,
      message: `Enter a brightness value or press escape to go back (current brightness is ${currentBrightness}%)`,
    });
  };
};

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
      choices: appendChoiceToGoBack(Object.entries(colors).map(([title, value]) => ({ title, value: `${value}` }))),
    });
  };
};

const createFontSelector = (fontList: FontInstance[]) => {
  return async (currentFont = '') => {
    return prompts({
      name: 'font',
      type: 'select',
      message: `Select a font ${!currentFont ? '' : `(current font is "${currentFont}")` }`,
      choices: appendChoiceToGoBack(fontList.map(font => ({
        title: `${font.name()}\t(height ${font.height()}px)`,
        value: font.name(),
      }))),
    });
  };
};

const createModeSelector = () => {
  return async () => {
    const { mode } = await prompts({
      name: 'mode',
      type: 'select',
      message: 'What would you like to do?',
      choices: [
        { value: CliMode.Text, title: '🔠 Render some text' },
        { value: CliMode.Font, title: '✒️  Change the font' },
        { value: CliMode.BgColor, title: '🎨 Pick a background color' },
        { value: CliMode.FgColor, title: '🎨 Pick a foreground color' },
        { value: CliMode.Brightness, title: '🌟 Set the display brightness' },
        { value: CliMode.Exit, title: '🚪 Exit' },
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
      message: 'Input text to display or press escape to go back',
    });
  };
};



// tslint:disable-next-line: cyclomatic-complexity
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
      // .filter(path => !Number.isSafeInteger(+basename(path, fontExt)[0]))
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
      // Set some default values
      matrix
        .font(fontList[0])
        .fgColor(Colors.Purple);
    }

    const fonts: FontMap = fontList.reduce((map, font) => ({ ...map, [font.name()]: font }), { });

    const chooseBgColor = createColorSelector('background', Colors);
    const chooseFgColor = createColorSelector('foreground', Colors);
    const chooseMode = createModeSelector();
    const chooseFont = createFontSelector(fontList);
    const inputText = createTextPrompter();
    const setBrightness = createBrightnessPrompter();

    // Maintain a thunk of the latest render operation so that it can be repeated when options change
    let render = () => { };

    while (true) {
      switch (await chooseMode()) {
        case CliMode.BgColor: {
          while (true) {
            const { color } = await chooseBgColor(matrix.bgColor());
            if (color && Number.isSafeInteger(+color)) {
              matrix.bgColor(+color);
              render();
            }
            else break;
          }
          break;
        }
        case CliMode.FgColor: {
          while (true) {
            const { color } = await chooseFgColor(matrix.fgColor());
            if (color && Number.isSafeInteger(+color)) {
              matrix.fgColor(+color);
              render();
            }
            else break;
          }
          break;
        }
        case CliMode.Font: {
          while (true) {
            const { font } = await chooseFont(matrix.font());
            if (font in fonts) {
              matrix.font(fonts[font]);
              render();
            }
            else break;
          }

          break;
        }
        case CliMode.Brightness: {
          while (true) {
            const { brightness } = await setBrightness(matrix.brightness());
            if (Number.isSafeInteger(brightness)) {
              matrix.brightness(brightness);
              render();
            }
            else break;
          }
          break;
        }
        case CliMode.Text: {
          // Stay in text mode until escaped
          while (true) {
            const { text } = await inputText();
            // Go back to mode select if escape was pressed (text will be undefined)
            if (typeof text !== 'string') break;
            // Otherwise, show'em some text and thunk the operation
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

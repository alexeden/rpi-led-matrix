import { FontInstance } from './types';

export interface Glyph {
  h: number;
  w: number;
  char: string;
}

export interface MappedGlyph extends Glyph {
  x: number;
  y: number;
}

export type Word = Glyph[];
export type Line = Word[];


class TextWrapper {
  readonly lines: Glyph[][] = [[]];
  readonly space: Glyph;
  readonly fontH: number;
  constructor(
    readonly font: FontInstance,
    private readonly w: number,
    private readonly h: number
  ) {
    this.fontH = this.font.height();

    this.space = {
      w: this.font.stringWidth(' '),
      h: this.fontH,
      char: ' ',
    };
  }

  private get currentLine(): Glyph[] {
    return this.lines[this.lines.length - 1];
  }

  private get currentLineString(): string {
    return this.currentLine.map(line => line.char).join(' ');
  }

  private get currentLineWidth() {
    return this.font.stringWidth(this.currentLineString);
  }

  get wrappedHeight() {
    return this.lines.length * this.font.height();
  }

  get fits() {
    return this.wrappedHeight <= this.h;
  }

  addWord(word: string) {
    const wordWidth = this.font.stringWidth(word);

    if (this.currentLineWidth > 0) {
      // Start a new line if there's no room for this word
      if (this.currentLineWidth + this.space.w + wordWidth > this.w) {
        this.lines.push([]);
      }
      // Otherwise append a space
      else {
        this.currentLine.push({ ...this.space });
      }
    }
    // Convert word to glyphs
    const glyphs: Glyph[] = word.split('').map((char, index) => ({
      w: this.font.stringWidth(char),
      h: this.fontH,
      char,
      index,
    }));

    this.currentLine.push(...glyphs);
  }

  getLineWidth(line: Glyph[]) {
    return this.font.stringWidth(line.map(g => g.char).join(''));
  }
}

interface WrappedText {
  glyphs: MappedGlyph[];
  fits: boolean;
}

const isSeparator = ({ char }: Glyph) => char === ' ';

export const glphysToWords = (glphys: Glyph[]): Word[] => {
  const index = glphys
    .map((g, i) => i === 0 && isSeparator(g) ? null : g.char)
    .indexOf(' ');

  return index > 0
    ? [glphys.slice(0, index), ...glphysToWords(glphys.slice(index))]
    : [glphys];
};

export const calcWordWidth = (gs: Glyph[]) => gs.reduce((sum, { w }) => sum + w, 0);

export const wordsToLines = (maxWidth: number, words: Word[]): Line[] => {
  const lines: Line[] = [];
  let tmpLine: Line = [];
  let tmpLineWidth = 0;

  words.filter(({ length }) => length > 0).forEach(word => {
    const wordWidth = calcWordWidth(word);
    if (tmpLineWidth + wordWidth > maxWidth) {
      lines.push(tmpLine);
      const firstWord = word.filter(g => !isSeparator(g));
      tmpLine = [ firstWord ];
      tmpLineWidth = calcWordWidth(firstWord);
    }
    else {
      tmpLine.push(word);
      tmpLineWidth += wordWidth;
    }
  });

  if (tmpLine.length > 0) lines.push(tmpLine);

  return lines;
};

export enum HorizontalAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export enum VerticalAlignment {
  Bottom = 'bottom',
  Middle = 'middle',
  Top = 'top',
}

export class LayoutUtils {
  static wrapTextToLines(font: FontInstance, maxW: number, text: string): Line[] {
    const fontHeight = font.height();
    const glphys = text.split('').map(char => ({
      char,
      h: fontHeight,
      w: font.stringWidth(char),
    }));

    return wordsToLines(maxW, glphysToWords(glphys));
  }

  static mapLinesToContainer(lines: Line[], lineH: number, containerW: number, containerH: number): MappedGlyph[] {

    return [];
  }

  static wrapText(font: FontInstance, containerW: number, h: number, text: string): WrappedText {
    const wrapper = new TextWrapper(font, containerW, h);
    const fontHeight = font.height();

    const gs: Glyph[] = text.split('').map(char => ({
      char,
      h: fontHeight,
      w: font.stringWidth(char),
    }));

    const words = glphysToWords(gs);
    const lines = wordsToLines(containerW, words);

    console.log(JSON.stringify(lines, null, 4));

    text.split(' ').forEach(word => {
      wrapper.addWord(word);
    });

    const lineHeight = font.height();
    const offsetY = Math.floor((h - wrapper.lines.length * lineHeight) / 2);

    return {
      fits: wrapper.fits,
      glyphs: wrapper.lines.flatMap((line, i) => {
        const lineW = wrapper.getLineWidth(line);
        let offsetX = Math.round((containerW - lineW) / 2);

        return line.map(glyph => {
          const mapped = {
            ...glyph,
            x: offsetX,
            y: offsetY + i * font.height(),
          };
          offsetX += glyph.w;

          return mapped;
        });
      }),
    };
  }
}

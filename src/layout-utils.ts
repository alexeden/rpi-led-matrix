import { type FontInstance } from './types';

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

const isSeparator = ({ char }: Glyph) => char === ' ';

const glphysToWords = (glphys: Glyph[]): Word[] => {
  const index = glphys
    .map((g, i) => (i === 0 && isSeparator(g) ? null : g.char))
    .indexOf(' ');

  return index > 0
    ? [glphys.slice(0, index), ...glphysToWords(glphys.slice(index))]
    : [glphys];
};

const calcWordWidth = (gs: Glyph[]) => gs.reduce((sum, { w }) => sum + w, 0);

const wordsToLines = (maxWidth: number, words: Word[]): Line[] => {
  const lines: Line[] = [];
  let tmpLine: Line = [];
  let tmpLineWidth = 0;

  words
    .filter(({ length }) => length > 0)
    .forEach(word => {
      const wordWidth = calcWordWidth(word);
      if (tmpLineWidth + wordWidth > maxWidth) {
        lines.push(tmpLine);
        const firstWord = word.filter(g => !isSeparator(g));
        tmpLine = [firstWord];
        tmpLineWidth = calcWordWidth(firstWord);
      } else {
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
  static textToLines(font: FontInstance, maxW: number, text: string): Line[] {
    const fontHeight = font.height();
    const glphys = text.split('').map(char => ({
      char,
      h: fontHeight,
      w: font.stringWidth(char),
    }));

    return wordsToLines(maxW, glphysToWords(glphys));
  }

  static linesToMappedGlyphs(
    lines: Line[],
    lineH: number,
    containerW: number,
    containerH: number,
    alignH = HorizontalAlignment.Center,
    alignV = VerticalAlignment.Middle
  ): MappedGlyph[] {
    const blockH = lineH * lines.length;

    const offsetY = (() => {
      switch (alignV) {
        case VerticalAlignment.Top:
          return 0;
        case VerticalAlignment.Middle:
          return Math.floor((containerH - blockH) / 2);
        case VerticalAlignment.Bottom:
          return containerH - blockH;
      }
    })();

    return lines
      .map((words, i) => {
        const lineGlyphs = words.reduce(
          (glyphs, word) => [...glyphs, ...word],
          []
        );
        const lineW = calcWordWidth(lineGlyphs);
        let offsetX = (() => {
          switch (alignH) {
            case HorizontalAlignment.Left:
              return 0;
            case HorizontalAlignment.Center:
              return Math.floor((containerW - lineW) / 2);
            case HorizontalAlignment.Right:
              return containerW - lineW;
          }
        })();

        return lineGlyphs.map(glyph => {
          const mapped = {
            ...glyph,
            x: offsetX,
            y: offsetY + i * lineH,
          };
          offsetX += glyph.w;

          return mapped;
        });
      })
      .reduce((glyphs, words) => [...glyphs, ...words], []);
  }
}

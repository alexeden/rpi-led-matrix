import { FontInstance } from './types';

interface Glyph {
  h: number;
  w: number;
  char: string;
}

type MappedGlyph = Glyph & { x: number; y: number };

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

    // Start a new line if there's no room for this word
    if (this.currentLineWidth + this.space.w + wordWidth > this.w) {
      this.lines.push([]);
    }
    // Otherwise append a space
    else {
      this.currentLine.push({ ...this.space });
    }
    // Convert word to glyphs
    const glyphs: Glyph[] = word.split('').map(char => ({
      w: this.font.stringWidth(char),
      h: this.fontH,
      char,
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

export class LayoutUtils {
  static wrapText(font: FontInstance, w: number, h: number, text: string): WrappedText {
    const wrapper = new TextWrapper(font, w, h);

    const words = text.split(' ');
    words.forEach(word => {
      wrapper.addWord(word);
    });

    const lineHeight = font.height();
    const offsetY = Math.floor((h - wrapper.lines.length * lineHeight) / 2);

    return {
      fits: wrapper.fits,
      glyphs: wrapper.lines.flatMap((line, i) => {
        const lineW = wrapper.getLineWidth(line);
        let offsetX = Math.floor((w - lineW) / 2);

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

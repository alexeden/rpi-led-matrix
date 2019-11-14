class Pixel {
  constructor(
    readonly row: number,
    readonly col: number,
    readonly data: DataView
  ) {
    switch (this.col % 3) {
      case 0: this.hex(0xFF0000); break;
      case 1: this.hex(0x00FF00); break;
      case 2: this.hex(0x0000FF); break;
    }
  }

  hex(hex?: number) {
    if (typeof hex === 'number') {
      this.data.setUint8(0, hex & 0xFF);
      this.data.setUint8(1, hex >> 8 & 0xFF);
      this.data.setUint8(2, hex >> 16 & 0xFF);
    }
    else {
      return (this.data.getUint8(0) << 16)
        | (this.data.getUint8(1) << 8)
        | (this.data.getUint8(2));
    }
  }
}

export class MatrixArrayBuffer extends ArrayBuffer {
  static readonly pixelBytes = 3;
  // static readonly rowIdBytes = 4;

  private readonly colInds: number[];
  private readonly rowInds: number[];

  private readonly pixels: Pixel[];

  constructor(
    readonly rows: number,
    readonly cols: number
  ) {
    super(MatrixArrayBuffer.pixelBytes * rows * cols);
    (window as any).matrixArrayBuffer = this;

    this.rowInds = [...Array(rows).keys()];
    this.colInds = [...Array(cols).keys()];

    this.pixels = this.rowInds.flatMap(r =>
      this.colInds.map(c =>
        new Pixel(r, c, new DataView(this, 3 * (r * cols + c), 3))
      )
    );
  }
}

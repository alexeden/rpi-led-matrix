export class MatrixArrayBuffer extends ArrayBuffer {
  static readonly pixelBytes = 3;
  // static readonly rowIdBytes = 4;

  private readonly colInds: number[];
  private readonly rowInds: number[];

  constructor(
    readonly m: number,
    readonly n: number
  ) {
    super(MatrixArrayBuffer.pixelBytes * m * n);
    (window as any).matrixArrayBuffer = this;

    this.rowInds = [...Array(m).keys()];
    this.colInds = [...Array(n).keys()];

    // // Set the row marker bytes
    // const bytesPerRow = n + MatrixArrayBuffer.rowIdBytes;
    // this.rowInds.forEach(r => {
    //   const
    // });
  }
}

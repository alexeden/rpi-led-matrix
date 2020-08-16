/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as fs from 'fs/promises';
import * as path from 'path';
import { matrixFromOptions, } from '../src';
import { matrixOptions, runtimeOptions, } from './_config';

const { parseGIF, decompressFrames, } = require('gifuct-js');
const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

interface Frame {
  delay: number;
  dims: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  patch: Uint8ClampedArray;
}

(async () => {
  try {
    const matrix = matrixFromOptions(matrixOptions, runtimeOptions);
    matrix.imageSmoothingEnabled = true;
    matrix.quality = 'bilinear';

    const gifBuffer = await fs.readFile(path.resolve(__dirname, './party-parrot-h32.gif'));
    const parsed = parseGIF(gifBuffer);
    const frames: Frame[] = decompressFrames(parsed, true);
    const imageCanvases = frames.map(({ dims, patch, }) => {
      const temp = matrix.createTemporaryContext(dims.width, dims.height);
      const imageData = temp.createImageData(dims.width, dims.height);
      imageData.data.set(patch);
      temp.putImageData(imageData, 0, 0);

      return temp.canvas;
    });

    console.log(`there are ${frames.length} frames`);

    // let x = 0
    const draw = async (index: number) => {
      matrix.drawImage(imageCanvases[index], 0, 0);
      matrix.sync();
      await wait(40);
      draw(index >= imageCanvases.length - 1 ? 0 : index + 1);
    };

    draw(0);
  }
  catch (error) {
    console.error(error);
  }
})();

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as fs from 'fs/promises';
import * as path from 'path';
import { matrixFromOptions, registerFont, } from '../src';
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
    const temp = matrix.createTemporaryContext();
    const gifBuffer = await fs.readFile(path.resolve(__dirname, './party-parrot.gif'));
    const parsed = parseGIF(gifBuffer);
    const frames: Frame[] = decompressFrames(parsed, true);

    console.log(`there are ${frames.length} frames`);

    const draw = (index: number) => {
      const { patch, delay, dims, } = frames[index];
      console.log(index, dims);

      const imageData = temp.createImageData(dims.width, dims.height);
      imageData.data.set(patch);
      temp.putImageData(imageData, 0, 0);
      matrix.drawImage(temp.canvas, dims.left, dims.top);
      matrix.sync();
      wait(10 * delay).then(() => draw(index >= frames.length - 1 ? 0 : index + 1));
    };

    draw(0);

  }
  catch (error) {
    console.error(error);
  }
})();


// export const deinterlace = (pixels: number[], width: number) => {
//   const newPixels = new Array(pixels.length);
//   const rows = pixels.length / width;

//   const cpRow = (toRow: number, fromRow: number) => {
//     const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
//     newPixels.splice.apply(newPixels, [ toRow * width, width, ...fromPixels, ]);
//   };

//   // See appendix E.
//   const offsets = [ 0, 4, 2, 1, ];
//   const steps = [ 8, 8, 4, 2, ];

//   let fromRow = 0;
//   for (let pass = 0; pass < 4; pass++) {
//     for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
//       cpRow(toRow, fromRow);
//       fromRow++;
//     }
//   }

//   return newPixels;
// };


// /**
//  * javascript port of java LZW decompression
//  * Original java author url: https://gist.github.com/devunwired/4479231
//  */

// export const lzw = (minCodeSize: number, data: number[], pixelCount: number) => {
//   const MAX_STACK_SIZE = 4096;
//   const nullCode = -1;
//   const npix = pixelCount;
//   let available;
//   let code_mask;
//   let code_size;
//   let code;
//   let i;
//   let in_code;
//   let old_code;

//   const dstPixels = new Array(pixelCount);
//   const prefix = new Array(MAX_STACK_SIZE);
//   const suffix = new Array(MAX_STACK_SIZE);
//   const pixelStack = new Array(MAX_STACK_SIZE + 1);

//   // Initialize GIF data stream decoder.
//   const data_size = minCodeSize;
//   const clear = 1 << data_size;
//   const end_of_information = clear + 1;
//   available = clear + 2;
//   old_code = nullCode;
//   code_size = data_size + 1;
//   code_mask = (1 << code_size) - 1;
//   for (code = 0; code < clear; code++) {
//     prefix[code] = 0;
//     suffix[code] = code;
//   }

//   // Decode GIF pixel stream.
//   let datum;
//   let bits;
//   let count;
//   let first;
//   let top;
//   let pi;
//   let bi;

//   datum = bits = count = first = top = pi = bi = 0;

//   for (i = 0; i < npix; ) {
//     if (top === 0) {
//       if (bits < code_size) {
//         // get the next byte
//         datum += data[bi] << bits;

//         bits += 8;
//         bi++;
//         continue;
//       }
//       // Get the next code.
//       code = datum & code_mask;
//       datum >>= code_size;
//       bits -= code_size;
//       // Interpret the code
//       if (code > available || code == end_of_information) {
//         break;
//       }
//       if (code == clear) {
//         // Reset decoder.
//         code_size = data_size + 1;
//         code_mask = (1 << code_size) - 1;
//         available = clear + 2;
//         old_code = nullCode;
//         continue;
//       }
//       if (old_code == nullCode) {
//         pixelStack[top++] = suffix[code];
//         old_code = code;
//         first = code;
//         continue;
//       }
//       in_code = code;
//       if (code == available) {
//         pixelStack[top++] = first;
//         code = old_code;
//       }
//       while (code > clear) {
//         pixelStack[top++] = suffix[code];
//         code = prefix[code];
//       }

//       first = suffix[code] & 0xff;
//       pixelStack[top++] = first;

//       // add a new string to the table, but only if space is available
//       // if not, just continue with current table until a clear code is found
//       // (deferred clear code implementation as per GIF spec)
//       if (available < MAX_STACK_SIZE) {
//         prefix[available] = old_code;
//         suffix[available] = first;
//         available++;
//         if ((available & code_mask) === 0 && available < MAX_STACK_SIZE) {
//           code_size++;
//           code_mask += available;
//         }
//       }
//       old_code = in_code;
//     }
//     // Pop a pixel off the pixel stack.
//     top--;
//     dstPixels[pi++] = pixelStack[top];
//     i++;
//   }

//   for (i = pi; i < npix; i++) {
//     dstPixels[i] = 0; // clear missing pixels
//   }

//   return dstPixels;
// };



// export const parseGIF = arrayBuffer => {
//   const byteData = new Uint8Array(arrayBuffer);
//   return parse(buildStream(byteData), GIF);
// };

// const generatePatch = image => {
//   const totalPixels = image.pixels.length;
//   const patchData = new Uint8ClampedArray(totalPixels * 4);
//   for (let i = 0; i < totalPixels; i++) {
//     const pos = i * 4;
//     const colorIndex = image.pixels[i];
//     const color = image.colorTable[colorIndex];
//     patchData[pos] = color[0];
//     patchData[pos + 1] = color[1];
//     patchData[pos + 2] = color[2];
//     patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0;
//   }

//   return patchData;
// };

// export const decompressFrame = (frame, gct, buildImagePatch) => {
//   if (!frame.image) {
//     console.warn('gif frame does not have associated image.');
//     return;
//   }

//   const { image, } = frame;

//   // get the number of pixels
//   const totalPixels = image.descriptor.width * image.descriptor.height;
//   // do lzw decompression
//   let pixels = lzw(image.data.minCodeSize, image.data.blocks, totalPixels);

//   // deal with interlacing if necessary
//   if (image.descriptor.lct.interlaced) {
//     pixels = deinterlace(pixels, image.descriptor.width);
//   }

//   const resultImage = {
//     pixels: pixels,
//     dims: {
//       top: frame.image.descriptor.top,
//       left: frame.image.descriptor.left,
//       width: frame.image.descriptor.width,
//       height: frame.image.descriptor.height,
//     },
//   };

//   // color table
//   if (image.descriptor.lct && image.descriptor.lct.exists) {
//     resultImage.colorTable = image.lct;
//   }
//   else {
//     resultImage.colorTable = gct;
//   }

//   // add per frame relevant gce information
//   if (frame.gce) {
//     resultImage.delay = (frame.gce.delay || 10) * 10; // convert to ms
//     resultImage.disposalType = frame.gce.extras.disposal;
//     // transparency
//     if (frame.gce.extras.transparentColorGiven) {
//       resultImage.transparentIndex = frame.gce.transparentColorIndex;
//     }
//   }

//   // create canvas usable imagedata if desired
//   if (buildImagePatch) {
//     resultImage.patch = generatePatch(resultImage);
//   }

//   return resultImage;
// };

// export const decompressFrames = (parsedGif, buildImagePatches) => {
//   return parsedGif.frames
//     .filter(f => f.image)
//     .map(f => decompressFrame(f, parsedGif.gct, buildImagePatches));
// };

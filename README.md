# Raspberry Pi LED Matrix

Control an RGB LED matrix connected to a Raspberry Pi using using Node.js. This library is a Node/Typescript binding of the brilliant [hzeller/rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix) library, plus some additional functionality. Builds on some of the mechanisms implemented by [easybotics/node-rpi-rgb-led-matrix](https://github.com/easybotics/node-rpi-rgb-led-matrix) for double-buffering bitframes to get silky-smooth rendering.

## Features

- Uses [N-API](https://nodejs.org/api/n-api.html) to wrap the native code, so there's no risk of breakages with future Node.js version upgrades.
- One-to-one mapping of both [matrix and runtime configuration options/flags](https://nodejs.org/api/n-api.html) exposed by native library.
- **Configuration options and API are fully documented in source and typed in TypeScript.** Getting configured and up and running should be a breeze with the help of the provided enums and type checking.
- Includes a set of utility methods for displaying text with a specified vertical and horizontal alignment.

## Installation and Usage

Install the package:

```
$ npm install --save rpi-led-matrix
```

> **Note** If you're installing the package on a non-Linux (and therefore non-Raspberry Pi) machine, you'll get warnings from `node-gyp` that the compilation of the addon module is being skipped. This is to be expected. The warnings will disappear when the package is installed on an actual Raspberry Pi.

Usage:

```
// In a .ts file
import * as matrix from 'rpi-led-matrix';

// Or, in a .js file
const matrix = require('rpi-led-matrix');
```



## Developing Locally

- Make sure you have [passwordless SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md) access to your Raspberry Pi.
- Clone/fork this repo onto both your local machine and your Raspberry Pi.
- `npm install` inside both repos.
- Locally, create a file called `sync.config.json` with these values:

```
{
  "username": "<username>",
  "hostname": "<hostname or IP address of your Pi>",
  "directory": "<parent directory on Pi into which the repo was cloned>",
  "quiet": <true|false> // Disable most rsync logs (defaults to false)
}
```

- Locally, you can now run `npm run sync-changes`, and any changes made to files inside `/src` will automatically be uploaded to your Pi.
- From the Pi, you can run `npm run build-changes`, and any changes pushed to `/src` will automatically be rebuilt. You can run additional scripts (test scripts, etc) by appending the shell commands to the `exec` property inside `nodemon.build.json`.

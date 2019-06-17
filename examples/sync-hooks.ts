import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';


(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    matrix.afterSync((m, dt, t) => {
      console.log(`After sync hook called! Time since last sync = ${dt}`);
    });

    setInterval(() => matrix.sync(), 1000);

  }
  catch (error) {
    console.error(error);
  }
})();

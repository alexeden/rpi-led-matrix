#define FOREBLU  "\x1B[34m"
#define FOREMAG  "\x1B[35m"
#define RESETTEXT  "\x1B[0m"
#include <napi.h>
#include <iostream>
#include "node-led-matrix.h"

/**
 *  RGBMatrix::Options led_options;
 *	rgb_matrix::RuntimeOptions runtime;
 *
 *	// Set defaults
 *	led_options.chain_length = 3;
 *	led_options.show_refresh_rate = true;
 *	runtime.drop_privileges = 1;
 *	if (!rgb_matrix::ParseOptionsFromFlags(&argc, &argv, &led_options, &runtime)) {
 *	  rgb_matrix::PrintMatrixFlags(stderr);
 *	  return 1;
 *	}
 *
 *  RGBMatrix *matrix = CreateMatrixFromOptions(led_options, runtime);
 *	if (matrix == NULL) {
 *    return 1;
 *  }
 *	delete matrix;   // Make sure to delete it in the end to switch off LEDs.
 */


Napi::Object Init(Napi::Env env, Napi::Object exports) {
	std::cout << FOREMAG;
	return NodeLedMatrix::Init(env, exports);
	std::cout << RESETTEXT << std::endl;
}

NODE_API_MODULE(spi, Init)

#include <napi.h>

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

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    Napi::Object modes = Napi::Object::New(env);
    exports.Set("modes", modes);
    return exports;
}

NODE_API_MODULE(spi, Init)

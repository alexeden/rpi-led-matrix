#if __linux__
	#include "led-matrix.addon.h"
	#include "chain-link-pixel-mapper.cc"
	#include "default-runtime-options.h"
	#include <napi.h>

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("isSupported", Napi::Boolean::New(env, true));
    exports.Set("defaultRuntimeOptions", Napi::Function::New(env, &default_runtime_options));
	rgb_matrix::RegisterPixelMapper(new ChainLinkPixelMapper());

	LedMatrixAddon::Init(env, exports);
	return exports;
}

NODE_API_MODULE(rpi_led_matrix, Init)
#else
	#pragma GCC diagnostic ignored "-Wunused-private-field"
	#pragma GCC diagnostic ignored "-Wunused-variable"
	#ifdef __GNUC__
		#warning "Local machine is not a Raspberry Pi; skipping compilation of native module."
	#else
		#pragma message("Local machine is not a Raspberry Pi; skipping compilation of native module.")
	#endif

#include <napi.h>

Napi::Value Throw(const Napi::CallbackInfo& info) {
	throw Napi::Error::New(info.Env(), "Can't instantiate the LED Matrix addon because this isn't a Raspberry Pi.");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("isSupported", Napi::Boolean::New(env, false));
	exports.Set("NativeLedMatrix", Napi::Function::New(env, Throw));
	exports.Set("Font", Napi::Function::New(env, Throw));
	return exports;
}

NODE_API_MODULE(rpi_led_matrix, Init)

#endif

#include "font.addon.h"
#include "led-matrix.addon.h"
#include <napi.h>

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	LedMatrixAddon::Init(env, exports);
	FontAddon::Init(env, exports);
	return exports;
}

NODE_API_MODULE(spi, Init)

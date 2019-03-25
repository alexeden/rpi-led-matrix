#include <napi.h>
#include "node-led-matrix.h"
#include "font.addon.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	NodeLedMatrix::Init(env, exports);
	FontAddon::Init(env, exports);
	return exports;
}

NODE_API_MODULE(spi, Init)

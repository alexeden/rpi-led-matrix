#include <napi.h>
#include "node-led-matrix.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	return NodeLedMatrix::Init(env, exports);
}

NODE_API_MODULE(spi, Init)

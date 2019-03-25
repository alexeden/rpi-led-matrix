#ifndef FONTADDON_H
#define FONTADDON_H

#include <iostream>
#include <napi.h>
#include <graphics.h>

using namespace rgb_matrix;

class FontAddon : public Napi::ObjectWrap<FontAddon> {
public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
    FontAddon(const Napi::CallbackInfo &info);
	~FontAddon();

private:
	static Napi::FunctionReference constructor;

	Font *font_;
};

#endif

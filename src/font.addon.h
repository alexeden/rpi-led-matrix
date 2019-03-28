#ifndef FONTADDON_H
#define FONTADDON_H

#include "helpers.cc"
#include <graphics.h>
#include <iostream>
#include <napi.h>

using namespace rgb_matrix;

class FontAddon : public Napi::ObjectWrap<FontAddon> {
  public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
	FontAddon(const Napi::CallbackInfo& info);
	~FontAddon();

	Napi::Value height(const Napi::CallbackInfo& info);
	Napi::Value baseline(const Napi::CallbackInfo& info);
	Napi::Value string_width(const Napi::CallbackInfo& info);
	Font font;

  private:
	static Napi::FunctionReference constructor;
};

#endif

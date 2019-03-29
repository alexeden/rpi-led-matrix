#include "font.addon.h"

Napi::FunctionReference FontAddon::constructor;

Napi::Object FontAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(
	  env,
	  "Font",
	  { InstanceMethod("baseline", &FontAddon::baseline),
		InstanceMethod("height", &FontAddon::height),
		InstanceMethod("path", &FontAddon::path),
		InstanceMethod("stringWidth", &FontAddon::string_width) });

	constructor = Napi::Persistent(func);
	constructor.SuppressDestruct();

	exports.Set("Font", func);

	return exports;
}

FontAddon::FontAddon(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<FontAddon>(info)
  , path_("") {
	auto env = info.Env();
	if (!info[0].IsString()) {
		throw Napi::Error::New(env, "Font constructor expects its first parameter to be a path to the font asset.");
	}
	Napi::HandleScope scope(env);
	path_ = info[0].As<Napi::String>().ToString();

	if (!font.LoadFont(path_.c_str())) throw Napi::Error::New(env, "Failed to load font located at " + path_);
}

FontAddon::~FontAddon(void) {
	std::cerr << "Destroying font" << std::endl;
}

Napi::Value FontAddon::baseline(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), font.baseline());
}

Napi::Value FontAddon::height(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), font.height());
}

Napi::Value FontAddon::path(const Napi::CallbackInfo& info) {
	return Napi::String::New(info.Env(), path_);
}

Napi::Value FontAddon::string_width(const Napi::CallbackInfo& info) {
	const std::string str = info[0].As<Napi::String>().ToString();
	const auto kerning	= info[1].IsNumber() ? info[1].As<Napi::Number>().Int32Value() : 0;
	int sum				  = 0;

	for (auto c : str) {
		uint32_t codepoint = uint_least32_t(c);
		int width		   = font.CharacterWidth(codepoint) + kerning;
		if (width < 0) throw Napi::Error::New(info.Env(), "Character not found for this font.");
		sum += width;
	}

	return Napi::Number::New(info.Env(), sum);
}

#include "font.addon.h"

Napi::FunctionReference FontAddon::constructor;

Napi::Object FontAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::HandleScope scope(env);

	Napi::Function func = DefineClass(
		env,
		"Font",
		{ InstanceMethod("baseline", &FontAddon::baseline),
		  InstanceMethod("height", &FontAddon::height),
		  InstanceMethod("name", &FontAddon::name),
		  InstanceMethod("path", &FontAddon::path),
		  InstanceMethod("stringWidth", &FontAddon::string_width) });

	constructor = Napi::Persistent(func);
	constructor.SuppressDestruct();

	exports.Set("Font", func);

	return exports;
}

FontAddon::FontAddon(const Napi::CallbackInfo& info)
	: Napi::ObjectWrap<FontAddon>(info)
	, name_(info[0].As<Napi::String>().ToString())
	, path_(info[1].As<Napi::String>().ToString()) {
	auto env = info.Env();
	Napi::HandleScope scope(env);
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

Napi::Value FontAddon::name(const Napi::CallbackInfo& info) {
	return Napi::String::New(info.Env(), name_);
}

Napi::Value FontAddon::path(const Napi::CallbackInfo& info) {
	return Napi::String::New(info.Env(), path_);
}

Napi::Value FontAddon::string_width(const Napi::CallbackInfo& info) {
	const std::string str = info[0].As<Napi::String>().ToString();
	const auto kerning  = info[1].IsNumber() ? info[1].As<Napi::Number>().Int32Value() : 0;
	int sum               = 0;

	for (auto c : str) {
		uint32_t codepoint = uint_least32_t(c);
		int width          = font.CharacterWidth(codepoint) + kerning;
		if (width < 0) {
			std::cout << "\"" << c << "\" character not found for the " << name_ << " font." << std::endl;
			width = 0;
		}
		sum += width;
	}

	return Napi::Number::New(info.Env(), sum);
}

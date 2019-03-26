#include "font.addon.h"

Napi::FunctionReference FontAddon::constructor;

Napi::Object FontAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(env, "Font", {
		// InstanceMethod("baseline", &FontAddon::baseline),
		// InstanceMethod("height", &FontAddon::height),
		// InstanceMethod("stringWidth", &FontAddon::string_width)
	});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
	exports.Set("Font", func);

	return exports;
}

// Napi::Object FontAddon::NewInstance(Napi::Value name, Napi::Value path) {
// 	return constructor.New({ arg });
// }

FontAddon::FontAddon(const Napi::CallbackInfo &info) : Napi::ObjectWrap<FontAddon>(info) {
	std::cerr << "Constructing a new FontAddon" << std::endl;
	auto env = info.Env();

	if (!info[0].IsString()) {
		throw Napi::Error::New(env, "Font constructor expects its first parameter to be a path to the font asset.");
	}

	const auto path = helpers::string_to_c_str(info[0].As<Napi::String>().ToString());

	if (!font_.LoadFont(path)) {
		throw Napi::Error::New(env, "Failed to load font");
	}

	std::cerr << "Path to font: " << path << " height: " << font_.height() << std::endl;

}

FontAddon::~FontAddon(void) {
	std::cerr << "Destroying font" << std::endl;
	// this->font_->~Font();
}

// Font FontAddon::font(void) {
// 	return font_;
// }

// Napi::Value FontAddon::baseline(const Napi::CallbackInfo& info) {
// 	return Napi::Number::New(info.Env(), this->font_->baseline());
// }

// Napi::Value FontAddon::height(const Napi::CallbackInfo& info) {
// 	return Napi::Number::New(info.Env(), this->font_->height());
// }

// Napi::Value FontAddon::string_width(const Napi::CallbackInfo& info) {
// 	const std::string str = info[0].As<Napi::String>().ToString();
// 	int sum = 0;

// 	for(auto c : str) {
// 		uint32_t codepoint = uint_least32_t(c);
// 		int width = this->font_->CharacterWidth(codepoint);
// 		if (width < 0) throw Napi::Error::New(info.Env(), "Character not found for this font.");
// 		sum += width;
// 	}

// 	return Napi::Number::New(info.Env(), sum);
// }

#include "font.addon.h"

Napi::FunctionReference FontAddon::constructor;

Napi::Object FontAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(env, "Font", {
	});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
	exports.Set("Font", func);

	return exports;
}

FontAddon::FontAddon(const Napi::CallbackInfo &info) : Napi::ObjectWrap<FontAddon>(info) {
	auto env = info.Env();

	if (!info[0].IsString()) {
		throw Napi::Error::New(env, "Font constructor expects its first parameter to be a path to the font asset.");
	}

	const auto path = helpers::string_to_c_str(info[0].As<Napi::String>().ToString());

	this->font_ = new Font();
	if (!this->font_->LoadFont(path)) {
		throw Napi::Error::New(env, "Failed to load font");
	}

	std::cerr << "Path to font: " << path << " height: " << this->font_->height() << std::endl;

}

FontAddon::~FontAddon(void) {
	std::cerr << "Destroying font" << std::endl;
	this->font_->~Font();
}

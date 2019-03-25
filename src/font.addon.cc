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

	this->font_ = new Font();
}

FontAddon::~FontAddon(void) {
	std::cerr << "Destroying font" << std::endl;
	this->font_->~Font();
}

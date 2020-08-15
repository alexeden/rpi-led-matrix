#include "led-matrix.addon.h"

inline double get_now_ms() {
	struct timespec t;
	if (clock_gettime(CLOCK_MONOTONIC_RAW, &t) < 0) { throw "Failed to get the current time."; }

	return (t.tv_sec * 1000) + (t.tv_nsec / 1000000);
}

using namespace rgb_matrix;

Napi::FunctionReference LedMatrixAddon::constructor;

Napi::Object LedMatrixAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(
	  env,
	  "NativeLedMatrix",
	  { InstanceMethod("afterSync", &LedMatrixAddon::after_sync),
		InstanceMethod("bgColor", &LedMatrixAddon::bg_color),
		InstanceMethod("brightness", &LedMatrixAddon::brightness),
		InstanceMethod("clear", &LedMatrixAddon::clear),
		InstanceMethod("drawBuffer", &LedMatrixAddon::draw_buffer),
		InstanceMethod("drawCircle", &LedMatrixAddon::draw_circle),
		InstanceMethod("drawLine", &LedMatrixAddon::draw_line),
		InstanceMethod("drawRect", &LedMatrixAddon::draw_rect),
		InstanceMethod("fgColor", &LedMatrixAddon::fg_color),
		InstanceMethod("fill", &LedMatrixAddon::fill),
		InstanceMethod("getAvailablePixelMappers", &LedMatrixAddon::get_available_pixel_mappers),
		InstanceMethod("height", &LedMatrixAddon::height),
		InstanceMethod("luminanceCorrect", &LedMatrixAddon::luminance_correct),
		InstanceMethod("map", &LedMatrixAddon::map),
		InstanceMethod("pwmBits", &LedMatrixAddon::pwm_bits),
		InstanceMethod("setPixel", &LedMatrixAddon::set_pixel),
		InstanceMethod("sync", &LedMatrixAddon::sync),
		InstanceMethod("width", &LedMatrixAddon::width) });

	constructor = Napi::Persistent(func);
	constructor.SuppressDestruct();
	exports.Set("NativeLedMatrix", func);

	return exports;
}

/**
 * Process matrix & runtime options and initialize the internal RGBMatrix.
 */
LedMatrixAddon::LedMatrixAddon(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<LedMatrixAddon>(info)
  , after_sync_cb_(Napi::FunctionReference())
  , fg_color_(Color(0, 0, 0))
  , bg_color_(Color(0, 0, 0))
  , t_start_(get_now_ms())
  , t_sync_ms_(0)
  , t_dsync_ms_(0) {
	auto env = info.Env();

	if (!info[0].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of matrix options!");
	}
	if (!info[1].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of runtime options!");
	}
	auto matrixOpts	 = matrix_options_from_js_object(env, info[0].As<Napi::Object>());
	auto runtimeOpts = runtime_options_from_js_object(env, info[1].As<Napi::Object>());

	this->matrix_ = CreateMatrixFromOptions(matrixOpts, runtimeOpts);
	this->canvas_ = this->matrix_->CreateFrameCanvas();

	if (this->matrix_ == NULL) { throw Napi::Error::New(env, "Failed to create matrix."); }
}

LedMatrixAddon::~LedMatrixAddon(void) {
	std::cerr << "Destroying matrix" << std::endl;
	delete matrix_;
}

Napi::Value LedMatrixAddon::sync(const Napi::CallbackInfo& info) {
	const char* data;
	size_t len;

	canvas_->Serialize(&data, &len);
	canvas_ = matrix_->SwapOnVSync(canvas_);
	if (!canvas_->Deserialize(data, len)) {
		throw Napi::Error::New(info.Env(), "Failed to sync canvas buffer with matrix.");
	}

	auto env = info.Env();

	if (!after_sync_cb_.IsEmpty()) {
		auto now	= get_now_ms();
		auto now_ms = now - t_start_;
		t_dsync_ms_ = now_ms - t_sync_ms_;
		t_sync_ms_	= now_ms;

		auto resync
		  = after_sync_cb_
			  .Call(info.This(), { info.This(), Napi::Number::New(env, t_dsync_ms_), Napi::Number::New(env, t_sync_ms_) });

		if (resync.ToBoolean() == true) { sync(info); }
	}

	return Napi::Number::New(env, 0);
}

Napi::Value LedMatrixAddon::after_sync(const Napi::CallbackInfo& info) {
	auto cb = info[0].As<Napi::Function>();

	assert(cb.IsFunction());

	after_sync_cb_ = Napi::Persistent(cb);
	after_sync_cb_.SuppressDestruct();

	return info.This();
}

Napi::Value LedMatrixAddon::map(const Napi::CallbackInfo& info) {
	auto cb = info[0].As<Napi::Function>();

	assert(cb.IsFunction());

	auto env	= info.Env();
	auto now	= get_now_ms();
	auto now_ms = Napi::Number::New(env, now - t_start_);

	Napi::Array coord_array = Napi::Array::New(env, 3);
	uint32_t zero			= 0; // The compiler can't match the overloaded signature if given 0 explicitly
	uint32_t one			= 1;
	uint32_t two			= 2;

	auto i = 0;

	for (int x = 0; x < this->matrix_->width(); x++) {
		coord_array.Set(zero, x);

		for (int y = 0; y < this->matrix_->height(); y++) {
			coord_array.Set(one, y);
			coord_array.Set(two, i++);

			auto color = cb.Call(info.This(), { coord_array, now_ms });

			assert(color.IsNumber());

			const auto hex = color.As<Napi::Number>().Uint32Value();
			this->matrix_->SetPixel(x, y, 0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
		}
	}

	return info.This();
}

Napi::Value LedMatrixAddon::brightness(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto brightness = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetBrightness(brightness);
		return info.This();
	}
	else {
		return Napi::Number::New(info.Env(), this->matrix_->brightness());
	}
}

Napi::Value LedMatrixAddon::clear(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0	 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0	 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1	 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1	 = info[3].As<Napi::Number>().Uint32Value();
		const auto black = Color(0, 0, 0);
		for (auto y = y0; y <= y1; y++) { DrawLine(this->canvas_, x0, y, x1, y, black); }
	}
	else {
		this->canvas_->Clear();
	}
	return info.This();
}

Napi::Value LedMatrixAddon::draw_buffer(const Napi::CallbackInfo& info) {
	const auto buffer = info[0].As<Napi::Buffer<uint8_t> >();
	const auto w	  = info[1].IsNumber() ? info[1].As<Napi::Number>().Uint32Value() : this->matrix_->width();
	const auto h	  = info[2].IsNumber() ? info[2].As<Napi::Number>().Uint32Value() : this->matrix_->height();
	const auto data	  = buffer.Data();
	const auto len	  = buffer.Length();

	assert(len == w * h * 3);

	Image* img	  = new Image();
	Pixel* pixels = (Pixel*) malloc(sizeof(Pixel) * w * h);
	for (unsigned int i = 0; i < w * h; i++) {
		auto j = i * 3;
		Pixel p;
		p.r(data[j]);
		p.g(data[j + 1]);
		p.b(data[j + 2]);
		pixels[i] = p;
	}

	img->setPixels(w, h, pixels);

	assert(img->isValid());

	for (unsigned int y = 0; y < h; y++) {
		if (y > h) break;
		for (unsigned int x = 0; x < w; x++) {
			if (x > w) break;
			auto pixel = img->getPixel(x, y);
			this->canvas_->SetPixel(x, y, pixel.r(), pixel.g(), pixel.b());
		}
	}

	delete img;

	return info.This();
}

Napi::Value LedMatrixAddon::draw_circle(const Napi::CallbackInfo& info) {
	const auto x = info[0].As<Napi::Number>().Uint32Value();
	const auto y = info[1].As<Napi::Number>().Uint32Value();
	const auto r = info[2].As<Napi::Number>().Uint32Value();
	DrawCircle(this->canvas_, x, y, r, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::draw_line(const Napi::CallbackInfo& info) {
	const auto x0 = info[0].As<Napi::Number>().Uint32Value();
	const auto y0 = info[1].As<Napi::Number>().Uint32Value();
	const auto x1 = info[2].As<Napi::Number>().Uint32Value();
	const auto y1 = info[3].As<Napi::Number>().Uint32Value();
	DrawLine(this->canvas_, x0, y0, x1, y1, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::draw_rect(const Napi::CallbackInfo& info) {
	const auto x0 = info[0].As<Napi::Number>().Uint32Value();
	const auto y0 = info[1].As<Napi::Number>().Uint32Value();
	const auto w  = info[2].As<Napi::Number>().Uint32Value();
	const auto h  = info[3].As<Napi::Number>().Uint32Value();

	DrawLine(this->canvas_, x0, y0, x0 + w, y0, fg_color_);
	DrawLine(this->canvas_, x0 + w, y0, x0 + w, y0 + h, fg_color_);
	DrawLine(this->canvas_, x0 + w, y0 + h, x0, y0 + h, fg_color_);
	DrawLine(this->canvas_, x0, y0 + h, x0, y0, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::fill(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1 = info[3].As<Napi::Number>().Uint32Value();
		for (auto y = y0; y <= y1; y++) { DrawLine(this->canvas_, x0, y, x1, y, fg_color_); }
	}
	else {
		this->canvas_->Fill(fg_color_.r, fg_color_.g, fg_color_.b);
	}
	return info.This();
}

Napi::Value LedMatrixAddon::height(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->height());
}

Napi::Value LedMatrixAddon::width(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->width());
}

Napi::Value LedMatrixAddon::luminance_correct(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsBoolean()) {
		auto correct = info[0].As<Napi::Boolean>().ToBoolean();
		this->matrix_->set_luminance_correct(correct);
		return info.This();
	}
	else {
		return Napi::Boolean::New(info.Env(), this->matrix_->luminance_correct());
	}
}

Napi::Value LedMatrixAddon::pwm_bits(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto bits = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetPWMBits(bits);
		return info.This();
	}
	else {
		return Napi::Number::New(info.Env(), this->matrix_->pwmbits());
	}
}

Napi::Value LedMatrixAddon::set_pixel(const Napi::CallbackInfo& info) {
	const auto x = info[0].As<Napi::Number>().Uint32Value();
	const auto y = info[1].As<Napi::Number>().Uint32Value();
	this->canvas_->SetPixel(x, y, fg_color_.r, fg_color_.g, fg_color_.b);

	return info.This();
}

Napi::Value LedMatrixAddon::fg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto color = color_from_callback_info(info);
		fg_color_  = color;
		return info.This();
	}
	else {
		return color_to_js_object(info.Env(), fg_color_);
	}
}

Napi::Value LedMatrixAddon::bg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto color = color_from_callback_info(info);
		bg_color_  = color;
		return info.This();
	}
	else {
		return color_to_js_object(info.Env(), bg_color_);
	}
}

Napi::Value LedMatrixAddon::get_available_pixel_mappers(const Napi::CallbackInfo& info) {
	auto env					  = info.Env();
	auto mappers				  = GetAvailablePixelMappers();
	Napi::Array mapper_name_array = Napi::Array::New(env, mappers.size());

	for (uint8_t i = 0; i < mappers.size(); i++) { mapper_name_array.Set(i, Napi::String::New(env, mappers.at(i))); }

	return mapper_name_array;
}

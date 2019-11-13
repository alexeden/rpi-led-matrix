#include "led-matrix.addon.h"

#define BILLION  1000000000L;
#define MILLION  1000000000L;

inline double get_now_ms() {
	struct timespec t;
	if (clock_gettime(CLOCK_MONOTONIC_RAW, &t) < 0) {
		throw "Failed to get the current time.";
	}

	return (t.tv_sec * 1000) + (t.tv_nsec / 1000000);
}

using namespace rgb_matrix;

Napi::FunctionReference LedMatrixAddon::constructor;

Napi::Object LedMatrixAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(
	  env,
	  "LedMatrix",
	  { StaticMethod("defaultMatrixOptions", &LedMatrixAddon::default_matrix_options),
		StaticMethod("defaultRuntimeOptions", &LedMatrixAddon::default_runtime_options),
		InstanceMethod("afterSync", &LedMatrixAddon::after_sync),
		InstanceMethod("bgColor", &LedMatrixAddon::bg_color),
		InstanceMethod("brightness", &LedMatrixAddon::brightness),
		InstanceMethod("clear", &LedMatrixAddon::clear),
		InstanceMethod("drawBuffer", &LedMatrixAddon::draw_buffer),
		InstanceMethod("drawCircle", &LedMatrixAddon::draw_circle),
		InstanceMethod("drawLine", &LedMatrixAddon::draw_line),
		InstanceMethod("drawRect", &LedMatrixAddon::draw_rect),
		InstanceMethod("drawText", &LedMatrixAddon::draw_text),
		InstanceMethod("fgColor", &LedMatrixAddon::fg_color),
		InstanceMethod("fill", &LedMatrixAddon::fill),
		InstanceMethod("font", &LedMatrixAddon::font),
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
	exports.Set("LedMatrix", func);

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
  , font_(nullptr)
  , font_name_("")
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
	auto matrixOpts  = create_matrix_options(env, info[0].As<Napi::Object>());
	auto runtimeOpts = create_runtime_options(env, info[1].As<Napi::Object>());

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
        auto now = get_now_ms();
        auto now_ms = now - t_start_;
        t_dsync_ms_ = now_ms - t_sync_ms_;
        t_sync_ms_ = now_ms;

		auto resync = after_sync_cb_.Call(info.This(), {
			info.This(),
			Napi::Number::New(env, t_dsync_ms_),
			Napi::Number::New(env, t_sync_ms_)
		});

        if (resync.ToBoolean() == true) {
            sync(info);
        }
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

	auto env = info.Env();
	auto now = get_now_ms();
	auto now_ms = Napi::Number::New(env, now - t_start_);

    Napi::Array coord_array = Napi::Array::New(env, 3);
    uint32_t zero = 0; // The compiler can't match the overloaded signature if given 0 explicitly
    uint32_t one = 1;
    uint32_t two = 2;

    auto i = 0;

    for (int x = 0; x < this->matrix_->width(); x++) {
        coord_array.Set(zero, x);

        for (int y = 0; y < this->matrix_->height(); y++) {
            coord_array.Set(one, y);
            coord_array.Set(two, i++);

            auto color = cb.Call(info.This(), {
                coord_array,
                now_ms
            });

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
		const auto x0	= info[0].As<Napi::Number>().Uint32Value();
		const auto y0	= info[1].As<Napi::Number>().Uint32Value();
		const auto x1	= info[2].As<Napi::Number>().Uint32Value();
		const auto y1	= info[3].As<Napi::Number>().Uint32Value();
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
	const auto data   = buffer.Data();
	const auto len	= buffer.Length();

	assert(len == w * h * 3);

	Image* img	= new Image();
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

Napi::Value LedMatrixAddon::draw_text(const Napi::CallbackInfo& info) {
	if (!font_) { throw Napi::Error::New(info.Env(), "Cannot draw text because the font has not been set!"); }
	const auto text		= std::string(info[0].As<Napi::String>()).c_str();
	const auto x		= info[1].As<Napi::Number>().Int32Value();
	const auto y		= info[2].As<Napi::Number>().Int32Value();
	const auto k		= info[3].IsNumber() ? info[3].As<Napi::Number>().Int32Value() : 0;
	const auto bg_color = bg_color_.r == 0 && bg_color_.g == 0 && bg_color_.b == 0 ? nullptr : &bg_color_;
	DrawText(this->canvas_, *font_, x, y + font_->baseline(), fg_color_, bg_color, text, k);

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
		auto color = LedMatrixAddon::color_from_callback_info(info);
		fg_color_  = color;
		return info.This();
	}
	else {
		return LedMatrixAddon::obj_from_color(info.Env(), fg_color_);
	}
}

Napi::Value LedMatrixAddon::bg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto color = LedMatrixAddon::color_from_callback_info(info);
		bg_color_  = color;
		return info.This();
	}
	else {
		return LedMatrixAddon::obj_from_color(info.Env(), bg_color_);
	}
}

Napi::Value LedMatrixAddon::font(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto font   = Napi::ObjectWrap<FontAddon>::Unwrap(info[0].As<Napi::Object>());
		this->font_ = &(font->font);
		font_name_  = font->name(info).ToString();
		return info.This();
	}
	else {
		return Napi::String::New(info.Env(), font_name_);
	}
}

Napi::Value LedMatrixAddon::get_available_pixel_mappers(const Napi::CallbackInfo& info) {
    auto env = info.Env();
    auto mappers = GetAvailablePixelMappers();
    Napi::Array mapper_name_array = Napi::Array::New(env, mappers.size());

    for (uint8_t i = 0; i < mappers.size(); i++) {
        mapper_name_array.Set(i, Napi::String::New(env, mappers.at(i)));
    }

    return mapper_name_array;
}


/**
 * Create an instance of Options from a JS object.
 */
RGBMatrix::Options LedMatrixAddon::create_matrix_options(const Napi::Env& env, const Napi::Object& obj) {
	RGBMatrix::Options options = RGBMatrix::Options();

	options.brightness				 = obj.Get("brightness").As<Napi::Number>();
	options.chain_length			 = obj.Get("chainLength").As<Napi::Number>();
	options.cols					 = obj.Get("cols").As<Napi::Number>();
	options.disable_hardware_pulsing = obj.Get("disableHardwarePulsing").As<Napi::Boolean>();
	auto hardware_mapping			 = std::string(obj.Get("hardwareMapping").As<Napi::String>());
	options.hardware_mapping		 = strcpy(new char[hardware_mapping.size()], hardware_mapping.c_str());
	options.inverse_colors			 = obj.Get("inverseColors").As<Napi::Boolean>();
	auto led_rgb_sequence			 = std::string(obj.Get("ledRgbSequence").As<Napi::String>());
	options.led_rgb_sequence		 = strcpy(new char[led_rgb_sequence.size()], led_rgb_sequence.c_str());
	auto pixel_mapper_config		 = std::string(obj.Get("pixelMapperConfig").As<Napi::String>());
	options.pixel_mapper_config		 = strcpy(new char[pixel_mapper_config.size()], pixel_mapper_config.c_str());
	options.multiplexing			 = obj.Get("multiplexing").As<Napi::Number>();
	options.parallel				 = obj.Get("parallel").As<Napi::Number>();
	options.pwm_bits				 = obj.Get("pwmBits").As<Napi::Number>();
	options.pwm_dither_bits			 = obj.Get("pwmDitherBits").As<Napi::Number>();
	options.pwm_lsb_nanoseconds		 = obj.Get("pwmLsbNanoseconds").As<Napi::Number>();
	options.row_address_type		 = obj.Get("rowAddressType").As<Napi::Number>();
	options.rows					 = obj.Get("rows").As<Napi::Number>();
	options.scan_mode				 = obj.Get("scanMode").As<Napi::Number>();
	options.show_refresh_rate		 = obj.Get("showRefreshRate").As<Napi::Boolean>();

	// Validate the options using native method
	std::string error;
	if (!options.Validate(&error)) throw Napi::Error::New(env, error);
	return options;
}

/**
 * Create an instance of RuntimeOptions from a JS object.
 */
RuntimeOptions LedMatrixAddon::create_runtime_options(const Napi::Env& env, const Napi::Object& obj) {
	RuntimeOptions options = RuntimeOptions();

	options.gpio_slowdown   = obj.Get("gpioSlowdown").As<Napi::Number>();
	options.daemon			= obj.Get("daemon").As<Napi::Number>();
	options.drop_privileges = obj.Get("dropPrivileges").As<Napi::Number>();
	options.do_gpio_init	= obj.Get("doGpioInit").As<Napi::Boolean>();

	return options;
}

/**
 * Create a JS object from an instance of RGBMatrix::Options.
 */
Napi::Object LedMatrixAddon::matrix_options_to_obj(const Napi::Env& env, const RGBMatrix::Options& options) {
	auto obj = Napi::Object::New(env);

	std::string hardware_mapping = options.hardware_mapping == NULL ? "" : std::string(options.hardware_mapping);

	std::string led_rgb_sequence = options.led_rgb_sequence == NULL ? "" : std::string(options.led_rgb_sequence);

	std::string pixel_mapper_config
	  = options.pixel_mapper_config == NULL ? "" : std::string(options.pixel_mapper_config);

	obj.Set("brightness", Napi::Number::New(env, options.brightness));
	obj.Set("chainLength", Napi::Number::New(env, options.chain_length));
	obj.Set("cols", Napi::Number::New(env, options.cols));
	obj.Set("disableHardwarePulsing", Napi::Boolean::New(env, options.disable_hardware_pulsing));
	obj.Set("hardwareMapping", Napi::String::New(env, hardware_mapping));
	obj.Set("inverseColors", Napi::Boolean::New(env, options.inverse_colors));
	obj.Set("ledRgbSequence", Napi::String::New(env, led_rgb_sequence));
	obj.Set("multiplexing", Napi::Number::New(env, options.multiplexing));
	obj.Set("parallel", Napi::Number::New(env, options.parallel));
	obj.Set("pixelMapperConfig", Napi::String::New(env, pixel_mapper_config));
	obj.Set("pwmBits", Napi::Number::New(env, options.pwm_bits));
	obj.Set("pwmDitherBits", Napi::Number::New(env, options.pwm_dither_bits));
	obj.Set("pwmLsbNanoseconds", Napi::Number::New(env, options.pwm_lsb_nanoseconds));
	obj.Set("rowAddressType", Napi::Number::New(env, options.row_address_type));
	obj.Set("rows", Napi::Number::New(env, options.rows));
	obj.Set("scanMode", Napi::Number::New(env, options.scan_mode));
	obj.Set("showRefreshRate", Napi::Boolean::New(env, options.show_refresh_rate));

	return obj;
}

/**
 * Create a JS object from an instance of RuntimeOptions.
 */
Napi::Object LedMatrixAddon::runtime_options_to_obj(const Napi::Env& env, const RuntimeOptions& options) {
	auto obj = Napi::Object::New(env);

	obj.Set("gpioSlowdown", Napi::Number::New(env, options.gpio_slowdown));
	obj.Set("daemon", Napi::Number::New(env, options.daemon));
	obj.Set("dropPrivileges", Napi::Number::New(env, options.drop_privileges));
	obj.Set("doGpioInit", Napi::Boolean::New(env, options.do_gpio_init));

	return obj;
}

/**
 * Create a JS object from the default matrix options.
 */
Napi::Value LedMatrixAddon::default_matrix_options(const Napi::CallbackInfo& info) {
	auto env		   = info.Env();
	const auto options = RGBMatrix::Options();
	return LedMatrixAddon::matrix_options_to_obj(env, options);
}

/**
 * Create a JS object from the default runtime options.
 */
Napi::Value LedMatrixAddon::default_runtime_options(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	return LedMatrixAddon::runtime_options_to_obj(env, RuntimeOptions());
}

/**
 * Create a Color instance from CallbackInfo.
 */
Color LedMatrixAddon::color_from_callback_info(const Napi::CallbackInfo& info) {
	if (info.Length() == 3) {
		uint8_t r = info[0].As<Napi::Number>().Uint32Value();
		uint8_t g = info[1].As<Napi::Number>().Uint32Value();
		uint8_t b = info[2].As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (info[0].IsObject()) {
		const auto obj = info[0].As<Napi::Object>();
		uint8_t r	  = obj.Get("r").As<Napi::Number>().Uint32Value();
		uint8_t g	  = obj.Get("g").As<Napi::Number>().Uint32Value();
		uint8_t b	  = obj.Get("b").As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (info[0].IsNumber()) {
		const auto hex = info[0].As<Napi::Number>().Uint32Value();
		return Color(0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
	}
	else {
		throw Napi::Error::New(info.Env(), "Failed to create color from parameters.");
	}
}

/**
 * Create an Object from a Color.
 */
Napi::Object LedMatrixAddon::obj_from_color(const Napi::Env& env, const Color& color) {
	Napi::Object obj = Napi::Object::New(env);
	obj.Set("r", color.r);
	obj.Set("g", color.g);
	obj.Set("b", color.b);
	return obj;
}

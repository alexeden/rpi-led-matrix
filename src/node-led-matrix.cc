#include "node-led-matrix.h"

using namespace rgb_matrix;
using namespace napi_utils;

Napi::FunctionReference NodeLedMatrix::constructor;

Napi::Object NodeLedMatrix::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(env, "NodeLedMatrix", {
		StaticMethod("defaultMatrixOptions", &NodeLedMatrix::default_matrix_options),
		StaticMethod("defaultRuntimeOptions", &NodeLedMatrix::default_runtime_options),
		InstanceMethod("brightness", &NodeLedMatrix::brightness),
		InstanceMethod("clear", &NodeLedMatrix::clear),
		InstanceMethod("drawCircle", &NodeLedMatrix::draw_circle),
		InstanceMethod("drawLine", &NodeLedMatrix::draw_line),
		InstanceMethod("drawRect", &NodeLedMatrix::draw_rect),
		InstanceMethod("drawText", &NodeLedMatrix::draw_text),
		InstanceMethod("fill", &NodeLedMatrix::fill),
		InstanceMethod("height", &NodeLedMatrix::height),
		InstanceMethod("luminanceCorrect", &NodeLedMatrix::luminance_correct),
		InstanceMethod("pwmBits", &NodeLedMatrix::pwm_bits),
		InstanceMethod("bgColor", &NodeLedMatrix::bg_color),
		InstanceMethod("fgColor", &NodeLedMatrix::fg_color),
		InstanceMethod("setFont", &NodeLedMatrix::font),
		InstanceMethod("setPixel", &NodeLedMatrix::set_pixel),
		InstanceMethod("sync", &NodeLedMatrix::sync),
		InstanceMethod("width", &NodeLedMatrix::width)
	});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
	exports.Set("LedMatrix", func);

	return exports;
}

/**
 * Process matrix & runtime options and initialize the internal RGBMatrix.
 */
NodeLedMatrix::NodeLedMatrix(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<NodeLedMatrix>(info)
    , fg_color_(Color(0, 0, 0))
    , bg_color_(Color(0, 0, 0))
{
	auto env = info.Env();

	if (!info[0].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of matrix options!");
	}

	if (!info[1].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of runtime options!");
	}

	auto matrixOpts = create_matrix_options(env, info[0].As<Napi::Object>());
	auto runtimeOpts = create_runtime_options(env, info[1].As<Napi::Object>());

	this->matrix_ = CreateMatrixFromOptions(matrixOpts, runtimeOpts);
	this->canvas_ = this->matrix_->CreateFrameCanvas();
	if (this->matrix_ == NULL) {
		throw Napi::Error::New(env, "Failed to create matrix.");
	}
}

NodeLedMatrix::~NodeLedMatrix(void) {
	std::cerr << "Destroying matrix" << std::endl;
	delete matrix_;
}

Napi::Value NodeLedMatrix::sync(const Napi::CallbackInfo& info) {
	const char *data;
	size_t len;

	canvas_->Serialize(&data, &len);
	canvas_ = matrix_->SwapOnVSync(canvas_);
	if (!canvas_->Deserialize(data, len)) {
		throw Napi::Error::New(info.Env(), "Failed to sync canvas buffer with matrix.");
	}

	return Napi::Number::New(info.Env(), 0);
}

Napi::Value NodeLedMatrix::brightness(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto brightness = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetBrightness(brightness);
		return info.This();
	}
	else {
		return Napi::Number::New(info.Env(), this->matrix_->brightness());
	}
}

Napi::Value NodeLedMatrix::clear(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1 = info[3].As<Napi::Number>().Uint32Value();
		const auto black = Color(0, 0, 0);
		for (auto y = y0; y <= y1; y++) {
			DrawLine(this->matrix_, x0, y, x1, y, black);
		}
	}
	else {
		this->matrix_->Clear();
	}
	return info.This();
}

Napi::Value NodeLedMatrix::draw_circle(const Napi::CallbackInfo& info) {
	const auto x = info[0].As<Napi::Number>().Uint32Value();
	const auto y = info[1].As<Napi::Number>().Uint32Value();
	const auto r = info[2].As<Napi::Number>().Uint32Value();
	DrawCircle(this->matrix_, x, y, r, fg_color_);

	return info.This();
}

Napi::Value NodeLedMatrix::draw_line(const Napi::CallbackInfo& info) {
	const auto x0 = info[0].As<Napi::Number>().Uint32Value();
	const auto y0 = info[1].As<Napi::Number>().Uint32Value();
	const auto x1 = info[2].As<Napi::Number>().Uint32Value();
	const auto y1 = info[3].As<Napi::Number>().Uint32Value();
	DrawLine(this->matrix_, x0, y0, x1, y1, fg_color_);

	return info.This();
}

Napi::Value NodeLedMatrix::draw_rect(const Napi::CallbackInfo& info) {
	const auto x0 = info[0].As<Napi::Number>().Uint32Value();
	const auto y0 = info[1].As<Napi::Number>().Uint32Value();
	const auto x1 = info[2].As<Napi::Number>().Uint32Value();
	const auto y1 = info[3].As<Napi::Number>().Uint32Value();

	DrawLine(this->matrix_, x0, y0, x1, y0, fg_color_);
	DrawLine(this->matrix_, x1, y0, x1, y1, fg_color_);
	DrawLine(this->matrix_, x1, y1, x0, y1, fg_color_);
	DrawLine(this->matrix_, x0, y1, x0, y0, fg_color_);

	return info.This();
}

Napi::Value NodeLedMatrix::draw_text(const Napi::CallbackInfo& info) {
	const auto text = helpers::string_to_c_str(info[0].As<Napi::String>());
	const auto x = info[1].As<Napi::Number>().Int32Value();
	const auto y = info[2].As<Napi::Number>().Int32Value();
	const auto k = info[3].IsNumber() ? info[3].As<Napi::Number>().Int32Value() : 0;
	auto advanced = DrawText(this->matrix_, *font_, x, y, fg_color_, &bg_color_, text, k);
	return Napi::Number::New(info.Env(), advanced);
}

Napi::Value NodeLedMatrix::fill(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1 = info[3].As<Napi::Number>().Uint32Value();
		const auto black = Color(0, 0, 0);
		for (auto y = y0; y <= y1; y++) {
			DrawLine(this->matrix_, x0, y, x1, y, fg_color_);
		}
	}
	else {
		this->matrix_->Fill(fg_color_.r, fg_color_.g, fg_color_.b);
	}

	return info.This();
}

Napi::Value NodeLedMatrix::height(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->height());
}

Napi::Value NodeLedMatrix::luminance_correct(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsBoolean()) {
		auto correct = info[0].As<Napi::Boolean>().ToBoolean();
		this->matrix_->set_luminance_correct(correct);
		return info.This();
	}
	else {
		return Napi::Boolean::New(info.Env(), this->matrix_->luminance_correct());
	}
}


Napi::Value NodeLedMatrix::pwm_bits(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto bits = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetPWMBits(bits);
		return info.This();
	}
	else {
		return Napi::Number::New(info.Env(), this->matrix_->pwmbits());
	}
}

Napi::Value NodeLedMatrix::set_pixel(const Napi::CallbackInfo& info) {
	const auto x = info[0].As<Napi::Number>().Uint32Value();
	const auto y = info[1].As<Napi::Number>().Uint32Value();
	this->matrix_->SetPixel(x, y, fg_color_.r, fg_color_.g, fg_color_.b);

	return info.This();
}

Napi::Value NodeLedMatrix::fg_color(const Napi::CallbackInfo& info) {
	if (info.Length() == 1 && info[0].IsObject()) {
		auto color = NodeLedMatrix::color_from_obj(info[0].As<Napi::Object>());
		fg_color_ = color;
		return info.This();
	}
	else {
		return NodeLedMatrix::obj_from_color(info.Env(), fg_color_);
	}
}

Napi::Value NodeLedMatrix::bg_color(const Napi::CallbackInfo& info) {
	if (info.Length() == 1 && info[0].IsObject()) {
		Color color = NodeLedMatrix::color_from_obj(info[0].As<Napi::Object>());
		bg_color_ = color;
		return info.This();
	}
	else {
		return NodeLedMatrix::obj_from_color(info.Env(), bg_color_);
	}
}

Napi::Value NodeLedMatrix::font(const Napi::CallbackInfo& info) {
	auto font = Napi::ObjectWrap<FontAddon>::Unwrap(info[0].As<Napi::Object>());
    this->font_ = &(font->font);
	return info.This();
}

Napi::Value NodeLedMatrix::width(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->width());
}

/**
 * Create an instance of Options from a JS object.
 */
RGBMatrix::Options NodeLedMatrix::create_matrix_options(const Napi::Env& env, const Napi::Object& obj) {
	RGBMatrix::Options options = RGBMatrix::Options();

	options.brightness = getProp(env, obj, "brightness").As<Napi::Number>();
	options.chain_length = getProp(env, obj, "chainLength").As<Napi::Number>();
	options.cols = getProp(env, obj, "cols").As<Napi::Number>();
	options.disable_hardware_pulsing = getProp(env, obj, "disableHardwarePulsing").As<Napi::Boolean>();
	options.hardware_mapping = helpers::string_to_c_str(getProp(env, obj, "hardwareMapping").As<Napi::String>());
	options.inverse_colors = getProp(env, obj, "inverseColors").As<Napi::Boolean>();
	options.led_rgb_sequence = helpers::string_to_c_str(getProp(env, obj, "ledRgbSequence").As<Napi::String>());
	options.multiplexing = getProp(env, obj, "multiplexing").As<Napi::Number>();
	options.parallel = getProp(env, obj, "parallel").As<Napi::Number>();
	options.pixel_mapper_config = helpers::string_to_c_str(getProp(env, obj, "pixelMapperConfig").As<Napi::String>());
	options.pwm_bits = getProp(env, obj, "pwmBits").As<Napi::Number>();
	options.pwm_dither_bits = getProp(env, obj, "pwmDitherBits").As<Napi::Number>();
	options.pwm_lsb_nanoseconds = getProp(env, obj, "pwmLsbNanoseconds").As<Napi::Number>();
	options.row_address_type = getProp(env, obj, "rowAddressType").As<Napi::Number>();
	options.rows = getProp(env, obj, "rows").As<Napi::Number>();
	options.scan_mode = getProp(env, obj, "scanMode").As<Napi::Number>();
	options.show_refresh_rate = getProp(env, obj, "showRefreshRate").As<Napi::Boolean>();

	// Validate the options using native method
	std::string error;
	if (!options.Validate(&error)) throw Napi::Error::New(env, error);

	return options;
}

/**
 * Create an instance of RuntimeOptions from a JS object.
 */
RuntimeOptions NodeLedMatrix::create_runtime_options(const Napi::Env& env, const Napi::Object& obj) {
	RuntimeOptions options = RuntimeOptions();

	options.gpio_slowdown = getProp(env, obj, "gpioSlowdown").As<Napi::Number>();
	options.daemon = getProp(env, obj, "daemon").As<Napi::Number>();
	options.drop_privileges = getProp(env, obj, "dropPrivileges").As<Napi::Number>();
	options.do_gpio_init = getProp(env, obj, "doGpioInit").As<Napi::Boolean>();

	return options;
}

/**
 * Create a JS object from an instance of RGBMatrix::Options.
 */
Napi::Object NodeLedMatrix::matrix_options_to_obj(
	const Napi::Env& env,
	const RGBMatrix::Options& options
) {
	auto obj = Napi::Object::New(env);

	std::string hardware_mapping = options.hardware_mapping == NULL
		? ""
		: std::string(options.hardware_mapping);

	std::string led_rgb_sequence = options.led_rgb_sequence == NULL
		? ""
		: std::string(options.led_rgb_sequence);

	std::string pixel_mapper_config = options.pixel_mapper_config == NULL
		? ""
		: std::string(options.pixel_mapper_config);

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
Napi::Object NodeLedMatrix::runtime_options_to_obj(const Napi::Env& env, const RuntimeOptions& options) {
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
Napi::Value NodeLedMatrix::default_matrix_options(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	const auto options = RGBMatrix::Options();
	return NodeLedMatrix::matrix_options_to_obj(env, options);
}

/**
 * Create a JS object from the default runtime options.
 */
Napi::Value NodeLedMatrix::default_runtime_options(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	return NodeLedMatrix::runtime_options_to_obj(env, RuntimeOptions());
}

/**
 * Create a Color instance from CallbackInfo.
 */
Color NodeLedMatrix::color_from_callback_info(const Napi::CallbackInfo& info, uint8_t argOffset = 0) {
	uint8_t r = info[argOffset + 0].As<Napi::Number>().Uint32Value();
	uint8_t g = info[argOffset + 1].As<Napi::Number>().Uint32Value();
	uint8_t b = info[argOffset + 2].As<Napi::Number>().Uint32Value();

	return Color(r, g, b);
}

/**
 * Create a Color instance from Object.
 */
Color NodeLedMatrix::color_from_obj(const Napi::Object& obj) {
	uint8_t r = obj.Get("r").As<Napi::Number>().Uint32Value();
	uint8_t g = obj.Get("g").As<Napi::Number>().Uint32Value();
	uint8_t b = obj.Get("b").As<Napi::Number>().Uint32Value();
	return Color(r, g, b);
}

/**
 * Create an Object from a Color.
 */
Napi::Object NodeLedMatrix::obj_from_color(const Napi::Env& env, const Color& color) {
	Napi::Object obj = Napi::Object::New(env);
	obj.Set("r", color.r);
	obj.Set("g", color.g);
	obj.Set("b", color.b);
	return obj;
}

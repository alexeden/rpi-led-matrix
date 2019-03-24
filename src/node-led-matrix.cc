#include "node-led-matrix.h"

using namespace rgb_matrix;
char* string_to_c_str(const std::string &str);

Napi::FunctionReference NodeLedMatrix::constructor;

Napi::Object NodeLedMatrix::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(env, "NodeLedMatrix", {
		StaticMethod("defaultMatrixOptions", &NodeLedMatrix::defaultMatrixOptions),
		StaticMethod("defaultRuntimeOptions", &NodeLedMatrix::defaultRuntimeOptions),
		InstanceMethod("brightness", &NodeLedMatrix::brightness),
		InstanceMethod("height", &NodeLedMatrix::height),
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
NodeLedMatrix::NodeLedMatrix(const Napi::CallbackInfo &info) : Napi::ObjectWrap<NodeLedMatrix>(info) {
	auto env = info.Env();

	if (!info[0].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of matrix options!");
	}

	if (!info[1].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of runtime options!");
	}

	auto matrixOpts = createMatrixOptions(env, info[0].As<Napi::Object>());
	auto runtimeOpts = createRuntimeOptions(env, info[1].As<Napi::Object>());

	this->matrix_ = CreateMatrixFromOptions(matrixOpts, runtimeOpts);

	if (this->matrix_ == NULL) {
		throw Napi::Error::New(env, "Failed to create matrix.");
	}

	this->matrix_->Fill(255, 0, 0);
}

NodeLedMatrix::~NodeLedMatrix(void) {
	fprintf(stderr, "%sMatrix deleted\n", FOREMAG);
	delete this->matrix_;
}

Napi::Value NodeLedMatrix::brightness(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto brightness = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetBrightness(brightness);
	}
	return Napi::Number::New(info.Env(), this->matrix_->brightness());
}

Napi::Value NodeLedMatrix::height(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->height());
}

Napi::Value NodeLedMatrix::width(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->width());
}

/**
 * Create an instance of Options from a JS object.
 */
RGBMatrix::Options NodeLedMatrix::createMatrixOptions(const Napi::Env& env, const Napi::Object& obj) {
	RGBMatrix::Options options = RGBMatrix::Options();

	options.hardware_mapping = string_to_c_str(NapiUtils::getProp(env, obj, "hardware_mapping").As<Napi::String>());
	options.brightness = NapiUtils::getProp(env, obj, "brightness").As<Napi::Number>();
	options.chain_length = NapiUtils::getProp(env, obj, "chain_length").As<Napi::Number>();
	options.cols = NapiUtils::getProp(env, obj, "cols").As<Napi::Number>();
	options.multiplexing = NapiUtils::getProp(env, obj, "multiplexing").As<Napi::Number>();
	options.parallel = NapiUtils::getProp(env, obj, "parallel").As<Napi::Number>();
	options.pwm_bits = NapiUtils::getProp(env, obj, "pwm_bits").As<Napi::Number>();
	options.pwm_dither_bits = NapiUtils::getProp(env, obj, "pwm_dither_bits").As<Napi::Number>();
	options.pwm_lsb_nanoseconds = NapiUtils::getProp(env, obj, "pwm_lsb_nanoseconds").As<Napi::Number>();
	options.row_address_type = NapiUtils::getProp(env, obj, "row_address_type").As<Napi::Number>();
	options.rows = NapiUtils::getProp(env, obj, "rows").As<Napi::Number>();
	options.scan_mode = NapiUtils::getProp(env, obj, "scan_mode").As<Napi::Number>();
	options.disable_hardware_pulsing = NapiUtils::getProp(env, obj, "disable_hardware_pulsing").As<Napi::Boolean>();
	options.inverse_colors = NapiUtils::getProp(env, obj, "inverse_colors").As<Napi::Boolean>();
	options.show_refresh_rate = NapiUtils::getProp(env, obj, "show_refresh_rate").As<Napi::Boolean>();

	// Validate the options using native method
	std::string error;
	if (!options.Validate(&error)) throw Napi::Error::New(env, error);

	return options;
}

/**
 * Create an instance of RuntimeOptions from a JS object.
 */
RuntimeOptions NodeLedMatrix::createRuntimeOptions(const Napi::Env& env, const Napi::Object& obj) {
	RuntimeOptions options = RuntimeOptions();

	options.gpio_slowdown = NapiUtils::getProp(env, obj, "gpio_slowdown").As<Napi::Number>();
	options.daemon = NapiUtils::getProp(env, obj, "daemon").As<Napi::Number>();
	options.drop_privileges = NapiUtils::getProp(env, obj, "drop_privileges").As<Napi::Number>();
	options.do_gpio_init = NapiUtils::getProp(env, obj, "do_gpio_init").As<Napi::Boolean>();

	return options;
}

/**
 * Create a JS object from an instance of RGBMatrix::Options.
 */
Napi::Object NodeLedMatrix::matrixOptionsToObj(
	const Napi::Env& env,
	const RGBMatrix::Options& options
) {
	auto obj = Napi::Object::New(env);

	obj.Set("brightness", Napi::Number::New(env, options.brightness));
	obj.Set("chain_length", Napi::Number::New(env, options.chain_length));
	obj.Set("cols", Napi::Number::New(env, options.cols));
	obj.Set("multiplexing", Napi::Number::New(env, options.multiplexing));
	obj.Set("parallel", Napi::Number::New(env, options.parallel));
	obj.Set("pwm_bits", Napi::Number::New(env, options.pwm_bits));
	obj.Set("pwm_dither_bits", Napi::Number::New(env, options.pwm_dither_bits));
	obj.Set("pwm_lsb_nanoseconds", Napi::Number::New(env, options.pwm_lsb_nanoseconds));
	obj.Set("row_address_type", Napi::Number::New(env, options.row_address_type));
	obj.Set("rows", Napi::Number::New(env, options.rows));
	obj.Set("scan_mode", Napi::Number::New(env, options.scan_mode));
	obj.Set("disable_hardware_pulsing", Napi::Boolean::New(env, options.disable_hardware_pulsing));
	obj.Set("inverse_colors", Napi::Boolean::New(env, options.inverse_colors));
	obj.Set("show_refresh_rate", Napi::Boolean::New(env, options.show_refresh_rate));

	return obj;
}

/**
 * Create a JS object from an instance of RuntimeOptions.
 */
Napi::Object NodeLedMatrix::runtimeOptionsToObj(const Napi::Env& env, const RuntimeOptions& options) {
	auto obj = Napi::Object::New(env);

	obj.Set("gpio_slowdown", Napi::Number::New(env, options.gpio_slowdown));
	obj.Set("daemon", Napi::Number::New(env, options.daemon));
	obj.Set("drop_privileges", Napi::Number::New(env, options.drop_privileges));
	obj.Set("do_gpio_init", Napi::Boolean::New(env, options.do_gpio_init));

	return obj;
}

/**
 * Create a JS object from the default matrix options.
 */
Napi::Value NodeLedMatrix::defaultMatrixOptions(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	return NodeLedMatrix::matrixOptionsToObj(env, RGBMatrix::Options());
}

/**
 * Create a JS object from the default runtime options.
 */
Napi::Value NodeLedMatrix::defaultRuntimeOptions(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	return NodeLedMatrix::runtimeOptionsToObj(env, RuntimeOptions());
}

char* string_to_c_str(const std::string &str) {
	char *cptr = new char[str.size()];
	std::strcpy(cptr, str.c_str());
	return cptr;
}

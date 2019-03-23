#include "node-led-matrix.h"

using namespace rgb_matrix;

Napi::FunctionReference NodeLedMatrix::constructor;

Napi::Object NodeLedMatrix::Init(Napi::Env env, Napi::Object exports) {

	Napi::Function func = DefineClass(env, "NodeLedMatrix", {
		StaticMethod("defaultMatrixOptions", &NodeLedMatrix::defaultMatrixOptions),
		StaticMethod("defaultRuntimeOptions", &NodeLedMatrix::defaultRuntimeOptions)
	});

	// Create a peristent reference to the class constructor. This will allow
    // a function called on a class prototype and a function
    // called on instance of a class to be distinguished from each other.
    constructor = Napi::Persistent(func);


    // Call the SuppressDestruct() method on the static data prevent the calling
    // to this destructor to reset the reference when the environment is no longer
    // available.
    constructor.SuppressDestruct();

	exports.Set("NodeLedMatrix", func);

	return exports;
}

NodeLedMatrix::NodeLedMatrix(const Napi::CallbackInfo &info) : Napi::ObjectWrap<NodeLedMatrix>(info) {
}


/**
 * Create an instance of Options from a JS object.
 */
RGBMatrix::Options NodeLedMatrix::createMatrixOptions(const Napi::CallbackInfo& info) {
	auto env = info.Env();

	if (!info[0].IsObject()) throw Napi::Error::New(env, "The argument provided to createMatrixOptions must be an object.");

	auto jsOpts = info[0].As<Napi::Object>();

	RGBMatrix::Options options = RGBMatrix::Options();
	options.brightness = NapiUtils::getProp(env, jsOpts, "brightness").As<Napi::Number>();
	options.chain_length = NapiUtils::getProp(env, jsOpts, "chain_length").As<Napi::Number>();
	options.cols = NapiUtils::getProp(env, jsOpts, "cols").As<Napi::Number>();
	options.multiplexing = NapiUtils::getProp(env, jsOpts, "multiplexing").As<Napi::Number>();
	options.parallel = NapiUtils::getProp(env, jsOpts, "parallel").As<Napi::Number>();
	options.pwm_bits = NapiUtils::getProp(env, jsOpts, "pwm_bits").As<Napi::Number>();
	options.pwm_dither_bits = NapiUtils::getProp(env, jsOpts, "pwm_dither_bits").As<Napi::Number>();
	options.pwm_lsb_nanoseconds = NapiUtils::getProp(env, jsOpts, "pwm_lsb_nanoseconds").As<Napi::Number>();
	options.row_address_type = NapiUtils::getProp(env, jsOpts, "row_address_type").As<Napi::Number>();
	options.rows = NapiUtils::getProp(env, jsOpts, "rows").As<Napi::Number>();
	options.scan_mode = NapiUtils::getProp(env, jsOpts, "scan_mode").As<Napi::Number>();
	options.disable_hardware_pulsing = NapiUtils::getProp(env, jsOpts, "disable_hardware_pulsing").As<Napi::Boolean>();
	options.inverse_colors = NapiUtils::getProp(env, jsOpts, "inverse_colors").As<Napi::Boolean>();
	options.show_refresh_rate = NapiUtils::getProp(env, jsOpts, "show_refresh_rate").As<Napi::Boolean>();

	return options;
}

/**
 * Create an instance of RuntimeOptions from a JS object.
 */
RuntimeOptions NodeLedMatrix::createRuntimeOptions(const Napi::CallbackInfo& info) {
	auto env = info.Env();

	if (!info[0].IsObject()) throw Napi::Error::New(env, "The argument provided to createRuntimeOptions must be an object.");

	auto jsOpts = info[0].As<Napi::Object>();

	RuntimeOptions options = RuntimeOptions();
	options.gpio_slowdown = NapiUtils::getProp(env, jsOpts, "gpio_slowdown").As<Napi::Number>();
	options.daemon = NapiUtils::getProp(env, jsOpts, "daemon").As<Napi::Number>();
	options.drop_privileges = NapiUtils::getProp(env, jsOpts, "drop_privileges").As<Napi::Number>();
	options.do_gpio_init = NapiUtils::getProp(env, jsOpts, "do_gpio_init").As<Napi::Boolean>();

	return options;
}

/**
 * Create a JS object from the default matrix options.
 */
Napi::Value NodeLedMatrix::defaultMatrixOptions(const Napi::CallbackInfo& info) {
	auto env = info.Env();

	RGBMatrix::Options options = RGBMatrix::Options();

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
 * Create a JS object from the default runtime options.
 */
Napi::Value NodeLedMatrix::defaultRuntimeOptions(const Napi::CallbackInfo& info) {
	auto env = info.Env();

	RuntimeOptions options = RuntimeOptions();

	auto obj = Napi::Object::New(env);

	obj.Set("gpio_slowdown", Napi::Number::New(env, options.gpio_slowdown));
	obj.Set("daemon", Napi::Number::New(env, options.daemon));
	obj.Set("drop_privileges", Napi::Number::New(env, options.drop_privileges));
	obj.Set("do_gpio_init", Napi::Boolean::New(env, options.do_gpio_init));

	return obj;
}

#include "node-led-matrix.h"

using namespace rgb_matrix;

Napi::FunctionReference NodeLedMatrix::constructor;

Napi::Object NodeLedMatrix::Init(Napi::Env env, Napi::Object exports) {

	Napi::Function func = DefineClass(env, "NodeLedMatrix", {
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
 * Generate and return the default matrix options as a JS object.
 */
Napi::Object NodeLedMatrix::defaultMatrixOptions(const Napi::CallbackInfo& info) {
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

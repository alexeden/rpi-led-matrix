#ifndef RUNTIMEOPTIONS_H
#define RUNTIMEOPTIONS_H

#include <led-matrix.h>
#include <napi.h>

using namespace rgb_matrix;

/**
 * Create a JS object from the default runtime options.
 */
inline Napi::Value defaultRuntimeOptions(const Napi::CallbackInfo& info) {
	auto env	 = info.Env();
	auto options = RuntimeOptions();

	auto obj = Napi::Object::New(env);

	obj.Set("gpioSlowdown", Napi::Number::New(env, options.gpio_slowdown));
	obj.Set("daemon", Napi::Number::New(env, options.daemon));
	obj.Set("dropPrivileges", Napi::Number::New(env, options.drop_privileges));
	obj.Set("doGpioInit", Napi::Boolean::New(env, options.do_gpio_init));

	return obj;
}

/**
 * Create an instance of RuntimeOptions from a JS object.
 */
inline RuntimeOptions runtime_options_from_js_object(const Napi::Env& env, const Napi::Object& obj) {
	RuntimeOptions options = RuntimeOptions();

	options.gpio_slowdown	= obj.Get("gpioSlowdown").As<Napi::Number>();
	options.daemon			= obj.Get("daemon").As<Napi::Number>();
	options.drop_privileges = obj.Get("dropPrivileges").As<Napi::Number>();
	options.do_gpio_init	= obj.Get("doGpioInit").As<Napi::Boolean>();

	return options;
}

#endif

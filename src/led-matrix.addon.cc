#include "led-matrix.addon.h"

#define BILLION 1000000000L;
#define MILLION 1000000000L;

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
	  { StaticMethod("availablePixelMappers", &LedMatrixAddon::available_pixel_mappers),
		StaticMethod("defaultMatrixOptions", &LedMatrixAddon::default_matrix_options),
		StaticMethod("defaultRuntimeOptions", &LedMatrixAddon::default_runtime_options),
		InstanceMethod("afterSync", &LedMatrixAddon::after_sync),
		InstanceMethod("bgColor", &LedMatrixAddon::bg_color),
		InstanceMethod("brightness", &LedMatrixAddon::brightness),
		InstanceMethod("center", &LedMatrixAddon::center),
		InstanceMethod("clear", &LedMatrixAddon::clear),
		InstanceMethod("drawBuffer", &LedMatrixAddon::draw_buffer),
		InstanceMethod("drawCircle", &LedMatrixAddon::draw_circle),
		InstanceMethod("unstable_drawCircle", &LedMatrixAddon::unstable_draw_circle),
		InstanceMethod("unstable_drawLine", &LedMatrixAddon::unstable_draw_line),
		InstanceMethod("unstable_drawPolygon", &LedMatrixAddon::unstable_draw_polygon),
		InstanceMethod("unstable_drawRectangle", &LedMatrixAddon::unstable_draw_rectangle),
		InstanceMethod("drawLine", &LedMatrixAddon::draw_line),
		InstanceMethod("drawRect", &LedMatrixAddon::draw_rect),
		InstanceMethod("drawText", &LedMatrixAddon::draw_text),
		InstanceMethod("fgColor", &LedMatrixAddon::fg_color),
		InstanceMethod("fill", &LedMatrixAddon::fill),
		InstanceMethod("font", &LedMatrixAddon::font),
		InstanceMethod("height", &LedMatrixAddon::height),
		InstanceMethod("luminanceCorrect", &LedMatrixAddon::luminance_correct),
		InstanceMethod("map", &LedMatrixAddon::map),
		InstanceMethod("mapPixels", &LedMatrixAddon::map_pixels),
		InstanceMethod("pwmBits", &LedMatrixAddon::pwm_bits),
		InstanceMethod("setPixel", &LedMatrixAddon::set_pixel),
		InstanceMethod("shapeOptions", &LedMatrixAddon::shape_options),
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
  , map_pixels_cb_(Napi::FunctionReference())
  , bg_color_(Color(0, 0, 0))
  , fg_color_(Color(0, 0, 0))
  , origin_(Point())
  , font_(nullptr)
  , font_name_("")
  , t_start_(get_now_ms())
  , t_sync_ms_(0)
  , t_dsync_ms_(0)
  , default_shape_options_(ShapeOptions()) {
	auto env = info.Env();
	if (!info[0].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of matrix options!");
	}
	if (!info[1].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its second parameter to be an object of runtime options!");
	}

	auto matrixOpts	 = NapiAdapter<RGBMatrix::Options>::from_value(info[0]);
	auto runtimeOpts = NapiAdapter<rgb_matrix::RuntimeOptions>::from_value(info[1]);

	this->matrix_ = CreateMatrixFromOptions(matrixOpts, runtimeOpts);
	this->canvas_ = this->matrix_->CreateFrameCanvas();

	if (this->matrix_ == NULL) {
		throw Napi::Error::New(env, "Failed to create matrix.");
	}
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

Napi::Value LedMatrixAddon::map_pixels(const Napi::CallbackInfo& info) {
	// If not defined, clear the pixel mapper
	if (info[0].IsUndefined()) {
		map_pixels_cb_ = Napi::FunctionReference();
	}
	else {
		assert(info[0].IsFunction());
		auto cb		   = info[0].As<Napi::Function>();
		map_pixels_cb_ = Napi::Persistent(cb);
		map_pixels_cb_.SuppressDestruct();
	}

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

Napi::Value LedMatrixAddon::center(const Napi::CallbackInfo& info) {
	return NapiAdapter<Point>::into_value(info.Env(), Point(this->matrix_->width() / 2, this->matrix_->height() / 2));
}

Napi::Value LedMatrixAddon::clear(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0	 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0	 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1	 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1	 = info[3].As<Napi::Number>().Uint32Value();
		const auto black = Color(0, 0, 0);
		for (auto y = y0; y <= y1; y++) {
			DrawLine(this->canvas_, x0, y, x1, y, black);
		}
	}
	else {
		this->canvas_->Clear();
	}
	return info.This();
}

Napi::Value LedMatrixAddon::draw_buffer(const Napi::CallbackInfo& info) {
	const auto buffer = info[0].As<Napi::Buffer<uint8_t>>();
	const auto w	  = info[1].IsNumber() ? info[1].As<Napi::Number>().Uint32Value() : this->matrix_->width();
	const auto h	  = info[2].IsNumber() ? info[2].As<Napi::Number>().Uint32Value() : this->matrix_->height();
	const auto data	  = buffer.Data();
	const auto len	  = buffer.Length();

	assert(len == w * h * 3);

	Image* img	  = new Image();
	Color* pixels = (Color*) malloc(sizeof(Color) * w * h);
	for (unsigned int i = 0; i < w * h; i++) {
		auto j = i * 3;
		Color p;
		p.r		  = data[j];
		p.g		  = data[j + 1];
		p.b		  = data[j + 2];
		pixels[i] = p;
	}

	img->setPixels(w, h, pixels);

	assert(img->isValid());

	for (unsigned int y = 0; y < h; y++) {
		if (y > h) break;
		for (unsigned int x = 0; x < w; x++) {
			if (x > w) break;
			auto pixel = img->getPixel(x, y);
			this->canvas_->SetPixel(x, y, pixel.r, pixel.g, pixel.b);
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

Napi::Value LedMatrixAddon::unstable_draw_circle(const Napi::CallbackInfo& info) {
	const auto opts = info[0].As<Napi::Object>();
	const auto env	= info.Env();
	assert(opts.IsObject());
	const auto shape_options = default_shape_options_.apply_napi_value(opts);
	const auto center		 = NapiAdapter<Point>::from_value(opts.Get("center"));
	const auto x0			 = center.x;
	const auto y0			 = center.y;
	const int32_t radius	 = opts.Get("r").As<Napi::Number>().Int32Value();
	assert(radius >= 0);

	int x			= radius;
	int y			= 0;
	int radiusError = 1 - x;

	while (y <= x) {
		if (shape_options.fill && y != radius) {
			native_draw_line(env, -y + x0, -x + y0 + 1, y + x0, -x + y0 + 1, shape_options.color);
			native_draw_line(env, y + x0, x + y0 - 1, -y + x0, x + y0 - 1, shape_options.color);
			native_draw_line(env, x + x0 - 1, y + y0, -x + x0 + 1, y + y0, shape_options.color);
			native_draw_line(env, -x + x0 + 1, -y + y0, x + x0 - 1, -y + y0, shape_options.color);
		}

		native_set_pixel(env, -y + x0, -x + y0, shape_options.color);
		native_set_pixel(env, y + x0, -x + y0, shape_options.color);

		native_set_pixel(env, y + x0, x + y0, shape_options.color);
		native_set_pixel(env, -y + x0, x + y0, shape_options.color);

		native_set_pixel(env, -x + x0, -y + y0, shape_options.color);
		native_set_pixel(env, x + x0, -y + y0, shape_options.color);

		native_set_pixel(env, x + x0, y + y0, shape_options.color);
		native_set_pixel(env, -x + x0, y + y0, shape_options.color);

		y++;

		if (radiusError < 0)
			radiusError += 2 * y + 1;
		else {
			x--;
			radiusError += 2 * (y - x + 1);
		}
	}

	return info.This();
}

Napi::Value LedMatrixAddon::unstable_draw_rectangle(const Napi::CallbackInfo& info) {
	const auto env	= info.Env();
	const auto opts = info[0].As<Napi::Object>();
	assert(opts.IsObject());
	const auto shape_options = default_shape_options_.apply_napi_value(opts);
	auto p0					 = NapiAdapter<Point>::from_value(opts.Get("p0"));
	auto p1
	  = opts.Has("p1")
		  ? NapiAdapter<Point>::from_value(opts.Get("p1"))
		  : Point(p0.x + opts.Get("w").As<Napi::Number>().Int32Value(), p0.y + opts.Get("h").As<Napi::Number>().Int32Value());

	if (!shape_options.fill) {
		native_draw_line(env, p0.x, p0.y, p1.x, p0.y, shape_options.color);
		native_draw_line(env, p1.x, p0.y, p1.x, p1.y, shape_options.color);
		native_draw_line(env, p1.x, p1.y, p0.x, p1.y, shape_options.color);
		native_draw_line(env, p0.x, p1.y, p0.x, p0.y, shape_options.color);
	}
	else {
		for (auto y = p0.y; y <= p1.y; y++) {
			native_draw_line(env, p0.x, y, p1.x, y, shape_options.color);
		}
	}

	return info.This();
}

bool compareDoublesEqual(double a, double b) {
	return std::abs(a - b) < (double) 0.000001;
}

Napi::Value LedMatrixAddon::unstable_draw_polygon(const Napi::CallbackInfo& info) {
	const auto env	= info.Env();
	const auto opts = info[0].As<Napi::Object>();
	assert(opts.IsObject());
	const auto shape_options = default_shape_options_.apply_napi_value(opts);
	assert(opts.Get("ps").IsArray());
	const auto tuple_array = opts.Get("ps").As<Napi::Array>();
	const auto count	   = tuple_array.Length();
	assert(count > 1);

	std::vector<Edge> edges;
	Point points[count];
	Point p0	 = NapiAdapter<Point>::from_value(tuple_array[uint32_t(0)]);
	auto mins	 = p0;
	auto maxs	 = p0;
	Point p_prev = p0;
	Point p_curr;

	for (uint32_t i = 1; i < count; i++) {
		p_curr = NapiAdapter<Point>::from_value(tuple_array[i]);
		mins.minimize(p_curr);
		maxs.maximize(p_curr);
		edges.push_back(Edge(p_curr, p_prev));
		native_draw_line(env, p_prev.x, p_prev.y, p_curr.x, p_curr.y, shape_options.color);

		if (i == count - 1) {
			edges.push_back(Edge(p_curr, p0));
			native_draw_line(env, p_curr.x, p_curr.y, p0.x, p0.y, shape_options.color);
		}

		p_prev = p_curr;
	}

	if (shape_options.fill) return info.This();

	uint32_t width	= maxs.x - mins.x + 1;
	uint32_t height = maxs.y - mins.y + 1;

	bool fill_flag = false; // Running flag for filling polygon point-by-point.

	for (uint32_t p = 0; p < width * height; p++) {
		// Ray casting coordinates
		double y = mins.y + floor(p / width);
		double x = mins.x + (p % width);

		if (x == mins.x) {
			fill_flag = false;
		}

		std::vector<int> line_indexes_at_p; // Vector of index of line within "edges" vector.
		int edges_at_p = 0;					// Like The Rentals' song.  :)

		// Loop through all edges at this point, p.
		for (uint32_t i = 0; i < edges.size(); i++) {
			if (
			  ((y == (int) round((edges[i].m * x) + edges[i].b) && edges[i].m == 0)
			   || (x == (int) round((y - edges[i].b) / edges[i].m)) || isinf(edges[i].m))
			  && (((x >= edges[i].x0 && x <= edges[i].x1) || (x >= edges[i].x1 && x <= edges[i].x0)) && ((y >= edges[i].y0 && y <= edges[i].y1) || (y >= edges[i].y1 && y <= edges[i].y0)))) {
				line_indexes_at_p.push_back(i);
				edges_at_p++;
			}
		}
		// Fill logic start

		// At a vertex vs. a line.
		if (edges_at_p > 1) {
			auto e0 = edges[line_indexes_at_p[0]];
			auto e1 = edges[line_indexes_at_p[1]];

			// Here's where it gets nuts.
			// How many edges does the imaginary ray (y += 0.001) cross and if more than one, are the points on each
			// line on same side of the imaginary line. Calculate the imaginary x on each line of imaginary y.
			double imaginary_y	= y + 0.001;
			double imaginary_x0 = (imaginary_y - e0.b) / e0.m; // Division by zero is happening.TODO
			double imaginary_x1 = (imaginary_y - e1.b) / e1.m;

			// We have our imaginary y and our imaginary xes.  Are these valid points on each line?
			bool imaginary_0_valid_point
			  = ((compareDoublesEqual(imaginary_y, (e0.m * imaginary_x0) + e0.b)) && ((imaginary_x0 >= e0.x0 && imaginary_x0 <= e0.x1) || (imaginary_x0 <= e0.x0 && imaginary_x0 >= e0.x1)));
			bool imaginary_1_valid_point
			  = ((compareDoublesEqual(imaginary_y, (e1.m * imaginary_x1) + e1.b)) && ((imaginary_x1 >= e1.x0 && imaginary_x1 <= e1.x1) || (imaginary_x1 <= e1.x0 && imaginary_x1 >= e1.x1)));

			// If an imaginary point exists on each of the edges, toggle on and then off. (2 in my old thinking)
			if (imaginary_0_valid_point & imaginary_1_valid_point) {
				native_set_pixel(info.Env(), x, y, shape_options.color);
			}
			// If an imaginary point exists on only one line (because of a cusp, for example), we've only crossed one
			// line, effectively treating this as a side instead of a vertex.  Toggle fill on or off.
			if (imaginary_0_valid_point ^ imaginary_1_valid_point) {
				fill_flag = !fill_flag;
			}
		}

		// At a line vs. a vertex.
		if (edges_at_p == 1 && edges[line_indexes_at_p[0]].m != 0) { // And slope != 0
			fill_flag = !fill_flag;
		}

		if (fill_flag) {
			native_set_pixel(info.Env(), x, y, shape_options.color);
		}
		// Fill logic end
	}

	return info.This();
}

Napi::Value LedMatrixAddon::unstable_draw_line(const Napi::CallbackInfo& info) {
	const auto env = info.Env();
	assert(info[0].IsObject());
	const auto opts			 = info[0].As<Napi::Object>();
	const auto shape_options = default_shape_options_.apply_napi_value(opts);
	auto p0					 = NapiAdapter<Point>::from_value(opts.Get("p0"));
	auto p1					 = NapiAdapter<Point>::from_value(opts.Get("p1"));

	native_draw_line(env, p0, p1, shape_options.color);

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
	if (!font_) throw Napi::Error::New(info.Env(), "Cannot draw text because the font has not been set!");
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
		for (auto y = y0; y <= y1; y++) {
			DrawLine(this->canvas_, x0, y, x1, y, fg_color_);
		}
	}
	else {
		this->canvas_->Fill(fg_color_.r, fg_color_.g, fg_color_.b);
	}
	return info.This();
}

Napi::Value LedMatrixAddon::height(const Napi::CallbackInfo& info) {
	return Napi::Number::From(info.Env(), this->matrix_->height());
}

Napi::Value LedMatrixAddon::width(const Napi::CallbackInfo& info) {
	return Napi::Number::From(info.Env(), this->matrix_->width());
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
	native_set_pixel(info.Env(), x, y, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::fg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		fg_color_ = NapiAdapter<Color>::from_value(info[0]);
		return info.This();
	}
	else {
		return NapiAdapter<Color>::into_value(info.Env(), fg_color_);
	}
}

Napi::Value LedMatrixAddon::bg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		bg_color_ = NapiAdapter<Color>::from_value(info[0]);
		return info.This();
	}
	else {
		return NapiAdapter<Color>::into_value(info.Env(), bg_color_);
	}
}

Napi::Value LedMatrixAddon::shape_options(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		assert(info[0].IsObject());
		const auto opts		   = info[0].As<Napi::Object>();
		default_shape_options_ = default_shape_options_.apply_napi_value(opts);
		return info.This();
	}
	else {
		return default_shape_options_.into_value(info.Env());
	}
}

Napi::Value LedMatrixAddon::font(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto font	= Napi::ObjectWrap<FontAddon>::Unwrap(info[0].As<Napi::Object>());
		this->font_ = &(font->font);
		font_name_	= font->name(info).ToString();
		return info.This();
	}
	else {
		return Napi::String::New(info.Env(), font_name_);
	}
}

/**
 * Native draw functions
 */
void LedMatrixAddon::native_draw_line(const Napi::Env env, Point& p0, Point& p1, const Color& color) {
	native_draw_line(env, p0.x, p0.y, p1.x, p1.y, color);
}

void LedMatrixAddon::native_draw_line(const Napi::Env env, int x0, int y0, int x1, int y1, const Color& color) {
	// This implementation is copied directly from the native graphics.cc source
	int dy = y1 - y0, dx = x1 - x0, gradient, x, y, shift = 0x10;

	if (abs(dx) > abs(dy)) {
		// x variation is bigger than y variation
		if (x1 < x0) {
			std::swap(x0, x1);
			std::swap(y0, y1);
		}
		gradient = (dy << shift) / dx;

		for (x = x0, y = 0x8000 + (y0 << shift); x <= x1; ++x, y += gradient) {
			native_set_pixel(env, x, y >> shift, color);
		}
	}
	else if (dy != 0) {
		// y variation is bigger than x variation
		if (y1 < y0) {
			std::swap(x0, x1);
			std::swap(y0, y1);
		}
		gradient = (dx << shift) / dy;
		for (y = y0, x = 0x8000 + (x0 << shift); y <= y1; ++y, x += gradient) {
			native_set_pixel(env, x >> shift, y, color);
		}
	}
	else {
		native_set_pixel(env, x0, y0, color);
	}
}

void LedMatrixAddon::native_set_pixel(const Napi::Env env, const Point& p, const Color& color) {
	native_set_pixel(env, p.x, p.y, color);
}

void LedMatrixAddon::native_set_pixel(const Napi::Env env, const int x, const int y, const Color& color) {
	if (map_pixels_cb_.IsEmpty()) {
		this->canvas_->SetPixel(x, y, color.r, color.g, color.b);
	}
	else {
		auto mapped = map_pixels_cb_.Call({ NapiAdapter<Pixel>::into_value(env, Pixel(origin_, x, y, color)) });
		auto pixel	= NapiAdapter<Pixel>::from_value(mapped);

		this->canvas_->SetPixel(pixel.x, pixel.y, pixel.color.r, pixel.color.g, pixel.color.b);
	}
}

/**
 * This file is a placeholder for the rpi-rgb-led-matrix submodule.
 * It'll be used as the source on a non-linux machine so that npm install doesn't fail.
 */

#if __linux__
#else
	// Disable some diagnostics and issue a compiler warning
	#pragma GCC diagnostic ignored "-Wunused-private-field"
	#pragma GCC diagnostic ignored "-Wunused-variable"
	#ifdef __GNUC__
		#warning "Skipping link of rpi-rgb-led-matrix library."
	#else
		#pragma message("Skipping link of rpi-rgb-led-matrix library.")
	#endif
#endif

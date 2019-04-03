{
  "targets": [
    {
      "target_name": "rpi-led-matrix",
      "sources": [
        "src/addon.cc",
      ],
      'conditions': [
        [ 'OS=="linux"', {
          'sources': [
            "src/led-matrix.addon.cc",
            "src/font.addon.cc",
          ],
          'include_dirs': [
            "./vendor/include",
          ],
          'dependencies': [
            "./binding.gyp:vendor",
          ],
        }],
      ],
      'include_dirs': [
        "<!@(node -p \"require('node-addon-api').include\")",
      ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")",
      ],
      'cflags': [ '-Wall', '-Wextra', '-Wno-missing-field-initializers', '-Wno-unused-variable' ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7',
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      },
    },
    {
			"target_name": "vendor",
			"type": "static_library",
      "defines": [
        "DREMOVE_DEPRECATED_TRANSFORMERS"
      ],
      'conditions': [
        [ 'OS!="linux"', {
          'sources': [
            './src/unsupported.cc'
          ]
        }],
        [ 'OS=="linux"', {
          'sources': [
            "./vendor/lib/thread.cc",
            "./vendor/lib/pixel-mapper.cc",
            "./vendor/lib/options-initialize.cc",
            "./vendor/lib/multiplex-mappers.cc",
            "./vendor/lib/led-matrix-c.cc",
            "./vendor/lib/led-matrix.cc",
            "./vendor/lib/graphics.cc",
            "./vendor/lib/gpio.cc",
            "./vendor/lib/framebuffer.cc",
            "./vendor/lib/content-streamer.cc",
            "./vendor/lib/bdf-font.cc",
            "./vendor/lib/hardware-mapping.c"
          ],
          "libraries": ["-lrt", "-lm", "-lpthread"],
          "include_dirs": [
            "./vendor/include"
          ],
          "direct_dependent_settings": {
            "include_dirs": [
              "./vendor/include"
            ]
          }
        }]
      ]
    }
  ]
}

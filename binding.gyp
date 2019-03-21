{
  "targets": [
    {
      "target_name": "rpiRgbLedMatrix",
      "sources": [
        "src/rpi-rgb-led-matrix.cc"
      ],
      'include_dirs': [ "<!@(node -p \"require('node-addon-api').include\")" ],
      'dependencies': [ "<!(node -p \"require('node-addon-api').gyp\")" ],
      'cflags': [ '-Wall', '-Wextra', '-Wno-missing-field-initializers', '-Wno-unused-private-field', '-Wno-unused-variable' ],
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
    }
  ]
}

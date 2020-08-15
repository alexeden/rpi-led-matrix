module.exports = {
  root: true,
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  ignorePatterns: [
    '*.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    warnOnUnsupportedTypeScriptVersion: true,
  },
  rules: {
    'implicit-arrow-linebreak': 0,
    'arrow-parens': [
      'error',
      'as-needed',
    ],
    'no-void': 0,
    'no-plusplus': 0,
    radix: 0,
    'no-bitwise': 0,
    'brace-style': [
      'error',
      'stroustrup',
    ],
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    'no-console': [
      'error',
      {
        allow: [
          'error',
        ],
      },
    ],
    'array-bracket-spacing': [
      'error',
      'always',
    ],
    'comma-dangle': [
      'error',
      {
        arrays: 'always',
        objects: 'always',
        imports: 'always',
        exports: 'always',
        functions: 'never',
      },
    ],
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple',
      },
    ],
    'default-case': 'off',
    'no-dupe-class-members': 'off',
    'no-undef': 'off',
    '@typescript-eslint/consistent-type-assertions': 'warn',
    '@typescript-eslint/class-literal-property-style': [
      'warn',
      'fields',
    ],
    '@typescript-eslint/consistent-type-definitions': [
      'off',
      'type',
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public',
      },
    ],
    indent: 0,
    '@typescript-eslint/indent': [
      'error',
      2,
    ],
    'func-call-spacing': 0,
    '@typescript-eslint/func-call-spacing': [
      'error',
    ],
    'keyword-spacing': 0,
    '@typescript-eslint/keyword-spacing': [
      'error',
    ],
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': [
      'error',
    ],
    '@typescript-eslint/no-extraneous-class': [
      'error',
      {
        allowStaticOnly: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-mixed-operators': 0,
    'consistent-return': 0,
    '@typescript-eslint/member-delimiter-style': [
      'error',
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeLike',
        format: [
          'StrictPascalCase',
        ],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
      },
      {
        selector: 'variableLike',
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
        filter: {
          match: false,
          regex: '_id|_',
        },
        format: null,
      },
      {
        selector: 'memberLike',
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
        filter: {
          match: false,
          regex: '_id',
        },
        format: null,
      },
      {
        selector: 'typeParameter',
        format: [
          'StrictPascalCase',
        ],
      },
    ],
    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    semi: 0,
    '@typescript-eslint/semi': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/unbound-method': [
      'error',
      {
        ignoreStatic: true,
      },
    ],
    'no-use-before-define': 'off',
    'no-nested-ternary': 0,
    '@typescript-eslint/no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: false,
        variables: false,
        typedefs: false,
      },
    ],
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
  },
};

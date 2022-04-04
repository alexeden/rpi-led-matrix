module.exports = {
  root: true,
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    warnOnUnsupportedTypeScriptVersion: true,
  },
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['class', 'typeLike'],
        format: ['StrictPascalCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
      },
      {
        selector: 'variableLike',
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
        filter: {
          match: false,
          regex: '(_|__)',
        },
        format: null,
      },
      {
        selector: 'memberLike',
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
        // filter: {
        //   match: false,
        //   regex: '(_id|__typename|__resolveType)',
        // },
        format: null,
      },
      {
        selector: 'typeParameter',
        format: ['StrictPascalCase'],
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'none',
      },
    ],
  },
  overrides: [
    // Turn off floating promises rule for examples, which typically
    // wrap everything in an async IIFE
    {
      files: [
        'examples/*'
      ],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      }
    }
  ]
}

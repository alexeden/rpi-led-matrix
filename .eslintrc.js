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
  ignorePatterns: ['./examples', '.eslintrc.js'],
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
    {
      files: [
        'examples/*'
      ],
      // Turn off floating promises rule for examples, which typically
      // wrap everything in an async IIFE
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      }
    },
  ]
}

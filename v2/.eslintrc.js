module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 1,
    'no-undef': 0,
    camelcase: 0,
    'no-await-in-loop': 1,
    'consistent-return': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': 0,
    'max-len': 0,
    'comma-dangle': 0,
  },
};



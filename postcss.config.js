/* eslint-disable no-undef */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    require('autoprefixer'),
    require('postcss-import'),
    require('postcss-nested'),
  ],
}

module.exports = config

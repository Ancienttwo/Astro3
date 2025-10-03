'use strict'

// Simple CommonJS bridge to the compiled distribution bundle.
// Metro/Hermes dev bundler expects a classic CJS export shape here.
const dist = require('./dist/index.js')

module.exports = dist
module.exports.default = dist

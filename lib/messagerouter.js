
var streamMsger = require('./streammessenger')
var debug = require('debug')('message-router')

module.exports = function (message) {
  var fnTransform = function (chunk, enc, cb) {
    if (chunk.message && chunk.message===message) {
      debug('%s: push message=%s', message, chunk.message)
      this.push(chunk)
    }
    cb(null)
  };
  return streamMsger('router', fnTransform);
};

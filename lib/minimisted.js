
var minimist    = require('minimist')
var streamMsger = require('stream-messenger')

module.exports = function () {

  var fnTransform = function (chunk, enc, cb) {
    chunk.body = minimist(chunk.body.slice(2));

    cb(null, chunk);
  };

  return streamMsger('minimist', fnTransform);
};

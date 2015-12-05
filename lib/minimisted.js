
var minimist    = require('minimist')
var streamMsger = require('stream-messenger')

module.exports = function () {

  var fnTransform = function (chunk, enc, cb) {
    chunk.body = minimist(chunk.body.slice(2));

    if (chunk.body['_']) chunk.body.modules = chunk.body['_'];

    cb(null, chunk);
  };

  return streamMsger('minimist', fnTransform);
};

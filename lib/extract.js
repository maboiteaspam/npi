
var streamMsger = require('stream-messenger')

module.exports = function extract (what, transform) {

  var fnTransform = function (chunk, enc, cb) {

    if (what in chunk) transform(chunk[what]);
    else  transform(chunk);

    cb(null, chunk);
  };

  return streamMsger('extract', fnTransform);
};

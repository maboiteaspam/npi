
var streamMsger = require('./streammessenger')

module.exports = function (what, transform) {

  var fnTransform = function (chunk, enc, cb) {

    if (what in chunk) transform(chunk[what]);
    else  transform(chunk);

    cb(null, chunk);
  };

  return streamMsger('extract', fnTransform);
};

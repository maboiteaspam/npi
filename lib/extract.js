
var streamMsger = require('./streammessenger')

module.exports = function (what, transform, arg) {

  var fnTransform = function (chunk, enc, cb) {
    if (what in chunk) transform(arg, chunk[what]);
    else  transform(arg);

    cb(null, chunk);
  };

  return streamMsger('extract', fnTransform);
};

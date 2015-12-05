
var streamMsger = require('./streammessenger')

module.exports = function (what, where) {

  where = !where ? what : where;

  var fnTransform = function (chunk, enc, cb) {

    if (what in chunk) where.push(chunk[what])
    else where.push(chunk)

    cb(null, chunk);
  };

  return streamMsger('push', fnTransform);
};

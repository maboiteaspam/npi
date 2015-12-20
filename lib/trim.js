
var streamMsger = require('stream-messenger')
var trim          = require('trim')

module.exports = function trimT (obj, prop) {

  if (typeof(prop)==='string') prop = [prop]

  var fnTransform = function (chunk, enc, cb) {

    prop.forEach(function (p) {
      if (p in obj) obj[p] = trim(obj[p])
    })

    cb(null, chunk);
  };

  return streamMsger('trimT', fnTransform);
};

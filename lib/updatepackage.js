
var fs = require('fs');
var _ = require('lodash');
var streamMsger = require('stream-messenger')

module.exports = function touch (file, update) {

  var fnTransform = function (chunk, enc, cb) {

    if (typeof update === 'function') update = update(chunk);

    fs.readFile(file, function (err, content) {
      try{
        content = JSON.parse(content)
      } catch(ex) {
        return cb(ex, chunk)
      }


      Object.keys(update).forEach(function (p) {
        if (['string', 'bool', 'number'].indexOf((typeof(content[p])+'').toLowerCase())>-1) {
          content[p] = update[p];
        } else if (p in content) {
          _.merge(content[p], update[p])
        } else {
          content[p] = update[p]
        }
      })

      fs.writeFile(file, JSON.stringify(content, null, 4), function (err) {
        cb(err, chunk);
      });
    });
  };

  return streamMsger('pkg', fnTransform);
};

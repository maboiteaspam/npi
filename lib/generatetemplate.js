
var path  = require('path');
var fs    = require('fs');
var _     = require('lodash')
var streamMsger = require('stream-messenger')

module.exports = function generateTemplate(tplPath, file, vars) {

  var fnTransform = function (chunk, enc, cb) {
    var that = this;
    fs.readFile(path.join(tplPath, file + '.ejs'), function (err, data) {
      if(err) return cb(err, chunk);

      var content;
      try{
        content = _.template(data)(vars);
      }catch(ex){
        ex.message = 'Failed to compile ' + file + '\n' + ex.message;
        return cb(ex, chunk);
      }
      var targetFile = file;
      targetFile = path.join(process.cwd(), targetFile);

      fs.writeFile(targetFile, content , function (err) {
        if(!err) that.emit('message', {message: 'file', body: file});
        cb(err, chunk);
      });
    })
  };

  return streamMsger('genTpl', fnTransform);
};

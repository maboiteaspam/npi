var bubbled = require('bubbled')

module.exports = function (name, fnT, fnF) {
  var stream = bubbled(name, ['message', 'error'], fnT, fnF);
  stream.name = name;
  return stream;
};

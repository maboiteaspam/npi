
var inquirer = require('inquirer');
var streamMsger = require('stream-messenger')

module.exports = function inquireYesNo (what, defaultValue, then) {

  var fnTransform = function (chunk, enc, cb) {

    var questions = [
      {
        type: "confirm",
        name: "response",
        default: defaultValue,
        message: what
      }
    ];

    inquirer.prompt( questions, function( answers ) {
      if (then) then(answers['value'])
      cb(null, chunk)
    });

  };

  return streamMsger('inquire', fnTransform);
};

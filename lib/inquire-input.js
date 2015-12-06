
var inquirer = require('inquirer');
var streamMsger = require('stream-messenger')

module.exports = function inquireInput (what, obj, property) {

  var fnTransform = function (chunk, enc, cb) {

    var questions = [
      {
        type: "input",
        name: "response",
        message: what
      }
    ];

    inquirer.prompt( questions, function( answers ) {
      obj[property] = answers['response'];
      cb(null, chunk)
    });

  };

  return streamMsger('inquire', fnTransform);
};

#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

if (argv.verbose || argv.v) process.env['DEBUG'] = [
  'bubbled',
  'message-router'
].join(' ')


require('console.md')();

var path          = require('path')
var fs            = require('fs')
var _             = require('lodash')
var eventStream   = require('event-stream-writer')
var messageRouter = require('stream-message-router')
var spawn         = require('./lib/spawn')
var touch         = require('./lib/touch')
var push          = require('./lib/push')
var extract       = require('./lib/extract')
var pipeSpawned   = require('./lib/pipespawned')
var npmInstall    = require('./lib/npminstall')


var pkg     = require('./package.json')
var ignored = [
  'node_modules/',
  'npm-debug.log'
];
var files = [];

var templateVars = {
  name        : path.basename(process.cwd()),
  description : "Description of the module.",
  ignored     : ignored,
  modules     : argv['_']
};

var README      = generateTemplate('README.md.ejs', templateVars);
var playground  = generateTemplate('playground.js.ejs', templateVars);
var index       = generateTemplate('index.js.ejs', templateVars);
var gitIgnore   = generateTemplate('.gitignore.ejs', templateVars);


console.log('npi %s', pkg.version)

var npi = messageRouter('npi');
npi
  .pipe(touch('package.json'))
  .pipe(spawn('npm', ['init', '--yes'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['init'], {stdio: 'pipe'}))
  .pipe(touch('README.md', README))
  .pipe(touch('index.js', index))
  .pipe(touch('.gitignore', gitIgnore))
  .pipe(touch('playground.js', playground))
  .pipe(npmInstall(argv['_']))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'pipe'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version], {stdio: 'pipe'}))
;

npi.on('error', function (err) {
  console.error('GOT ERROR %j', err);
});


var msgListener = eventStream('message', npi);
msgListener
  .pipe(messageRouter('file'))
  .pipe(extract('body', function (file) {
    console.mdline("file\t`%s`", file)
  }))
  .pipe(push('body', files));

msgListener
  .pipe(messageRouter('spawn'))
  .pipe(extract('cmd', function (cmd) {
    console.log("")
    console.mdline("spawn\t`%s`", cmd)
  }))
  .pipe(pipeSpawned());


npi.write({
  message : 'npi',
  body    : argv
});

function generateTemplate (file, vars) {
  return _.template(
    fs.readFileSync(path.join(__dirname, 'template', file))
  )(vars);
}

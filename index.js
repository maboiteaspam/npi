#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

if (argv.verbose || argv.v) process.env['DEBUG'] = [
  'bubbler',
  'message-router'
].join(' ')


require('console.md')();

var path          = require('path')
var eventStream   = require('event-stream-writer')
var streamMsger   = require('stream-messenger')
var messageRouter = require('stream-message-router')
var spawn         = require('./lib/spawn')
var choose        = require('./lib/inquire-licence')
var input         = require('./lib/inquire-input')
var bubble        = require('./lib/bubble')
var push          = require('./lib/push')
var extract       = require('./lib/extract')
var genTemplate   = require('./lib/generatetemplate')
var pipeSpawned   = require('./lib/pipespawned')
var updatePkg     = require('./lib/updatepackage')


var pkg     = require('./package.json')
var files   = [];
var ignored = [
  'node_modules/',
  'npm-debug.log'
];

var tplPath       = path.join(__dirname, 'template');
var templateVars  = {
  name            : path.basename(process.cwd()),
  description     : "Description of the module.",
  licence         : 'WTF',
  keywords        : '',
  ignored         : ignored,
  dependencies    : argv['_'].join(' ') + ' ',
  devDependencies : 'npm-explicit-deps'
};


console.log('npi %s', pkg.version)

var npi = messageRouter('npi');
npi
  // npm init
  .pipe(spawn('npm', ['init', '--yes'],
    {stdio: 'inherit'}))
  .pipe(bubble('message',
    {message: 'file', 'body':'package.json'}))

  // gather user input
  .pipe(input('Input the module\'s description :',
    templateVars, 'description'))
  .pipe(input('Input the module\'s keywords :',
    templateVars, 'keywords'))
  .pipe(choose('Please choose a licence :',
    templateVars, 'licence'))
  .pipe( !argv['_'].length
    ? input('Input the module\'s dependencies :',
    templateVars, 'dependencies')
    : streamMsger('skip') )
  .pipe(input('Input the module\'s devDep\'s :',
    templateVars, 'devDependencies'))

   //generate templates
  .pipe(genTemplate(tplPath, 'README.md'    , templateVars))
  .pipe(genTemplate(tplPath, 'playground.js', templateVars))
  .pipe(genTemplate(tplPath, 'index.js'     , templateVars))
  .pipe(genTemplate(tplPath, '.gitignore'   , templateVars))

  // npm module install
  .pipe(spawn('npm', function (){
    var modules = templateVars.dependencies
      .replace(/^\s+/, '').replace(/\s+$/, '').split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save');
  }, {stdio: 'inherit'}))
  .pipe(spawn('npm', function (){
    var modules = templateVars.devDependencies
      .replace(/^\s+/, '').replace(/\s+$/, '').split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save-dev');
  }, {stdio: 'inherit'}))

  // fix package.json file
  .pipe(updatePkg('package.json', function () {
    var explicitBin = require('os').platform().match(/win/)
      ? ".\\node_modules\\.bin\\npm-explicit-deps.cmd" // omg it s so shit bloated.
      : "node_modules/.bin/npm-explicit-deps";
    return {
      scripts          : {
        "patch": "npm version patch -m \"patch %s\"",
        "minor": "npm version minor -m \"minor %s\"",
        "major": "npm version major -m \"major %s\"",
        "preversion": "echo \"npm test: not defined\" && "+explicitBin+" -y",
        "version": "echo \"npm run build: not defined\"",
        "postversion": "git push && git push --tags"
      },
      licence         : templateVars.licence,
      description     : templateVars.description,
      keywords        : templateVars.keywords.split(/\s/)
    };
  }))

  // git init, add, commit
  .pipe(spawn('git', ['init'],
    {stdio: 'inherit'}))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'inherit'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version],
    {stdio: 'inherit'}))
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

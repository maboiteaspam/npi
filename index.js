#!/usr/bin/env node

function usage () {/*

 Usage
   npi [module1 module2]
   npi [opts] -- [module1 module2]

 Options
   -v             verbose
   -h             show help
   -b             add bin.js
   --explicit     invoke rvagg/node-explicit --yes.

 Examples
   npi debug set-verbosity show-help
   npi -b -- debug set-verbosity show-help
   npi -v -- debug set-verbosity show-help

   npi --explicit
   npi -h
 */}

var argv = require('minimist')(process.argv.slice(2));
require('set-verbosity')('npi', process.argv);
var pkg = require('./package.json')
require('show-help')(usage, process.argv, pkg)


require('console.md')();

var path          = require('path')
var eventStream   = require('event-stream-writer')
var streamMsger   = require('stream-messenger')
var messageRouter = require('stream-message-router')
var trimT         = require('@maboiteaspam/npi-utils/trim.js')
var spawn         = require('@maboiteaspam/npi-utils/spawn')
var spawnCopy     = require('@maboiteaspam/npi-utils/spawn-copy')
var choose        = require('@maboiteaspam/npi-utils/inquire-licence')
var input         = require('@maboiteaspam/npi-utils/inquire-input')
var bubble        = require('@maboiteaspam/npi-utils/bubble')
var push          = require('@maboiteaspam/npi-utils/push')
var extract       = require('@maboiteaspam/npi-utils/extract')
var genTemplate   = require('@maboiteaspam/npi-utils/generatetemplate')
var pipeSpawned   = require('@maboiteaspam/npi-utils/pipespawned')
var updatePkg     = require('@maboiteaspam/npi-utils/updatepackage')

var files   = [];
var ignored = [
  'node_modules/',
  'npm-debug.log'
];

var tplPath       = path.join(__dirname, 'template');
var name = path.basename(process.cwd());
var templateVars  = {
  name            : name,
  description     : "Description of the module.",
  author          : '',
  license         : 'WTF',
  keywords        : '',
  ignored         : ignored,
  bin             : {},
  dependencies    : argv['_'].join(' ') + ' ',
  devDependencies : ''
};

if (argv.b) templateVars.bin[name] = './bin.js'

console.log('npi %s', pkg.version)

var npi = messageRouter('npi');
npi
  // use npm author as username
  .pipe(spawnCopy.stdout('npm', ['config', 'get', 'init.author.name'], templateVars, 'author'))
  .pipe(trimT(templateVars, ['author']))
  // npm init
  .pipe(spawn('npm', function (){
    return ['init', '--scope='+templateVars.author, '--yes']
  }))
  .pipe(bubble('message', {message: 'file', 'body':'package.json'}))

  // gather user input
  .pipe(input('Input the module\'s description :' , templateVars, 'description'))
  .pipe(input('Input the module\'s keywords :'    , templateVars, 'keywords'))
  .pipe(choose('Please choose a license :'        , templateVars, 'license'))
  .pipe(trimT(templateVars, ['description','keywords','license']))

  .pipe( !argv['_'].length ? spawn('star', [], {silent: true}) : streamMsger('skip'))
  .pipe( !argv['_'].length
    ? input('Input the module\'s dependencies :', templateVars, 'dependencies')
    : streamMsger('skip') )

  .pipe(spawn('star', ['--dev'], {silent: true}))
  .pipe(input('Input the module\'s devDep\'s :',
    templateVars, 'devDependencies'))
  .pipe(trimT(templateVars, ['dependencies', 'devDependencies']))

   //generate templates
  .pipe(genTemplate(tplPath, 'README.md'    , templateVars))
  .pipe(genTemplate(tplPath, 'playground.js', templateVars))
  .pipe(genTemplate(tplPath, 'index.js'     , templateVars))
  .pipe(genTemplate(tplPath, '.gitignore'   , templateVars))
  .pipe( argv.b
    ? genTemplate(tplPath,  'bin.js'        , templateVars)
    : streamMsger('skip') )

  // npm module install
  .pipe(spawn('npm', function (){
    var modules = templateVars.dependencies.split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save');
  }))
  .pipe(spawn('npm', function (){
    var modules = templateVars.dependencies.split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save-dev');
  }))

  // fix package.json file
  .pipe(updatePkg('package.json', function () {

    return {
      scripts : {
        "dcheck"      : "npm outdated --depth=0",
        "patch"       : "npm version patch -m \"patch %s\"",
        "minor"       : "npm version minor -m \"minor %s\"",
        "major"       : "npm version major -m \"major %s\"",
        "preversion"  : "echo \"npm test: not defined\" && npi --explicit",
        "version"     : "echo \"npm run build: not defined\"",
        "postversion" : "git push && git push --tags"
      },
      bin             : templateVars.bin,
      license         : templateVars.license,
      description     : templateVars.description,
      keywords        : templateVars.keywords.split(/\s/)
    };
  }))

  // git init, add, commit
  .pipe(spawn('git', ['init']))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version]))
;

npi.on('error', function (err) {
  console.error('GOT ERROR %j', err);
});

var explicit = messageRouter('explicit');
explicit
  .pipe(spawn('node', [__dirname+'/node_modules/npm-explicit-deps/bin/npm-explicit-deps.js', '-y']))



var main = streamMsger('main');
main.pipe(npi);
main.pipe(explicit);



var msgListener = eventStream('message', main);
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



main.write({
  message : argv.explicit?'explicit':'npi',
  body    : argv
});

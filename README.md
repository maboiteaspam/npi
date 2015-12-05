# npi

Node Project Init

## Install

    npm i maboiteaspam/npi -g

## Usage

    npi [--verbose|-v] [-- module1 module2]
    npi [module1 module2]

## Flow

```js
var ignored = [
  'node_modules/',
  'npm-debug.log'
];

var templateVars = {
  name        : path.basename(process.cwd()),
  description : "Description of the module.",
  ignored     : ignored,
  modules     : argv['_']
};

var npi = messageRouter('npi');
npi
  .pipe(touch('package.json'))
  .pipe(spawn('npm', ['init', '--yes'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['init'], {stdio: 'pipe'}))
  .pipe(genTemplate(tplPath, 'README.md'    , templateVars))
  .pipe(genTemplate(tplPath, 'playground.js', templateVars))
  .pipe(genTemplate(tplPath, 'index.js'     , templateVars))
  .pipe(genTemplate(tplPath, '.gitignore'   , templateVars))
  .pipe(npmInstall(argv['_']))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'pipe'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version], {stdio: 'pipe'}))
;
```

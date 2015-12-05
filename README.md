# npi

Node Project Init

## Install

    npm i maboiteaspam/npi -g

## Usage

    npi [--verbose|-v [--]] [module1 module2]
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

var README      = generateTemplate('README.md.ejs', templateVars);
var playground  = generateTemplate('playground.js.ejs', templateVars);
var index       = generateTemplate('index.js.ejs', templateVars);
var gitIgnore   = generateTemplate('.gitignore.ejs', templateVars);

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
```

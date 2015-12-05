# npi

node project init.

## Install

    npm i maboiteaspam/npi -g

## Usage

    npi [-m module1 module2] [--verbose|-v]

## Flow

```js
var gitIgnored = [
  'node_modules/',
  'npm-debug.log'
];

npi
  .pipe(minimisted())
  .pipe(touch('package.json'))
  .pipe(spawn('npm', ['init', '--yes'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['init'], {stdio: 'pipe'}))
  .pipe(touch('README.md', '# package\n\n## Install\n\n\tnpm i package --save-dev\n\n## Usage\n\n## More\n\n'))
  .pipe(touch('index.js'))
  .pipe(touch('.gitignore', gitIgnored.join('\n')))
  .pipe(touch('playground.js'))
  .pipe(npmInstall())
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'pipe'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version], {stdio: 'pipe'}))

```

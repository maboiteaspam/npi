# npi

node project init.

# Install

    npm i maboiteaspam/npi -g

# Usage

    npi [-m module1 module2] [--verbose|-v]

# Flow

```js
var gitIgnored = [
  'node_modules/',
  'npm-debug.log'
];

npi
  .pipe(spawn('npm', ['init', '--yes'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['init'], {stdio: 'pipe'}))
  .pipe(touch('index.js'))
  .pipe(touch('.gitignore', gitIgnored.join('\n')))
  .pipe(touch('playground.js'))
  .pipe(spawn('git', ['status'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['add', '-A'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['status'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version], {stdio: 'pipe'}))
  .pipe(npmInstall())

```

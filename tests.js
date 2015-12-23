require('mocha')
require('should')

var fs = require('fs-extra')

before(function () {

  fs.removeSync('tomate')
  fs.mkdirsSync('tomate')

  var c = require('child_process').spawn('npi', ['-b', '--wd', 'tomate'])
  c.stdout.pipe(process.stdout)
  c.stderr.pipe(process.stderr)
})

describe('some stuff', function () {
  it('should pass', function (d){
    false.should.be.true()
    d()
  })
})
require('mocha')
require('should')

var fs = require('fs-extra')

before(function (done) {

  fs.removeSync('test')
  fs.mkdirsSync('test')

  //var c = require('child_process').spawn('npi', ['-b', '--wd', 'tomate'])
  //c.stdout.pipe(process.stdout)
  //c.stderr.pipe(process.stderr)
  //c.on('close', function () {done()})
  done()
})

describe('some stuff', function () {
  it('should pass', function (d){
    false.should.be.true()
    d()
  })
})
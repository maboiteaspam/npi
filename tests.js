require('mocha')
require('should')

var fs = require('fs-extra')

before(function () {

  fs.removeSync('tomate')
  fs.mkdirsSync('tomate')

  require('child_process').spawn('npi', ['-b', '--wd', 'tomate'])
})

describe('some stuff', function () {
  it('should pass', function (d){
    false.should.be.true()
    d()
  })
})
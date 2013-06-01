var app = require('../support/app').create('mysql');

describe('MySQL Storage', function () {
  it('Installs correctly...', function (done) {
    app.install(function (err) {
      (err === null).should.be.true;

      console.log(err);

      done();
    });
  });

  require('../support/storage').run(app);
});
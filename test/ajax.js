var app = require('./support/server');

describe('AJAX Web Requests', function () {
  var payload = {
    test: 1
  };
  var id;

  it('should create successfully', function (done) {
    app.postBase('/ajax/create').send({
      payload: JSON.stringify({
        test: 1
      }),

      type: 'json'
    }).expect(200).end(function (err, res) {
      if (!err) {
        var response;

        try {
          response = JSON.parse(res.res.text);
        } catch (e) {}

        require('should').exist(response);
        response.should.have.property('success', true);
        response.should.have.property('id');

        id = response.id;
      }

      done(err);
    });
  });

  it('should retrieve successfully', function (done) {
    app.getJail('/ajax/' + id).expect(200).expect('Content-Type', 'application/json').end(function (err, res) {
      if (!err) {
        (function () {
          payload.should.be.eql(JSON.parse(res.res.text));
        }).should.not.throw();
      }

      done(err);
    });
  });
});
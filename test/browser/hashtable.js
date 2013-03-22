define(['chai', 'lib/hashtable'], function (chai, HashTable) {
  chai.should();

  describe('HashTable', function () {
    describe('#add', function () {
      it('should accept an unseen key', function () {
        var ht = new HashTable();

        (function () {
          ht.add('test', { key: 'value' });
        }).should.not.throw();
      });

      it('should not accept a duplicate key', function () {
        var ht = new HashTable();
        ht.add('test', { key: 'value' });

        (function () {
          ht.add('test', { key: 'value' });
        }).should.throw(/duplicate/i);
      });

      it('should not accept an invalid key type', function () {
        var ht = new HashTable();

        var value = { key: 'value' };
        var keys = [
          1.5,
          -2,
          [],
          {}
        ];

        keys.forEach(function (key) {
          (function () {
            ht.add(key, value);
          }).should.throw(/invalid/i);
        });
      });
    });

    describe('#get', function () {
      it('should return the same object that was added', function () {
        var ht = new HashTable();

        var value = { key: 'value' };
        ht.add('test', value);

        ht.get('test').should.equal(value);
      });

      it('should throw on an unknown key', function () {
        var ht = new HashTable();

        (function () {
          ht.get('test');
        }).should.throw(/exist/i);
      });
    });

    describe('#remove', function () {
      it('should remove only the target item', function () {
        var ht = new HashTable();

        var value = { key: 'value' };
        ht.add('A', value);
        ht.add('B', value);
        ht.add('C', value);

        (function () {
          ht.remove('B');
        }).should.not.throw();

        (function () {
          ht.get('B');
        }).should.throw(/exist/i);

        ht.get('A').should.equal(value);
        ht.get('C').should.equal(value);
      });
    });
  });
});

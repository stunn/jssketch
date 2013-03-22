define(
  ['chai', 'librarymanager/jsonreader', 'librarymanager/models'],
  function (chai, JsonReader, models)
  {
    chai.should();

    describe('JsonReader', function () {
      it('should return the correct libraries', function () {
        var input = [
          {
            libraryType: 'js',
            libraryId: 1,
            versionId: "1",
            dependsOn: null
          },
          {
            libraryType: 'js',
            libraryId: 2,
            versionId: "2",
            dependsOn: null
          }
        ];

        var expected = [
          {
            id: 1,
            name: 'jQuery',
            version: '1.9.0',
          },
          {
            id: 2,
            name: 'jQuery UI',
            version: '1.8.24',
          }
        ];

        var reader = new JsonReader(input);
        var actual = reader.read();

        actual.length.should.equal(expected.length);

        for (var i = 0, len = actual.length; i != len; i++) {
          ['id', 'name', 'version'].forEach(function (property) {
            actual[i].get(property).should.equal(expected[i][property]);
          });
        }
      });

      it('should setup one-deep dependencies properly', function () {
        // Because we expose the entire dep chain as a flat list, we should
        // never require more than one level of nesting - though the importer
        // supports more.
        var input = [
          {
            libraryType: 'js',
            libraryId: 1,
            versionId: '1',
            dependsOn: null
          },
          {
            libraryType: 'js',
            libraryId: 2,
            versionId: '2',
            dependsOn: [
              {
                libraryType: 'js',
                libraryId: 1,
                versionId: '1',
                dependsOn: null
              }
            ]
          }
        ];

        var reader = new JsonReader(input);
        var actual = reader.read();

        actual[1].dependsOn[0].should.equal(actual[0]);
      });
    });
  }
);

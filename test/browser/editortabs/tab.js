define(['chai', 'editortabs/tab'], function (chai, Tab) {
  chai.should();

  describe('Tab', function () {
    it('should accept a jQ-wrapped DOM element', function () {
      var el = $('<div />');
      var tab = new Tab({
        id: 'test',
        contentEl: el
      });

      tab.validate().should.be.true;
    });
    it('should not accept an un-jQ-wrapped DOM element', function () {
      var el = document.createElement('div');
      var tab = new Tab({
        id: 'test',
        contentEl: el
      });

      tab.validate().should.not.be.true;
    });
  });
});

var Model = require('../models/model');
var Tab = require('./tab')

module.exports = new Model({
	properties: {
		active: {
			type: Tab,
			required: false
		}
	}
});
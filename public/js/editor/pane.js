define(['models/model', 'editor/tab', ], function (Model, Tab) {
	return new Model({
		properties: {
			active: {
				type: Tab,
				required: false
			}
		}
	});
});
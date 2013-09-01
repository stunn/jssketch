define(['models/model', 'models/collection', 'editor/pane', 'editor/tab', 'editor/frame'], function (Model, Collection, Pane, Tab, Frame) {
	function EditorManager(paneContainer, opts) {
		this.paneContainer = paneContainer;
		this.tabContainers = {};
		this.tabs = new Collection(Tab);

		this._options = opts;
		this._panes = new Collection(Pane);

		if (!paneContainer.length) {
			throw new Error('Pane container does not exist');
		}

		for (var i=0;i<this._options.panes;i++) {
			this._panes.push(new Pane());
		}

		this.tabs.on('add', function (tab) {
			// Remove text nodes
			var template = $(this._options.panesTemplate(tab)).filter('*');
			var rebuild = this._panes.length;

			if (template.length !== 1) {
				throw new Error('Hey babe, please return exactly one element to '
										  + 'represent each tab, not ' + template.length);
			}

			this.tabContainers[tab.get('id')] = template.appendTo(this.paneContainer).hide();

			if (this.tabs.length <= this._panes.length) {
				this.setActiveTab(this.tabs.length - 1, tab);
				rebuild = this.tabs.length - 1;
			}

			tab.on('internal-show', function (pane) {
				var nav = this.tabContainers[tab.get('id')].find(this._options.navContainer).empty();

				template.show();
				this.tabs.forEach(function (tab) {
					var el = this._options.navBuilder(tab, this.getActiveTab(pane) === tab);
					var that = this;

					el.on('click', function () {
						this.setActiveTab(pane, tab);
					}.bind(this));

					nav.append(el);
				}, this);
			}.bind(this));

			tab.on('hide', function (pane) {
				template.hide();
			});
		}.bind(this));
	}

	EditorManager.prototype.setActiveTab = function (pane, tab) {
		var frames = {
			show: [],
			hide: []
		};

		if (typeof pane === 'number') {
			pane = this._panes[pane];
		}

		if (!(pane instanceof Pane)) {
			throw new Error('Pane does not exist');
		}

		if (typeof tab === 'string') {
			for (var i=0;i<this.tabs.length;i++) {
				if (this.tabs[i].get('id') === tab) {
					tab = this.tabs[i];

					break;
				}
			}
		}

		if (!(tab instanceof Tab)) {
			throw new Error('Tab does not exist');
		}

		if (pane.get('active')) {
			frames.hide.push(new Frame(pane, pane.get('active')));
		}

		frames.show.push(new Frame(pane, tab));

		// If another pane is showing the same tab, we want to swap.
		for (var i=0;i<this._panes.length;i++) {
			var other = this._panes[i];

			if (other !== pane && other.get('active') === tab) {
				frames.hide.push(new Frame(other, other.get('active')));
				frames.show.push(new Frame(other, pane.get('active')));
			}
		}

		frames.show = frames.show.slice(-2);

		['hide', 'show'].forEach(function (which) {
			frames[which].forEach(function (frame) {
				if (which === 'show') {
					frame.pane.set('active', frame.tab);
				}

				frame.tab.trigger('internal-' + which, [frame.pane]);
				frame.tab.trigger(which, [frame.pane]);
			}, this);
		}, this);

		this._sortPanes();
	};

	EditorManager.prototype.getActiveTab = function (pane) {
		if (typeof pane === 'number') {
			pane = this._panes[pane];
		}

		if (!(pane instanceof Pane)) {
			throw new Error('Pane does not exist');
		}

		return pane.get('active');
	}

	EditorManager.prototype._sortPanes = function () {
		var siblings = this.paneContainer.children();
		var that = this;
		var panes = [].filter.call(this._panes, function (a) {
			return typeof that.getActiveTab(a) !== 'undefined';
		})

		function getCont(pane) {
			return that.tabContainers[that.getActiveTab(pane).get('id')]
		}

		function getPos(pane) {
			return siblings.index(getCont(pane));
		}

		// Need to find tab corresponding to each pane
		for (var i=0;i<panes.length - 1;i++) {
			var tabPos = getPos(panes[i]);

			if (this.getActiveTab(i).get('detachable')) {
				getCont(panes[i]).insertBefore(getCont(panes[i + 1]));
			} else {
				for (var j=i+1;j<panes.length;j++) {
					var otherPos = getPos(panes[j]);

					if (tabPos > otherPos) {
						if (this.getActiveTab(j).get('detachable')) {
							getCont(panes[j]).insertAfter(getCont(panes[i]));
						} else {
							throw new Error('Panes cannot be exchanged; neither are detachable');
						}
					}
				}
			}
		}
	};

	EditorManager.prototype._buildNavigationFor = function (pane) {
		var nav = this.tabContainers[pane.getActiveTab().get('id')].find(this._options.navContainer).empty();

		this.tabs.forEach(function (tab) {
			var el = this._options.navBuilder(tab, pane.getActiveTab() === tab);
			var that = this;

			el.on('click', function () {
				pane.setActiveTab(tab);
			});

			nav.append(el);
		}, this);
	};

	return EditorManager;
});
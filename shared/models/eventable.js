define(function () {
  function initEventChain(obj, event, filter) {
    if (!obj.hasOwnProperty('_events')) {
      obj._events = {};
    }

    var events = obj._events[event] = (obj._events[event] || {});

    return events[filter] || (events[filter] = []);
  }

  return function (base) {
    /**
     * Attaches an event handler for the "event" event, optionally filtered by the
     * "filter" filter. In practise, the "event" is something generic like "change",
     * and "filter" is something more specific such as the property the change
     * event was fired on.
     *
     * @param event The name of the event we want to subscribe for
     * @param filter Default '*' (i.e. all occurences of the event). Allows us to
     *        optionally filter for only specific types of the event.
     * @param callback The callback function. "this" will be the instance the event
     *        occured on
     * @return self
     */
    base.prototype.on = function (event, filter, callback) {
      if (typeof filter === "function") {
        callback = filter;
        filter = '*';
      };

      initEventChain(this, event, filter).push(callback);

      return this;
    };

    /**
     * Triggers the "event" event on the Model Instance.
     *
     * @param event: The name of the event to trigger
     * @param filter: An optional filter of the event (@see on). Default is '*'
     * @param local: Whether the global '*' event will be supressed. Default is false
     *        this is mainly used internally.
     * @return self
     */
    base.prototype.trigger = function (event, filter, local) {
      filter = filter || '*';

      initEventChain(this, event, filter).forEach(function (callback) {
        callback.apply(this);
      }, this);

      if (filter !== '*' && !local) {
        this.trigger(event, '*');
      }

      return this;
    };
  };
});
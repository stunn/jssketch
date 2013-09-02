(function () {
	var cache = {};

	this.define = function (path, func) {
		func(function (module) {
			var other = module.split('/');
			var curr = path.split('/');
			var target;

			other.push(other.pop() + '.js');
			curr.pop();

			while (other.length) {
				var next = other.shift();

				switch (next) {
				case '.':
				break;
				case '..':
					curr.pop();
				break;
				default:
					curr.push(next);
				}
			}

			target = curr.join('/');

			if (!cache[target]) {
				throw new Error(target + ' required by ' + path + ' before it is defined.');
			} else {
				return cache[target].exports;
			}
		}, cache[path] = {
			exports: {}
		});
	};
}.call(this));
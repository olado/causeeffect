/*
* causeeffect - simple evented flow control for nodejs
* Copyright 2011, Laura Doktorova
* http://github.com/olado/causeeffect
*
* Licensed under the MIT license.
*
* Version: 0.1.0
*/

(function() {
	var sys = require("sys"),
		events = require('events');

	function CauseEffect() {
		events.EventEmitter.call(this);
		this.events = {};
	}
	sys.inherits(CauseEffect, events.EventEmitter);

	exports.version = '0.1.0';
	exports.CauseEffect = CauseEffect;

	function setEffect(effect, state) {
		if (state) {
			this.events[effect].$state = state;
			this.emit(effect);
			if (this.events[effect] && this.events[effect].$state === state) {
				this.setState(effect, state);
			}
		} else {
			this.events[effect].$state = undefined;
		}
	}

	function evalCauses(effect) {
		var toeval = this.events[effect] && this.events[effect].$and, i;
		if (toeval && toeval.length) {
			for(i=toeval.length-1; i >=0 && this.events[toeval[i]] && this.events[toeval[i]].$state; i-=1 ) {}
			setEffect.call(this, effect, (i < 0) ? 1 : undefined);
			if (i < 0) {
				return;
			}
		}
		toeval = this.events[effect] && this.events[effect].$or;
		if (toeval && toeval.length) {
			for(i=toeval.length-1; i >=0 && !(this.events[toeval[i]] && this.events[toeval[i]].$state); i-=1 ) {}
			setEffect.call(this, effect, (i >= 0) ? 1 : undefined);
		}
	}

	function isArray (v) {
		return Object.prototype.toString.call(v) === '[object Array]';
	}

	CauseEffect.prototype.setState = function(event, state) {
		if (!this.events[event]) {
			this.events[event] = { $state : (arguments.length === 1) ? 1 : state };
		} else {
			var t = this.events[event];
			if (t.$counter) {
				t.$counter -= 1;
				if (t.$counter === 0) {
					setEffect.call(this, event, 1);
				}
				return;
			} else {
				t.$state = (arguments.length === 1) ? 1 : state ;
			}

			var eff = t.$effects;
			if (eff) {
				for(var e in eff) {
					if (eff.hasOwnProperty(e)) {
						evalCauses.call(this, e);
					}
				}
			}
		}
	};

	CauseEffect.prototype.getState = function(event) {
		var ev = this.events[event];
		if (ev) {
			if (ev.$counter !== undefined) {
				return ev.$counter;
			}
			return ev.$state;
		}
	};

	CauseEffect.prototype.setEvents = function(effect, causes, orop) {
		this.events[effect] = this.events[effect] || {};

		if (!isNaN(causes)) {
			//ticker case
			this.events[effect].$counter = causes;
			return;
		}


		var index, self, i, cause;

		if (!isArray(causes)) {
			index = arguments.length-1;
			if (typeof arguments[index] === 'boolean') {
				causes = Array.prototype.slice.call(arguments, 1, index);
				orop = arguments[index];
			} else {
				causes = Array.prototype.slice.call(arguments, 1);
				orop = undefined;
			}
		}

		this.events[effect][(orop) ? '$or' : '$and'] = causes;
		// go through causes and see which ones need to be reevaluated
		index = causes.length;
		for(i=0; i <index; i+=1) {
			cause = causes[i];
			if (!this.events[cause]) {
				this.events[cause] = {};
			}
			if (!this.events[cause].$effects) {
				this.events[cause].$effects = {};
			}
			this.events[cause].$effects[effect] = 1;
		}
		// evaluate current state
		if (index) {
			self = this;
			process.nextTick(function() {
				if (self.getState(effect) === undefined) {
					evalCauses.call(self, effect);
				}
			});
		}
	};

	function cleanupRelatedEvents(effect, causes, dontwipe) {
		var count = causes.length, i, cause;
		for(i=0; i <count; i+=1) {
			cause = causes[i];
			if (this.events[cause]) {
				if (dontwipe) {
					if (this.events[cause].$effects) {
						delete this.events[cause].$effects[effect];
					}
				} else {
					delete this.events[cause];
				}
			}
		}
	}

	CauseEffect.prototype.removeEvents = function(events/*, event2,...*/, dontwipe) {
		var args, count, i, event, item, donotwipe = dontwipe;
		if (isArray(events)) {
			args = events;
		} else {
			i = arguments.length-1;
			if (typeof arguments[i] === 'boolean') {
				args = Array.prototype.slice.call(arguments, 0, i);
				donotwipe = arguments[i];
			} else {
				args = arguments;
				donotwipe = undefined;
			}
		}

		count = args.length;
		for(i=0; i <count; i+=1) {
			item = args[i];
			event = this.events[item];
			if (event) {
				if (event.$or) {
					cleanupRelatedEvents.call(this, item, event.$or, donotwipe);
				}
				if (event.$and) {
					cleanupRelatedEvents.call(this, item, event.$and, donotwipe);
				}
				delete this.events[item];
			}
		}
	};

}());

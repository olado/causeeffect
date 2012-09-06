Created to simplify flow management when programming in asynchronous
environments like nodejs.

CauseEffect extends EventEmitter and allows to set cause-effect scenarios.

It is simple yet effective.

CauseEffect allows you to:
* have an event fired when multiple parallel flows complete.
* easily unite multiple parallel flows initiated from the for loop.
* set up chains: completion of one rule may trigger another.
* set the rules dynamically or statically.
* have an event fired when any of the flows completes.

## To run example:
```
node examples/sample.js
```

## Installation:
```
npm install causeeffect
```

## Usage:
To setup a rule where an event will fire if all of the causes happen:
``` javascript
ce.setEvents("myevent", ["cause1", "cause2", "cause3"]);
```

To setup a rule where an event will fire if some of the causes happen:
``` javascript
ce.setEvents("myevent", ["cause1", "cause2", "cause3"], true);
```

To setup a rule where an event will fire if it happens X times:
``` javascript
ce.setEvents("myevent", 10);
```

Listen to effect event as usual with EventEmitter API:
``` javascript
ce.on("myevent", callback);
```

To let CauseEffect know that the cause has happened call:
``` javascript
ce.setState("cause1");
```
or if you need a specific value use
``` javascript
ce.setState("cause1", value);
```
This value can be then obtained from your event callback with:
``` javascript
ce.getState("cause1")
```

To run example:
```
node examples/sample.js
```

## Sample:

1.	Uniting multiple parallel flows initiated from the for loop:
	
	``` javascript
	var ce = require('causeeffect');
	ce = new ce.CauseEffect();

	// Set up ticker cause. Event "myticker" will fire if ce.setState("myticker") was invoked 4 times.
	// Handy for figuring out when all callbacks have been called initiated from the for loop.
	ce.setEvents("myticker", 4);

	function callback() {
		ce.setState("myticker");
	}

	for(var i = 0; i< 4; i++) {
		setTimeout(callback, 100);
	}

	ce.on("myticker", function() {
	});
	```

2.	Uniting specific parallel flows

	``` javascript
	// Set up AND cause effect. Event "alldone" will be fired if all of causes happen
	ce.setEvents("alldone", ["cause1", "cause2", "myticker"]);

	// Listen to event as usual with EventEmitter API
	ce.on("alldone", function() {
	});


	// To let CauseEffect know that the cause has happened 
	ce.setState("cause1");
	ce.setState("cause2");
	```


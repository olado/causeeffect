var ce = require('../causeeffect');
ce = new ce.CauseEffect();

// Set up AND cause effect. Event "alldone" will be fired if all of causes happen
ce.setEvents("alldone", ["cause1", "cause2", "cause3", "myticker"]);
// Set up OR cause effect. Event "somedone" will be fired if any of causes happen
ce.setEvents("somedone", ["cause1", "cause2", "cause3"], true);
// Set up ticker cause. Event "myticker" will fire if ce.setState("myticker") was invoked 4 times.
// Handy for figuring out when all callbacks have been called initiated from the for loop.
ce.setEvents("myticker", 4);

ce.on("alldone", function() {
	ce.removeEvents("alldone", true);
	console.log("All done: cause1:" +
		ce.getState("cause1")	+ " cause2: " +
		ce.getState("cause2")	+ " cause3: " +
		ce.getState("cause3")   + " myticker: " +
		ce.getState("myticker"));
});

ce.on("somedone", function() {
	console.log("Some done: cause1:" +
		ce.getState("cause1")	+ " cause2: " +
		ce.getState("cause2")	+ " cause3: " +
		ce.getState("cause3"));
});

ce.on("myticker", function() {
	console.log("Ticker completes");
});

console.log("> ce.setState('cause1', 11)");
ce.setState("cause1", 11);

console.log("> ce.setState('cause3')");
ce.setState("cause3");

console.log("> ce.setState('cause2', 12)");
ce.setState("cause2", 12);

function callback() {
	console.log("> ce.setState('myticker')");
	ce.setState("myticker");
}

console.log("Triggering myticker. current value: " + ce.getState("myticker"));
for(var i = 0; i< 4; i++) {
	setTimeout(callback, 100);
}

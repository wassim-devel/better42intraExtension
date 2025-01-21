const express = require("express");
const User = require("../model/user");
const Logtime = require("../classes/Logtime");
const router = new express.Router();

let CachedLogtimes = [];

router.get("/:login/logtime", async (req, res) => {

	let logtime = CachedLogtimes.find((element) => element.login === req.params.login);
	if (!logtime) {
		const newLogtime = new Logtime(req.params.login);
		await newLogtime.create();
		if (!newLogtime.created_at)
			return res.status(404).send("User not foundd");
		CachedLogtimes.push(newLogtime);
		logtime = newLogtime;
	}
	let durations;
	try {
		durations = await logtime.getDurations();
		if (!durations)
			return res.status(404).send("User not foundy");
	}
	catch {
		res.status(500).send("Internal server error");
		return;
	}

	var resLogtime = {};
    durations.forEach(element => {
      resLogtime[new Date(element.date).toLocaleDateString('en-CA')] = element.duration;
    });
    res.send({from: logtime.created_at, ...resLogtime});
});

module.exports = router;
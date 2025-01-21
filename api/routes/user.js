const express = require("express");
const User = require("../model/user");
const { default: Logtime } = require("../classes/Logtime");
const router = new express.Router();

let CachedLogtimes = [];

router.get("/:login/logtime", async (req, res) => {

	let logtime = CachedLogtimes.find((element) => element.login === req.params.login);
	if (!logtime) {
		const newLogtime = new Logtime(req.params.login);
		if (!(await newLogtime.create()))
			return res.status(404).send("User not found");
		CachedLogtimes.push(newLogtime);
		logtime = newLogtime;
	}
	try {

		const durations = await logtime.getDurations();
	}
	catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
		return;
	}
	
	// const user = await User.findByLogin(req.params.login);
	// if (!user) {
	// 	res.status(404).send('User not found');
	// 	return;
	// }
	// const logtime = await user.getLogtime();
	// var resLogtime = {};
    // logtime.forEach(element => {
    //   resLogtime[new Date(element.date).toLocaleDateString('en-CA')] = element.duration;
    // });
    // res.send({from: user.intraUserCreatedAt, ...resLogtime});
});

module.exports = router;
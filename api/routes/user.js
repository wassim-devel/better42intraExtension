const express = require("express");
const User = require("../model/user");
const router = new express.Router();

router.get("/:login/logtime", async (req, res) => {
	const user = await User.findByLogin(req.params.login);
	if (!user) {
		res.status(404).send('User not found');
		return;
	}
	const logtime = await user.getLogtime();
	var resLogtime = {};
    logtime.forEach(element => {
      resLogtime[new Date(element.date).toLocaleDateString('en-CA')] = element.duration;
    });
    res.send({from: user.intraUserCreatedAt, ...resLogtime});
});

module.exports = router;
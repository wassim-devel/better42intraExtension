const express = require("express")
const router = new express.Router();
const User = require("../model/user");
const Token = require("../model/token");
const config = require("../config");
const isLoggedIn = require("../middleware/isLoggedIn");
const api42 = require("../api42");

router.get('/42', (req, res) => {
	res.redirect(api42.getOAuthUrl());
});
  
router.get('/42/callback', async (req, res) => {
	const code = req.query.code;
	try {
		const intraToken = await api42.generateUserToken(code);

		const { id, login, created_at } = await api42.whoAmI(intraToken);

		const user = await User.findOneAndUpdate(
			{ intraId: id },
			{
				intraId: id,
				login: login,
				intraToken: intraToken,
				intraUserCreatedAt: created_at,
				logtime: { durations: [], lastFetchedDate: created_at }
			},
			{ new: true, upsert: true, useFindAndModify: false }
		);


		const token = await Token.create({ user: user._id });
		res.cookie('token', token.accessToken, { maxAge: config.tokenDuration * 1000, httpOnly: true });
		res.redirect(`/auth/redirect?token=${token.accessToken}&login=${login}&maxAge=${token.getExpirationDate() * 1000}`);

	} catch (e) {
		console.error(e);
		res.status(500).send(e);
		return;
	}

});

router.get('/logout', isLoggedIn , async (req, res) => {
	await req.userToken.deleteOne();
	res.clearCookie('token');
	res.send('You are now disconnected');
});


router.get('/redirect', (req, res) => {
	res.send(`You are now connected you can close this tab`);
});
  

module.exports = router;
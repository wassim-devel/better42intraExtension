const { Api42 } = require("@ibertran/api42");

const api42 = new Api42(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CALLBACK_URL);
module.exports = api42;
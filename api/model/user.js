const mongoose = require('../db');
const api42 = require('../api42');

const userSchema = new mongoose.Schema({
    intraId: { type: String, required: true, unique: true },
    login: { type: String, required: true },
    intraToken: { type: {} },
    createdAt: { type: Date, default: Date.now }
});

userSchema.statics.findByLogin = async function(login) {
    const user = await this.findOne({ login });
    if (user) {
        return user;
    }
    try {
        const response = await api42.getUser(login);
        const { id, created_at } = response;

        const user = await this.create({
			intraId: id,
			login: login,
			intraUserCreatedAt: created_at,
			logtime: { durations: [], lastFetchedDate: created_at }
		});
        return user;
    } catch (error) {
        return null;
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;

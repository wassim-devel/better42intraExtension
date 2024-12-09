const mongoose = require('../db');
const api42 = require('../api42');

const userSchema = new mongoose.Schema({
    intraId: { type: String, required: true, unique: true },
    login: { type: String, required: true },
    intraToken: { type: {} },
    createdAt: { type: Date, default: Date.now },
    intraUserCreatedAt: { type: Date, required: true },
    logtime: {
        type: {
            durations : {
                type :[
                    {
                        date: { type: Date, required: true },
                        duration: { type: String, required: true },
                    }
                ],
            },
            lastFetchedDate: { type: Date, required: true }
        },
    },
});

userSchema.methods.getLogtime = async function() {

    const maxUpdatedDate = new Date();
    maxUpdatedDate.setMonth(maxUpdatedDate.getMonth() - 4);
    if (this.logtime.length !== 0 && this.logtime.lastFetchedDate > maxUpdatedDate) {
        return this.logtime.durations;
    }

    try {
        const begin = new Date(this.logtime.lastFetchedDate).toISOString();
        const end = new Date().toISOString();
        const response = await api42.fetch(`/v2/users/${this.login}/locations_stats?begin_at=${begin}&end_at=${end}`);

        for (const date in response) {
            const logtime = this.logtime.durations.find((element) => new Date(element.date) === new Date(date));
            if (logtime) 
                logtime.duration = response.data[date];
            else
                this.logtime.durations.push({date: date, duration: response[date]});
        }
        this.logtime.lastFetchedDate = new Date(Date.now());
        this.save();
        return this.logtime.durations;
    } catch (error) {
        console.error(error);
        return null;
    }
}

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

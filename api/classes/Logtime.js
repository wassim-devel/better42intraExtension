import api42 from "../api42";

export default class Logtime {
	constructor(login) {
		this.login = login;
		this.last_fetched_date = null;
		this.durations = [];
		this.created_at = null;
	}

	async create() {
		try {
			const response = await api42.getUser(this.login);
			this.last_fetched_date = new Date(response.created_at);
			this.created_at = new Date(response.created_at);
		}
		catch (error) {
			console.error(error);
		}
	}

	async update() {
		try {
			const begin = new Date(this.last_fetched_date).toISOString();
			const end = new Date().toISOString();
			const response = await api42.fetch(`/v2/users/${this.login}/locations_stats?begin_at=${begin}&end_at=${end}`);
	
			for (const date in response) {
				const logtime = this.durations.find((element) => new Date(element.date) === new Date(date));
				if (logtime) 
					logtime.duration = response.data[date];
				else
					this.durations.push({date: date, duration: response[date]});
			}
			this.last_fetched_date = new Date();
		} catch (error) {
			console.error(error);
		}
	}

	async getDurations() {
		if (!this.created_at)
			return null;

		const maxUpdatedDate = new Date();
		maxUpdatedDate.setMonth(maxUpdatedDate.getMonth() - 3);
		if (this.durations.length === 0 || this.last_fetched_date < maxUpdatedDate)
			await this.update();
	
		return this.durations;
	}

}
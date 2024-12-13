import React, { useEffect, useState } from 'react';
import { DatePicker, Flex, notification, Spin, Switch } from 'antd';
import moment from 'moment';
const { RangePicker } = DatePicker;

function createArrayExcludingMultiplesOfFive() {
    const result = [];
    for (let i = 0; i < 60; i++) {
        if (i % 15 !== 0) {
            result.push(i);
        }
    }
    return result;
}

async function getCalendar(team_id) {
	let page = await fetch(`https://projects.intra.42.fr/projects/inception/slots?team_id=${team_id}`);
	if (!page.ok) {
		return null;
	}
	page = await page.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(page, "text/html");
	return doc.getElementById('calendar');
}

const SlotSelector = () => {

	const [api, contextHolder] = notification.useNotification();
	const errorNotification = (message) => {
		api.error({
			message: message,
			placement: 'topRight',
		});
	};

	const successNotification = (message) => {
		api.success({
			message: message,
			placement: 'topRight',
		});
	};

	const disabledDate = (date) => {
		return date && date < moment().startOf('day');
	};

	const disabledRangeTime = () => {
		return {
		  disabledHours: () => [],
		  disabledMinutes: () => {
			return createArrayExcludingMultiplesOfFive();
		  },
		  disabledSeconds: () => [],
		};
	};

	const [dateRange, setDateRange] = useState(null);
	const [started, setStarted] = useState(false);
	const [teamId, setTeamId] = useState(6219277);
	const [calendar, setCalendar] = useState(null);

	const checkForSlots = async () => {
		console.log('Checking for slots');
		const start = dateRange[0].format('YYYY-MM-DD');
		const end = dateRange[1].add(1, 'days').format('YYYY-MM-DD');
		const response = await fetch('https://projects.intra.42.fr' + calendar.getAttribute('data-index-url') + `&start=${start}&end=${end}`);
		if (!response.ok) {
			setStarted(false);
			errorNotification('Failed to check for slots');
		}
		const slots = await response.json();
		if (slots.length > 0) {
			await getSlot(slots);
		}
		await getSlot([
			{
				ids: "hIQdJkT4oc4mIL1MjoZ0PQ==,ofvGaMRM4Y2hpKUgmZ0xgQ==,n7gN9wNUMI2jigJrcvD75g==,kpgnWWSJezf-kNRSfvT5dw==,w0aIS3g_zuBbgdmUPO5s_Q==",
				start: "2024-12-23T12:00:00.000+01:00",
				end: "2024-12-23T13:15:00.000+01:00",
				id: "ofvGaMRM4Y2hpKUgmZ0xgQ==",
				title: "Available"
			},
			{
				ids: "mPu5PaEoJhcczpHcLmPe9A==,TLQQHCoNVABpdu-8kfasyQ==",
				start: "2024-12-23T14:30:00.000+01:00",
				end: "2024-12-23T15:00:00.000+01:00",
				id: "ofvGaMRM4Y2hpKUgmZ0xgQ==",
				title: "Available"
			}
		]);
	};

	const bookSlot = async (ids) => {
		console.log('Booking slot');
		const url = "https://projects.intra.42.fr" + calendar.getAttribute('data-update-url').replace(':ids', ids);
		const response = await fetch(url, {
			method: 'POST',
		});
		if (!response.ok)
			errorNotification('Failed to book slot');
		else
			successNotification('Slot booked');
		setStarted(false);
	};

	const getSlot = async (slots) => {
		const slotDuration = calendar.getAttribute('data-duration');
		for (let i = 0; i < slots.length; i++) {
			const slot = slots[i];
			const slotStart = moment(slot.start);
			const slotEnd = moment(slot.start).add(slotDuration * 15, 'minutes')
			if (slotStart >= dateRange[0] && slotEnd <= dateRange[1]) {
				const ids = slot.ids.split(',').slice(0, slotDuration).join(',');
				await bookSlot(ids);
				break;
			}
		}
	};

	useEffect(() => {
		if (started) {
			const interval = setInterval(() => {
				checkForSlots();
			}, 500);
			return () => clearInterval(interval);
		}
	}, [started]);

	useEffect(() => {
		getCalendar(teamId).then((calendar) => {
			setCalendar(calendar);
		});
	}, []);

	return (
		<Flex
			justify={calendar ? 'space-between' : 'center'}
			align='center'
		>
			{contextHolder}
			{calendar ?
			<>
				<RangePicker
					disabled={started}
					format="DD-MM-YYYY HH:mm"
					disabledDate={disabledDate}
					disabledTime={disabledRangeTime}
					showTime={{
						hideDisabledOptions: true,
					}}
					onChange={(value, dateString) => {
						setDateRange(value);
					}}
				/>
				<Switch
					disabled={!dateRange}
					onChange={setStarted}
					value={started}
				/>
			</>
			:
			<Spin />
			}
		</Flex>
	);
};

export default SlotSelector;
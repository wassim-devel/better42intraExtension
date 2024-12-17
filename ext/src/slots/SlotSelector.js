import React, { useEffect, useState } from 'react';
import { DatePicker, Flex, notification, Spin, Switch, Tag } from 'antd';
import moment from 'moment';
import browserAPI from '../browserAPI';
const { RangePicker } = DatePicker;
import { SyncOutlined } from '@ant-design/icons';

function createArrayExcludingMultiplesOfFive() {
    const result = [];
    for (let i = 0; i < 60; i++) {
        if (i % 15 !== 0) {
            result.push(i);
        }
    }
    return result;
}

async function getPageData(url) {
	let page = await fetch(url);
	if (!page.ok) {
		return null;
	}
	page = await page.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(page, "text/html");
	return {
		calendar: doc.getElementById('calendar'),
		csrf: doc.querySelector('meta[name="csrf-token"]').getAttribute('content'),
	};
}


const SlotSelector = ({projectUrl}) => {

	const [api, contextHolder] = notification.useNotification();
	const errorNotification = (message) => {
		api.error({
			message: 'Error',
			description: message,
			placement: 'topRight',
			duration: 0,
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
	const [calendar, setCalendar] = useState(null);
	const [csrf, setCsrf] = useState(null);
	const project = projectUrl.split('/')[projectUrl.split('/').length - 2];

	const checkForSlots = async () => {
		const start = dateRange[0].format('YYYY-MM-DD');
		const end = dateRange[1].add(1, 'days').format('YYYY-MM-DD');
		const response = await fetch('https://projects.intra.42.fr' + calendar.getAttribute('data-index-url') + `&start=${start}&end=${end}`);
		if (!response.ok) {
			setStarted(false);
			errorNotification('Failed to check for slots');
		}
		const slots = await response.json();
		if (slots.length > 0)
			await getSlot(slots);
	};

	const bookSlot = async (ids) => {
		const url = "https://projects.intra.42.fr" + calendar.getAttribute('data-update-url').replace(':ids', ids);
		const response = await fetch(url, {
			method: 'POST',
			body: `start=${dateRange[0].format('YYYY-MM-DD')}&end=${dateRange[1].format('YYYY-MM-DD')}&_method=put`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF-Token': csrf,
			},
		});
		if (!response.ok)
			return false;
		setStarted(false);
		return true;
	};

	const getSlot = async (slots) => {
		const slotDuration = calendar.getAttribute('data-duration');
		slots = slots.filter(slot => {
			const slotStart = moment(slot.start);
			const slotEnd = moment(slot.start).add(slotDuration * 15, 'minutes')
			return slotStart >= dateRange[0] && slotEnd <= dateRange[1]
		});
		let slotBooked = false;
		for (let i = 0; i < slots.length; i++) {
			const slot = slots[i];
			const ids = slot.ids.split(',').slice(0, slotDuration).join(',');
			if (await bookSlot(ids)) {
				browserAPI.runtime.sendMessage({
					action: "createNotification",
					message: `You will be evaluated on ${project} at ${moment(slot.start).format('HH:mm')}`
				});
				slotBooked = true;
				break;
			}
		}
		return slotBooked;
	};

	useEffect(() => {
		if (started) {
			let updated = true;
			const interval = setInterval(async () => {
				if (moment().isAfter(dateRange[1]))
				{
					setStarted(false);
					return;
				}
				if (updated)
				{
					updated = false;
					await checkForSlots();
					updated = true;
				}
			}, 500);
			return () => clearInterval(interval);
		}
	}, [started]);

	useEffect(() => {
		getPageData(projectUrl).then((data) => {
			setCalendar(data.calendar);
			setCsrf(data.csrf);
		});
	}, []);

	return (
		<Flex
			justify={calendar ? 'space-between' : 'center'}
			align='center'
			gap='5px'
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
				<Flex
					gap='5px'
				>
					{started && <>
						<Tag icon={<SyncOutlined spin />} color="processing">
							Checking for slots
						</Tag>
					</>}
					<Switch
						disabled={!dateRange}
						onChange={setStarted}
						value={started}
					/>
				</Flex>
			</>
			:
			<Spin />
			}
		</Flex>
	);
};

export default SlotSelector;
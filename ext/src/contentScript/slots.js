import React from 'react';
import ReactDOM from 'react-dom';
import SlotSelector from '../slots/SlotSelector';
import browserAPI from '../browserAPI';
import { Alert, ConfigProvider, theme } from 'antd';

const team_actions = document.querySelector('.team-actions');
const App = () => {
	const projectUrl = team_actions.querySelector('.btn-primary');
	const dark = getComputedStyle(document.body).getPropertyValue('--container-background-color');
	if (projectUrl)
		return (
			<div style={{
				width: '100%',
				marginTop: '2vh',
			}}>
				<ConfigProvider
					theme={{
						algorithm: dark ? theme.darkAlgorithm : theme.lightAlgorithm,
					}}
				>
					<SlotSelector projectUrl={projectUrl.href}/>
				</ConfigProvider>
			</div>
		);
	
};

const WarningAlert = () => {
	return (
		<div style={{
			width: '100%',
			marginTop: '2vh',
		}}>
			<Alert
				message="Your 42IntraTools session has expired"
				type="warning" showIcon
			/>
		</div>
	);
}

if (team_actions) {
	let root = document.createElement('div');
	team_actions.appendChild(root);

	browserAPI.storage.local.get(['token', 'login', 'maxAge'], function(result) {
		if (result.token && result.login && new Date(parseInt(result.maxAge)) > Date.now())
			ReactDOM.render(<App />, root);
		else if (result.login && new Date(parseInt(result.maxAge)) <= Date.now()) {
			ReactDOM.render(<WarningAlert />, root);
		}
	});
}
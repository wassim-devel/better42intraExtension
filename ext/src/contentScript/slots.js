import React from 'react';
import ReactDOM from 'react-dom';
import SlotSelector from '../slots/SlotSelector';

const team_actions = document.querySelector('.team-actions');
const App = () => {
	const projectUrl = team_actions.querySelector('.btn-primary').href;
	console.log('projectUrl', projectUrl);
	return (
		<div style={{
			width: '100%',
			marginTop: '2vh',
		}}>
			<SlotSelector projectUrl={projectUrl}/>
		</div>
	);
	
};


console.log('Hello from the content script!');
if (team_actions) {
	let root = document.createElement('div');
	team_actions.appendChild(root);
	ReactDOM.render(<App />, root);
}
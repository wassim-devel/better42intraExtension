import React from 'react';
import ReactDOM from 'react-dom';
import SlotSelector from '../slots/SlotSelector';

const App = () => {
	
	return (
		<div style={{
			width: '100%',
			marginTop: '2vh',
		}}>
			<SlotSelector/>
		</div>
	);
	
};


console.log('Hello from the content script!');
const team_actions = document.querySelector('.team-actions');
if (team_actions) {
	let root = document.createElement('div');
	team_actions.appendChild(root);
	ReactDOM.render(<App />, root);
}
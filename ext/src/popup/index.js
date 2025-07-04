import React from 'react';
import ReactDOM from 'react-dom';
import {Alert, Button, Image, Typography} from 'antd';
import config from '../config';
const { Text } = Typography;
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import browserAPI from '../browserAPI';

const App = () => {

	const [user, setUser] = React.useState(null);
	const [logoutLoading, setLogoutLoading] = React.useState(false);

	const onClick = async () => {
		browserAPI.tabs.create({
			url: `${config.api}/auth/42`,
			active: true
		});
	}

	const onLogout = async () => {
		setLogoutLoading(true);
		const response = await fetch(`${config.api}/auth/logout`, {
			headers: {
				'X-42IntraTools-Key': user?.token,
			},
			credentials: 'include',
		});
		if (response.ok || response.status === 401)
		{
			setUser(null);
			browserAPI.storage.local.clear();
		}
		else
			console.error('Error while logging out');
		setLogoutLoading(false);
	}



	React.useEffect(() => {
		browserAPI.storage.local.get(['token', 'login', 'maxAge'], function(result) {
			if (result.login && result.token && result.maxAge)
				setUser(result);
		});
		return () => {
			setUser(null);
		};
	}, []);

  return (
	<div
		style={{
			minWidth: '300px',
			minHeight: '200px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'column',
			gap: '16px',
		}}
	>
	  {!user && <Button
		onClick={onClick}
	  >
		Login with
		<Image
			height='100%'
			src='/icons/42logo.png'
			preview={false}
		/> intra
	  </Button>}

		{user && new Date(parseInt(user.maxAge)) > Date.now() &&
			<>
				<Text
					style={{
						margin: '16px'
					}}
				>
					Connected as {user.login}
				</Text>
				<Button
					onClick={onLogout}
					danger
					icon={<LogoutOutlined />}
					loading={logoutLoading}
					disabled={logoutLoading}
				>
					Logout
				</Button>
			</>
		}
		{user && new Date(parseInt(user.maxAge)) <= Date.now() &&
		<>
			<Text
				style={{
					margin: '16px'
				}}
			>
				Your session has expired
			</Text>
			<Button
				onClick={onClick}
				color="primary"
				variant="filled"
				icon={<ReloadOutlined />}
			>
				Refresh Token
			</Button>
		</>

		}
		<Alert
			message="New Update:"
			description="Evaluation slots will no longer be automatically booked. Instead, you'll receive a notification as soon as a slot becomes available. Make sure to enable notifications on https://projects.intra.42.fr/ to stay informed!"
			type="info"
			showIcon
		/>
	</div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

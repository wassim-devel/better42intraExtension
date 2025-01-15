import React from 'react';
import ReactDOM from 'react-dom';
import { Image } from "antd";
import browserAPI from '../browserAPI';

const images = document.querySelectorAll('.bg-image-item');

const App = ({url}) => {

	const handlePreview = (visible) => {
        if (visible) {
            document.querySelector('html').style.overflow = 'hidden';
        } else {
            document.querySelector('html').style.overflow = 'auto';
        }
    };

		return (
			<Image
				src={url}
				height='100%'
				width='100%'
				style={{
					objectFit: 'cover',
					borderRadius: '50%',
					overflow: 'hidden',
				}}
				preview={{
					onVisibleChange: (visible) => handlePreview(visible),
				}}
			/>
		);
	
};

browserAPI.storage.local.get(['token', 'login', 'maxAge'], function(result) {
	if (result.token && result.login && new Date(parseInt(result.maxAge)) > Date.now())
		images.forEach((image) => {
			image.style.padding = '0';
			ReactDOM.render(<App url={image.style.backgroundImage.slice(5, -2)} />, image);
		});
});
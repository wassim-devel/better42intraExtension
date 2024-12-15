import browserAPI from "./browserAPI";
import config from "./config";


browserAPI.webNavigation.onCompleted.addListener(function(details) {
	const url = new URL(details.url);
	const token = url.searchParams.get('token');
	const login = url.searchParams.get('login');
	const maxAge = url.searchParams.get('maxAge');

	if (token) {
		browserAPI.storage.local.set({ token, login, maxAge }, function() {
			browserAPI.tabs.remove(details.tabId);
	  });
	}
  }, {url: [{urlMatches: `${config.api}/auth/redirect`}]});


browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log(message);
	if (message.action === "createNotification") {
		browserAPI.notifications.create({
			type: "basic",
			iconUrl: "/icons/logo128.png",
			title: '42IntraTools',
			message: message.message
		});
	}
  });
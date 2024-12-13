import browserAPI from "./browserAPI";
import config from "./config";


chrome.webNavigation.onCompleted.addListener(function(details) {
	const url = new URL(details.url);
	const token = url.searchParams.get('token');
	const login = url.searchParams.get('login');
	const maxAge = url.searchParams.get('maxAge');

	if (token) {
		browserAPI.storage.local.set({ token, login, maxAge }, function() {
		chrome.tabs.remove(details.tabId);
	  });
	}
  }, {url: [{urlMatches: `${config.api}/auth/redirect`}]});



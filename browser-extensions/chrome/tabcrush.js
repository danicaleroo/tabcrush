(function () {
	"use strict";
	const PROJECT_URL = "https://www.tabcrush.com/new";
	function updateCurrentTab() {
		chrome.tabs.getCurrent(function (tab) {
			if (tab && tab.id) chrome.tabs.update(tab.id, { url: PROJECT_URL });
			else window.location.replace(PROJECT_URL);
		});
	}
	updateCurrentTab();
})();

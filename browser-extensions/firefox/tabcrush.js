(function () {
	"use strict";
	const PROJECT_URL = "https://www.tabcrush.com/new";

	function updateCurrentTab() {
		const tabs = browser.tabs || chrome.tabs;
		tabs
			.getCurrent()
			.then(function (tab) {
				if (tab && tab.id) tabs.update(tab.id, { url: PROJECT_URL });
				else window.location.replace(PROJECT_URL);
			})
			.catch(function () {
				window.location.replace(PROJECT_URL);
			});
	}
	updateCurrentTab();
})();

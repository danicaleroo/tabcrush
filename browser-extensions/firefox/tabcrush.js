(function () {
	"use strict";
	const PROJECT_URL = "https://www.tabcrush.com/new";

	function updateCurrentTab() {
		browser.tabs
			.getCurrent()
			.then(function (tab) {
				if (tab && tab.id) browser.tabs.update(tab.id, { url: PROJECT_URL });
				else window.location.replace(PROJECT_URL);
			})
			.catch(function () {
				window.location.replace(PROJECT_URL);
			});
	}
	updateCurrentTab();
})();

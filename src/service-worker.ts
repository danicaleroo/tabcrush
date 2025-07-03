(() => {
	const isExtension =
		window.location.protocol === "chrome-extension:" ||
		window.location.protocol === "moz-extension:";

	if ("serviceWorker" in navigator && import.meta.env.PROD && !isExtension) {
		window.addEventListener("load", () => {
			if ("requestIdleCallback" in window) {
				requestIdleCallback(() => {
					navigator.serviceWorker.register("/sw.js");
				});
			} else {
				setTimeout(() => {
					navigator.serviceWorker.register("/sw.js");
				}, 1000);
			}
		});
	}
})();

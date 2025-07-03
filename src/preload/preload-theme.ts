(() => {
	try {
		const settingsStr = localStorage.getItem("settings");
		let theme = "light";
		if (settingsStr) {
			const settings = JSON.parse(settingsStr);
			if (
				settings &&
				settings.theme &&
				["dark", "light"].includes(settings.theme)
			) {
				theme = settings.theme;
			}
		} else {
			const prefersDark =
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches;
			theme = prefersDark ? "dark" : "light";
		}
		document.documentElement.setAttribute("data-theme", theme);
	} catch (e) {
		document.documentElement.setAttribute("data-theme", "light");
	}
})();

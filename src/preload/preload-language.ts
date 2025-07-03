(() => {
	try {
		const SUPPORTED_LANGUAGES = [
			"en",
			"es",
			"fr",
			"de",
			"it",
			"pt",
			"zh",
			"ja",
			"ru",
			"hi",
			"ko",
		];
		const saved = localStorage.getItem("language");
		const browserLang = navigator.language.split("-")[0];
		const lang =
			saved || (SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : "en");
		document.documentElement.setAttribute("lang", lang);
	} catch (e) {}
})();

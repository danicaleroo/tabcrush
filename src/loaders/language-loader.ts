// loaders/language-loader.ts
import {
	DEFAULT_LANGUAGE,
	SUPPORTED_LANGUAGES,
	STORAGE_KEYS,
} from "../core/constants";
import type { SupportedLanguage } from "../core/types";
import { i18n } from "../features/i18n";

export class LanguageLoader {
	private static getValidLanguage(lang: string): SupportedLanguage {
		return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
			? (lang as SupportedLanguage)
			: DEFAULT_LANGUAGE;
	}

	static async load(): Promise<void> {
		const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
		const browser = navigator.language.split("-")[0];

		const lang = saved || this.getValidLanguage(browser);

		await i18n.load(lang);
	}

	static getSupportedLanguages(): readonly string[] {
		return SUPPORTED_LANGUAGES;
	}
}

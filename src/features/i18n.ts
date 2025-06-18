// features/i18n.ts
import { DEFAULT_LANGUAGE, STORAGE_KEYS } from "../core/constants";

class I18n {
	private translations: Record<string, string> = {};
	private lang = DEFAULT_LANGUAGE;

	async load(lang: string): Promise<void> {
		if (lang === this.lang && Object.keys(this.translations).length) return;

		try {
			const res = await fetch(`/locales/${lang}.json`, {
				cache: "force-cache",
			});
			if (!res.ok) throw new Error("Failed to fetch");

			this.translations = await res.json();
			this.lang = lang;

			document.documentElement.setAttribute("lang", lang);
			localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);

			this.updateDOM();
		} catch {
			if (lang !== DEFAULT_LANGUAGE) await this.load(DEFAULT_LANGUAGE);
		}
	}

	t(key: string): string {
		return this.translations[key] || key;
	}

	private updateDOM(): void {
		document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
			const key = el.getAttribute("data-i18n");
			if (key) el.textContent = this.t(key);
		});

		document
			.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")
			.forEach((el) => {
				const key = el.getAttribute("data-i18n-placeholder");
				if (key) el.placeholder = this.t(key);
			});
	}
}

export const i18n = new I18n();

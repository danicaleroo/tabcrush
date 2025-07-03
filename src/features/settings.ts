// features/settings.ts
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../core/constants";
import { storage } from "../core/storage";
import type { Settings } from "../core/types";
import { settingsFormHTML } from "../core/ui";
import { $ } from "../utils/dom";

export class SettingsManager {
	private settings: Settings;
	private listeners = new Set<(settings: Settings) => void>();

	constructor() {
		const saved = storage.get<Settings>(STORAGE_KEYS.SETTINGS);
		this.settings = { ...DEFAULT_SETTINGS, ...saved };
		if (!saved || !("theme" in saved)) {
			const prefersDark =
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches;
			this.settings.theme = prefersDark ? "dark" : "light";
		}

		document.documentElement.setAttribute("data-theme", this.settings.theme);
	}

	get(): Settings {
		return this.settings;
	}

	update(updates: Partial<Settings>): void {
		this.settings = { ...this.settings, ...updates };
		storage.set(STORAGE_KEYS.SETTINGS, this.settings);
		this.notify();
	}

	subscribe(fn: (settings: Settings) => void): () => void {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	private notify(): void {
		this.listeners.forEach((fn) => fn(this.settings));
	}

	showDialog(): void {
		const dialog = $<HTMLDialogElement>("settings-dialog");
		const form = $<HTMLFormElement>("settings-form");
		if (!dialog || !form) return;

		this.renderForm(form);
		this.apply();

		const focusableElements = dialog.querySelectorAll(
			'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
		) as NodeListOf<HTMLElement>;

		const firstFocusable = focusableElements[0];
		const lastFocusable = focusableElements[focusableElements.length - 1];

		dialog.addEventListener("keydown", (e: KeyboardEvent) => {
			const isEscapeKey = e.key === "Escape";
			const isTabKey = e.key === "Tab";
			const isShiftTabOnFirstElement =
				e.shiftKey && document.activeElement === firstFocusable;
			const isTabOnLastElement =
				!e.shiftKey && document.activeElement === lastFocusable;

			if (isEscapeKey) {
				dialog.close();
				return;
			}

			if (!isTabKey) return;

			if (isShiftTabOnFirstElement) {
				e.preventDefault();
				lastFocusable?.focus();
				return;
			}

			if (isTabOnLastElement) {
				e.preventDefault();
				firstFocusable?.focus();
			}
		});

		form.addEventListener("change", (e: Event) => {
			const target = e.target as HTMLInputElement | HTMLSelectElement;
			const { name, type } = target;
			const value =
				type === "checkbox"
					? (target as HTMLInputElement).checked
					: target.value;

			this.update({ [name]: value } as Partial<Settings>);
		});

		form.querySelector(".close-button")?.addEventListener("click", () => {
			dialog.close();
		});

		dialog.addEventListener("click", (e: MouseEvent) => {
			if (e.target === dialog) dialog.close();
		});

		const unsubscribe = this.subscribe(() => this.apply());
		dialog.addEventListener(
			"close",
			() => {
				unsubscribe();
				const settingsButton = $("settings-button");
				settingsButton?.focus();
			},
			{ once: true }
		);

		dialog.showModal();
		firstFocusable?.focus();
	}

	private renderForm(form: HTMLFormElement): void {
		form.innerHTML = settingsFormHTML(this.settings);
	}

	private apply(): void {
		const s = this.settings;
		document.documentElement.setAttribute("data-theme", s.theme);
	}
}

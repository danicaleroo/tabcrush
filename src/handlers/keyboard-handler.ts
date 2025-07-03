// handlers/keyboard-handler.ts
import { $ } from "../utils/dom";

export class KeyboardHandler {
	private container: HTMLElement | null = null;

	init(): void {
		this.container = $("app-container");
		if (!this.container) return;

		this.setupFocusTrap();
	}

	private setupFocusTrap(): void {
		if (!this.container) return;

		this.container.addEventListener("keydown", this.handleKeydown);
	}

	private handleKeydown = (e: KeyboardEvent): void => {
		if (e.key !== "Tab" || !this.container) return;

		const focusableElements = this.getFocusableElements();
		if (focusableElements.length === 0) return;

		const first = focusableElements[0];
		const last = focusableElements[focusableElements.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last?.focus();
			return;
		}

		if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first?.focus();
		}
	};

	private getFocusableElements(): HTMLElement[] {
		if (!this.container) return [];

		const selector =
			'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

		return Array.from(this.container.querySelectorAll(selector))
			.filter(this.isVisibleElement)
			.map((el) => el as HTMLElement);
	}

	private isVisibleElement = (el: Element): boolean => {
		const style = getComputedStyle(el);
		const rect = el.getBoundingClientRect();

		return (
			style.display !== "none" &&
			style.visibility !== "hidden" &&
			rect.width > 0 &&
			rect.height > 0
		);
	};

	destroy(): void {
		if (this.container) {
			this.container.removeEventListener("keydown", this.handleKeydown);
		}
	}
}

// features/tabs.ts
import { ANIMATION } from "../core/constants";
import type { TabId } from "../core/types";
import { $ } from "../utils/dom";

export class TabController {
	private currentTab: TabId = "tasks";
	private overlay: HTMLElement | null = null;
	private buttons = new Map<TabId, HTMLElement>();
	private onSwitch: (tab: TabId) => Promise<void>;

	constructor(onSwitch: (tab: TabId) => Promise<void>) {
		this.onSwitch = onSwitch;
	}

	init(): void {
		this.buttons.set("tasks", $("tab-button-tasks")!);
		this.buttons.set("completed", $("tab-button-completed")!);
		this.overlay = $("tabs-overlay-container");

		this.buttons.forEach((btn, id) => {
			btn.addEventListener("click", () => this.switch(id));
		});

		this.setupKeyboard();
		this.updateAria();
		this.updateOverlay();

		window.addEventListener("resize", () => this.updateOverlay());
	}

	private async switch(tab: TabId): Promise<void> {
		if (this.currentTab === tab) return;

		this.currentTab = tab;
		this.updateAria();

		if (this.overlay) this.overlay.classList.add("animating");
		this.updateOverlay();

		await this.onSwitch(tab);

		if (this.overlay) {
			setTimeout(() => {
				this.overlay?.classList.remove("animating");
			}, ANIMATION.TAB);
		}
	}

	private updateOverlay(): void {
		if (!this.overlay) return;

		const btn = this.buttons.get(this.currentTab);
		if (!btn) return;

		const nav = btn.closest("nav");
		if (!nav) return;

		const left = (btn.offsetLeft / nav.offsetWidth) * 100;
		const right =
			100 - ((btn.offsetLeft + btn.offsetWidth) / nav.offsetWidth) * 100;

		this.overlay.style.clipPath = `inset(0 ${right}% 0 ${left}% round 999px)`;
	}

	private updateAria(): void {
		this.buttons.forEach((btn, id) => {
			const isSelected = id === this.currentTab;
			btn.setAttribute("aria-selected", String(isSelected));
			btn.tabIndex = isSelected ? 0 : -1;
		});
	}

	private setupKeyboard(): void {
		const list = this.buttons.get("tasks")?.closest('[role="tablist"]');
		if (!list) return;

		list.addEventListener("keydown", (e: Event) => {
			const evt = e as KeyboardEvent;
			const target = evt.target as HTMLElement;
			if (target.getAttribute("role") !== "tab") return;

			const tabs = Array.from(this.buttons.values());
			const idx = tabs.indexOf(target);
			if (idx === -1) return;

			let newIdx = idx;

			switch (evt.key) {
				case "ArrowRight":
					newIdx = (idx + 1) % tabs.length;
					break;
				case "ArrowLeft":
					newIdx = (idx - 1 + tabs.length) % tabs.length;
					break;
				case "Home":
					newIdx = 0;
					break;
				case "End":
					newIdx = tabs.length - 1;
					break;
				default:
					return;
			}

			evt.preventDefault();
			const newTab = tabs[newIdx];
			if (newTab) {
				newTab.focus();
				newTab.click();
			}
		});
	}
}

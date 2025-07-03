// handlers/input-handler.ts
import { elements } from "../core/dom-elements";
import type { TaskManager } from "../features/tasks";

export class InputHandler {
	private input: HTMLInputElement | null = null;

	constructor(private taskManager: TaskManager) {}

	init(): void {
		this.input = elements.inputTask;
		if (!this.input) return;

		this.input.addEventListener("keydown", this.handleKeyDown);
		this.focusInput();
	}

	private handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
		if (e.key !== "Enter" || !this.input) return;

		const text = this.input.value.trim();
		if (!text) return;

		e.preventDefault();
		this.input.value = "";
		await this.taskManager.addTask(text);
	};

	private focusInput(): void {
		if (!this.input) return;
		if (this.taskManager.getCurrentTab() === "tasks") {
			setTimeout(() => this.input?.focus(), 100);
		}
	}

	destroy(): void {
		if (this.input) {
			this.input.removeEventListener("keydown", this.handleKeyDown);
		}
	}
}

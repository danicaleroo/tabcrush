// handlers/click-handler.ts
import type { TaskManager } from "../features/tasks";

export class ClickHandler {
	constructor(private taskManager: TaskManager) {}

	init(): void {
		document.addEventListener("click", this.handleClick);
	}

	private handleClick = async (e: MouseEvent): Promise<void> => {
		const target = e.target as HTMLElement;

		if (target.closest(".task-toggle")) {
			await this.handleTaskToggle(target);
			return;
		}

		if (target.closest(".task-delete")) {
			await this.handleTaskDelete(target);
			return;
		}
	};

	private async handleTaskToggle(target: HTMLElement): Promise<void> {
		const taskItem = target.closest("[data-task-id]") as HTMLElement;
		const taskId = taskItem?.dataset["taskId"];
		if (!taskId) return;
		await this.taskManager.toggleTask(taskId);
	}

	private async handleTaskDelete(target: HTMLElement): Promise<void> {
		const taskItem = target.closest("[data-task-id]") as HTMLElement;
		const taskId = taskItem?.dataset["taskId"];
		if (!taskId) return;
		await this.taskManager.deleteTask(taskId);
	}

	destroy(): void {
		document.removeEventListener("click", this.handleClick);
	}
}

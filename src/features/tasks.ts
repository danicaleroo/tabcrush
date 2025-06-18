// features/task-manager.ts
import { StateManager } from "../core/state-manager";
import { AnimationController } from "../animation/animation-controller";
import type { Settings } from "../core/types";
import { $ } from "../utils/dom";

export class TaskManager {
	private stateManager: StateManager;
	private animationController: AnimationController;

	constructor(settings: Settings) {
		this.stateManager = StateManager.getInstance();
		this.animationController = new AnimationController(settings);

		this.stateManager.subscribe(() => {
			this.updateAnnouncements();
		});
	}

	updateSettings(settings: Settings): void {
		this.animationController.updateSettings(settings);
		this.render();
	}

	private updateAnnouncements(): void {
		const announcer = $<HTMLDivElement>("task-count-announcer");
		if (!announcer) return;

		const activeCount = this.stateManager.getActiveTasks().length;
		const completedCount = this.stateManager.getCompletedTasks().length;
		announcer.textContent = `${activeCount} active tasks, ${completedCount} completed tasks`;
	}

	private announceAction(action: string, taskText: string): void {
		const announcer = $<HTMLDivElement>("task-status-announcer");
		if (!announcer) return;
		announcer.textContent = `Task "${taskText}" ${action}`;
	}

	async addTask(text: string): Promise<void> {
		await this.animationController.addTask(text);
		this.announceAction("added", text);
	}

	async toggleTask(taskId: string): Promise<void> {
		const task = this.stateManager.getTasks().find((t) => t.id === taskId);
		if (!task) return;

		await this.animationController.removeTask(taskId, "toggle");
		this.announceAction(
			task.completed ? "uncompleted" : "completed",
			task.text
		);
	}

	async deleteTask(taskId: string): Promise<void> {
		const task = this.stateManager.getTasks().find((t) => t.id === taskId);
		if (!task) return;

		await this.animationController.removeTask(taskId, "delete");
		this.announceAction("deleted", task.text);
	}

	async deleteAllCompleted(): Promise<void> {
		await this.animationController.deleteAllCompleted();
	}

	async switchTab(tab: "tasks" | "completed"): Promise<void> {
		await this.animationController.switchTab(tab);
	}

	render(): void {
		this.animationController.render();
	}

	getCurrentTab() {
		return this.stateManager.getCurrentTab();
	}

	getTasks() {
		return this.stateManager.getTasks();
	}

	getActiveTasks() {
		return this.stateManager.getActiveTasks();
	}

	getCompletedTasks() {
		return this.stateManager.getCompletedTasks();
	}
}

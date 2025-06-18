// features/animation/animation-controller.ts
import { elements } from "../core/dom-elements";
import { StateManager } from "../core/state-manager";
import { taskItemHTML } from "../core/ui";
import type { Settings, TaskAction } from "../core/types";
import { HeightAnimator } from "./height-animator";
import { TaskAnimator } from "./task-animator";
import { TabAnimator } from "./tab-animator";
import { TaskListRenderer } from "./task-list-renderer";

export class AnimationController {
	private stateManager: StateManager;
	private settings: Settings;
	private isAnimating = false;
	private heightAnimator: HeightAnimator;
	private taskAnimator: TaskAnimator;
	private tabAnimator: TabAnimator;
	private taskListRenderer: TaskListRenderer;

	constructor(settings: Settings) {
		this.stateManager = StateManager.getInstance();
		this.settings = settings;
		this.heightAnimator = new HeightAnimator(this.stateManager);
		this.taskAnimator = new TaskAnimator(
			this.stateManager,
			this.heightAnimator
		);
		this.taskListRenderer = new TaskListRenderer(this.settings);
		this.tabAnimator = new TabAnimator(
			this.stateManager,
			this.heightAnimator,
			this.taskListRenderer
		);
	}

	updateSettings(settings: Settings): void {
		this.settings = settings;
		this.taskListRenderer.updateSettings(settings);
	}

	async addTask(text: string): Promise<void> {
		const panel = elements.tasksPanel;
		const list = elements.tasksList;
		if (!panel || !list) return;

		const task = this.stateManager.addTask(text);

		await this.heightAnimator.animateHeight(panel, () => {
			const div = document.createElement("div");
			div.innerHTML = taskItemHTML(task, this.settings);
			const el = div.firstElementChild as HTMLElement;
			list.insertBefore(el, list.firstChild);
		});
	}

	async removeTask(taskId: string, action: TaskAction): Promise<void> {
		await this.taskAnimator.removeTask(taskId, action);
	}

	async deleteAllCompleted(): Promise<void> {
		await this.taskAnimator.deleteAllCompleted();
	}

	async switchTab(newTab: "tasks" | "completed"): Promise<void> {
		if (this.isAnimating) return;
		this.isAnimating = true;

		await this.tabAnimator.switchTab(newTab);

		this.isAnimating = false;
	}

	render(): void {
		const tasksList = elements.tasksList;
		const completedList = elements.completedList;
		if (!tasksList || !completedList) return;

		const state = this.stateManager.getState();

		this.taskListRenderer.renderTaskList(
			tasksList,
			this.stateManager.getActiveTasks()
		);

		if (state.hasCompletedTasks) {
			this.taskListRenderer.renderTaskList(
				completedList,
				this.stateManager.getCompletedTasks()
			);
		} else {
			completedList.innerHTML = "";
		}

		if (state.currentTab === "tasks") {
			tasksList.style.display = "flex";
			completedList.style.display = "none";
		} else {
			tasksList.style.display = "none";
			completedList.style.display = "flex";
			if (!state.hasCompletedTasks) {
				this.taskAnimator.showEmptyState();
			}
		}

		this.updateUIElements();
	}

	private updateUIElements(): void {
		const inputContainer = elements.inputTaskContainer;
		const deleteBtn = elements.deleteAllButton;

		if (inputContainer) {
			const shouldHide =
				!this.stateManager.shouldShowInputContainer() &&
				this.stateManager.getCurrentTab() === "completed";
			inputContainer.classList.toggle("input-hidden", shouldHide);
		}

		if (deleteBtn) {
			const shouldShow = this.stateManager.shouldShowDeleteAllButton();
			deleteBtn.classList.toggle("visible", shouldShow);
			deleteBtn.tabIndex = shouldShow ? 0 : -1;
		}
	}
}

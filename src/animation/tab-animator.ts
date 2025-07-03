// features/animation/tab-animator.ts
import { ANIMATION } from "../core/constants";
import { elements } from "../core/dom-elements";
import { StateManager } from "../core/state-manager";
import { HeightAnimator } from "./height-animator";
import { TaskListRenderer } from "./task-list-renderer";
import { TaskAnimator } from "./task-animator";

export class TabAnimator {
	private taskAnimator: TaskAnimator;

	constructor(
		private stateManager: StateManager,
		private heightAnimator: HeightAnimator,
		private taskListRenderer: TaskListRenderer
	) {
		this.taskAnimator = new TaskAnimator(stateManager, heightAnimator);
	}

	async switchTab(newTab: "tasks" | "completed"): Promise<void> {
		const panel = elements.tasksPanel;
		const inputContainer = elements.inputTaskContainer;
		const deleteBtn = elements.deleteAllButton;
		const tasksList = elements.tasksList;
		const completedList = elements.completedList;

		if (!panel || !tasksList || !completedList) {
			return;
		}

		this.stateManager.setTab(newTab);

		const itemsToAnimate =
			newTab === "tasks"
				? this.stateManager.getActiveTasks().length
				: this.stateManager.getCompletedTasks().length;

		const MAX_TOTAL_STAGGER = ANIMATION.STAGGER * 4;
		const computedStagger =
			itemsToAnimate > 1
				? Math.min(ANIMATION.STAGGER, MAX_TOTAL_STAGGER / (itemsToAnimate - 1))
				: 0;

		await this.heightAnimator.animateHeight(panel, () => {
			if (inputContainer) {
				inputContainer.classList.toggle("input-hidden", newTab === "completed");
			}

			if (deleteBtn) {
				const shouldShow = this.stateManager.shouldShowDeleteAllButton();
				deleteBtn.classList.toggle("visible", shouldShow);
				deleteBtn.tabIndex = shouldShow ? 0 : -1;
			}

			if (newTab === "tasks") {
				completedList.style.display = "none";
				tasksList.style.display = "flex";
				this.taskListRenderer.renderTaskList(
					tasksList,
					this.stateManager.getActiveTasks(),
					true,
					computedStagger
				);
			} else {
				tasksList.style.display = "none";
				completedList.style.display = "flex";

				const completedTasks = this.stateManager.getCompletedTasks();
				if (completedTasks.length > 0) {
					this.taskListRenderer.renderTaskList(
						completedList,
						completedTasks,
						true,
						computedStagger
					);
				} else {
					completedList.innerHTML = "";
					this.taskAnimator.showEmptyState();
				}
			}

			panel.setAttribute("data-current-tab", newTab);
		});
	}
}

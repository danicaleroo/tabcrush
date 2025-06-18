// features/animation/task-animator.ts
import { ANIMATION } from "../core/constants";
import { elements } from "../core/dom-elements";
import { StateManager } from "../core/state-manager";
import { emptyStateHTML } from "../core/ui";
import type { TaskAction } from "../core/types";
import { HeightAnimator } from "./height-animator";

export class TaskAnimator {
	constructor(
		private stateManager: StateManager,
		private heightAnimator: HeightAnimator
	) {}

	async removeTask(taskId: string, action: TaskAction): Promise<void> {
		const panel = elements.tasksPanel;
		const el = document.querySelector(
			`[data-task-id="${taskId}"]`
		) as HTMLElement;
		if (!panel || !el) return;

		const state = this.stateManager.getState();
		const isLastCompleted =
			state.currentTab === "completed" &&
			this.stateManager.getCompletedTasks().length === 1;

		if (isLastCompleted) {
			panel.style.height = `${panel.offsetHeight}px`;
			el.classList.add("task-item-exit-fade");

			setTimeout(async () => {
				if (action === "toggle") {
					this.stateManager.toggleTask(taskId);
				} else {
					this.stateManager.deleteTask(taskId);
				}
				el.remove();
				this.showEmptyState();
				this.updateUIElements();
				await this.heightAnimator.animateHeight(panel, () => {});
			}, ANIMATION.TAB);
			return;
		}

		// For regular removal, we need to prepare the element for height animation
		const startHeight = el.offsetHeight;
		el.style.height = `${startHeight}px`;
		el.style.overflow = "hidden";
		el.offsetHeight; // Force reflow

		// Add the exit class which will trigger the CSS animation
		el.classList.add("task-item-exit");

		// Trigger the height collapse on next frame
		requestAnimationFrame(() => {
			el.style.height = "0";
		});

		if (action === "toggle") {
			this.stateManager.toggleTask(taskId);
		} else {
			this.stateManager.deleteTask(taskId);
		}

		if (this.stateManager.shouldShowEmptyState()) {
			this.showEmptyState();
		}
		this.updateUIElements();

		setTimeout(() => {
			el.remove();
		}, ANIMATION.TAB);
	}

	async deleteAllCompleted(): Promise<void> {
		const panel = elements.tasksPanel;
		const list = elements.completedList;
		if (!panel || !list) return;

		const taskElements = Array.from(
			list.querySelectorAll(".task-item")
		) as HTMLElement[];
		if (taskElements.length === 0) return;

		taskElements.forEach((el, index) => {
			el.style.transitionDelay = `${index * ANIMATION.STAGGER}ms`;
			el.classList.add("task-item-exit-stagger");
		});

		const totalTime =
			(taskElements.length - 1) * ANIMATION.STAGGER + ANIMATION.TAB;

		setTimeout(async () => {
			await this.heightAnimator.animateHeight(panel, () => {
				taskElements.forEach((el) => el.remove());
				this.stateManager.deleteAllCompleted();
				this.showEmptyState();
				this.updateUIElements();
			});
		}, totalTime);
	}

	showEmptyState(): void {
		const list = elements.completedList;
		if (!list || list.querySelector(".empty-state")) return;

		const div = document.createElement("div");
		div.innerHTML = emptyStateHTML();
		const emptyEl = div.firstElementChild as HTMLElement;
		emptyEl.classList.add("empty-state-enter");
		list.appendChild(emptyEl);

		requestAnimationFrame(() => {
			emptyEl.classList.remove("empty-state-enter");
		});
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

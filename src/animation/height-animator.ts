// features/animation/height-animator.ts
import { ANIMATION, LAYOUT } from "../core/constants";
import { StateManager } from "../core/state-manager";

export class HeightAnimator {
	constructor(private stateManager: StateManager) {}

	calculatePanelHeight(): number {
		const state = this.stateManager.getState();
		const visibleTasks =
			state.currentTab === "tasks"
				? this.stateManager.getActiveTasks()
				: this.stateManager.getCompletedTasks();

		let height = LAYOUT.CONTAINER_PADDING;

		if (state.currentTab === "tasks") {
			height += LAYOUT.INPUT_HEIGHT;
			if (visibleTasks.length > 0) {
				height += LAYOUT.INPUT_MARGIN;
			}
		}

		if (visibleTasks.length > 0) {
			visibleTasks.forEach((task, index) => {
				const taskEl = document.querySelector(
					`[data-task-id="${task.id}"]`
				) as HTMLElement;
				height += taskEl?.offsetHeight || LAYOUT.BASE_TASK_HEIGHT;
				if (index < visibleTasks.length - 1) {
					height += LAYOUT.TASK_SPACING;
				}
			});
		} else if (state.currentTab === "completed") {
			height += LAYOUT.EMPTY_STATE_HEIGHT;
		}

		return height;
	}

	animateHeight(element: HTMLElement, callback: () => void): Promise<void> {
		return new Promise((resolve) => {
			const startHeight = element.offsetHeight;
			element.style.height = `${startHeight}px`;
			element.offsetHeight;

			callback();

			const endHeight = this.calculatePanelHeight();
			if (Math.abs(startHeight - endHeight) < 1) {
				element.style.height = "";
				resolve();
				return;
			}

			element.classList.add("animating-height");
			element.style.height = `${endHeight}px`;

			const cleanup = () => {
				element.style.height = "";
				element.classList.remove("animating-height");
				resolve();
			};

			setTimeout(cleanup, ANIMATION.TAB);
		});
	}
}

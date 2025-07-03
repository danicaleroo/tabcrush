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

		let height = LAYOUT.CONTAINER_PADDING + LAYOUT.PANEL_BORDER;

		if (state.currentTab === "tasks") {
			height += LAYOUT.INPUT_HEIGHT;
		}

		if (visibleTasks.length > 0) {
			if (state.currentTab === "tasks") {
				height += LAYOUT.FIRST_TASK_MARGIN;
			}
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
			if (Math.abs(startHeight - endHeight) < 2) {
				// Keep the height locked for the duration of the primary animation to
				// avoid micro-shifts caused by other element transitions (e.g., the
				// input container sliding out).
				setTimeout(() => {
					element.style.height = "";
					resolve();
				}, ANIMATION.TAB);
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

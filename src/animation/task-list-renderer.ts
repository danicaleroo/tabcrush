// features/animation/task-list-renderer.ts
import { ANIMATION } from "../core/constants";
import { taskItemHTML } from "../core/ui";
import type { Task, Settings } from "../core/types";

export class TaskListRenderer {
	constructor(private settings: Settings) {}

	updateSettings(settings: Settings): void {
		this.settings = settings;
	}

	renderTaskList(
		list: HTMLUListElement,
		tasks: Task[],
		animate: boolean = false,
		stagger: number = ANIMATION.STAGGER
	): void {
		list.innerHTML = "";
		const fragment = document.createDocumentFragment();

		tasks
			.sort((a, b) => b.createdAt - a.createdAt)
			.forEach((task) => {
				const div = document.createElement("div");
				div.innerHTML = taskItemHTML(task, this.settings);
				const el = div.firstElementChild as HTMLElement;
				if (animate) {
					el.classList.add("task-item-stagger");
				}
				fragment.appendChild(el);
			});

		list.appendChild(fragment);

		if (animate) {
			const children = Array.from(list.children) as HTMLElement[];
			children.forEach((el, index) => {
				el.style.transitionDelay = `${index * stagger}ms`;
			});

			requestAnimationFrame(() => {
				children.forEach((el) => {
					el.classList.remove("task-item-stagger");
				});
			});
		}
	}
}

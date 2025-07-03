import type { Task } from "../core/types";

(() => {
	try {
		const tasksData = localStorage.getItem("tasks");
		if (!tasksData) return;
		const tasks = JSON.parse(tasksData);
		const activeTasks = tasks.filter((task: Task) => !task.completed);
		if (activeTasks.length === 0) return;
		const INPUT_HEIGHT = 36;
		const INPUT_MARGIN = 8;
		const BASE_TASK_HEIGHT = 37.33;
		const TASK_SPACING = 4;
		const CONTAINER_PADDING = 24;
		const CHARS_PER_LINE = 43;
		let totalTasksHeight = 0;
		activeTasks.forEach((task: Task, index: number) => {
			const textLength = task.text.length;
			const lines = Math.max(1, Math.ceil(textLength / CHARS_PER_LINE));
			let taskHeight = BASE_TASK_HEIGHT;
			if (lines > 1) taskHeight += (lines - 1) * 20;
			totalTasksHeight += taskHeight;
			if (index < activeTasks.length - 1) totalTasksHeight += TASK_SPACING;
		});
		const panelHeight =
			INPUT_HEIGHT + INPUT_MARGIN + CONTAINER_PADDING + totalTasksHeight;
		document.documentElement.style.setProperty(
			"--preload-panel-height",
			`${panelHeight}px`
		);
		function setPanelHeight() {
			const panel = document.getElementById("tasks-panel");
			if (!panel) return;
			panel.style.height = `${panelHeight}px`;
			setTimeout(() => {
				panel.style.height = "";
				document.documentElement.style.removeProperty("--preload-panel-height");
			}, 50);
		}
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", setPanelHeight);
			return;
		}
		setPanelHeight();
	} catch (e) {}
})();

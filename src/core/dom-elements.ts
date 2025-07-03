export const elements = {
	tasksPanel: document.getElementById("tasks-panel") as HTMLDivElement | null,
	tasksList: document.getElementById("tasks-list") as HTMLUListElement | null,
	completedList: document.getElementById(
		"completed-list"
	) as HTMLUListElement | null,

	inputTaskContainer: document.getElementById(
		"input-task-container"
	) as HTMLDivElement | null,
	inputTask: document.getElementById("input-task") as HTMLInputElement | null,
	deleteAllButton: document.getElementById(
		"delete-all-button"
	) as HTMLButtonElement | null,

	tabBtnTasks: document.getElementById(
		"tab-button-tasks"
	) as HTMLButtonElement | null,
	tabBtnCompleted: document.getElementById(
		"tab-button-completed"
	) as HTMLButtonElement | null,
} as const;

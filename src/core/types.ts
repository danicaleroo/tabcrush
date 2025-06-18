// core/types.ts
import type { SUPPORTED_LANGUAGES } from "./constants";

export interface Task {
	id: string;
	text: string;
	completed: boolean;
	createdAt: number;
}

export interface Settings {
	theme: "light" | "dark";
	dateFormat: "full" | "short" | "weekday";
}

export type TabId = "tasks" | "completed";
export type TaskAction = "toggle" | "delete";
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface AppState {
	tasks: Task[];
	currentTab: TabId;
	hasActiveTasks: boolean;
	hasCompletedTasks: boolean;
	visibleTasks: Task[];
}

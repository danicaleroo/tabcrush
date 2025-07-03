// core/state-manager.ts
import { storage } from "./storage";
import { STORAGE_KEYS } from "./constants";
import type { Task, TabId, AppState } from "./types";

export class StateManager {
	private static instance: StateManager;
	private listeners = new Set<(state: AppState) => void>();
	private tasks: Task[] = [];
	private currentTab: TabId = "tasks";

	private constructor() {
		this.loadTasks();
	}

	static getInstance(): StateManager {
		if (!StateManager.instance) StateManager.instance = new StateManager();
		return StateManager.instance;
	}

	private loadTasks(): void {
		this.tasks = storage.get<Task[]>(STORAGE_KEYS.TASKS) || [];
	}

	private save(): void {
		storage.set(STORAGE_KEYS.TASKS, this.tasks);
		this.notifyListeners();
	}

	private notifyListeners(): void {
		const state = this.getState();
		this.listeners.forEach((fn) => fn(state));
	}

	subscribe(fn: (state: AppState) => void): () => void {
		this.listeners.add(fn);
		fn(this.getState());
		return () => this.listeners.delete(fn);
	}

	getState(): AppState {
		const activeTasks = this.tasks.filter((t) => !t.completed);
		const completedTasks = this.tasks.filter((t) => t.completed);

		return {
			tasks: this.tasks,
			currentTab: this.currentTab,
			hasActiveTasks: activeTasks.length > 0,
			hasCompletedTasks: completedTasks.length > 0,
			visibleTasks: this.currentTab === "tasks" ? activeTasks : completedTasks,
		};
	}

	getTasks(): Task[] {
		return this.tasks;
	}

	getActiveTasks(): Task[] {
		return this.tasks.filter((t) => !t.completed);
	}

	getCompletedTasks(): Task[] {
		return this.tasks.filter((t) => t.completed);
	}

	getVisibleTasks(): Task[] {
		return this.currentTab === "tasks"
			? this.getActiveTasks()
			: this.getCompletedTasks();
	}

	getCurrentTab(): TabId {
		return this.currentTab;
	}

	setTab(tab: TabId): void {
		if (this.currentTab === tab) return;
		this.currentTab = tab;
		this.notifyListeners();
	}

	addTask(text: string): Task {
		const sanitizedText = text.trim().replace(/[<>]/g, "").substring(0, 500);
		const task: Task = {
			id: crypto.randomUUID(),
			text: sanitizedText,
			completed: false,
			createdAt: Date.now(),
		};
		this.tasks.unshift(task);
		this.save();
		return task;
	}

	toggleTask(id: string): Task | null {
		const task = this.tasks.find((t) => t.id === id);
		if (!task) return null;
		task.completed = !task.completed;
		this.save();
		return task;
	}

	deleteTask(id: string): Task | null {
		const taskIndex = this.tasks.findIndex((t) => t.id === id);
		if (taskIndex === -1) return null;
		const [deletedTask] = this.tasks.splice(taskIndex, 1);
		this.save();
		return deletedTask;
	}

	deleteAllCompleted(): void {
		this.tasks = this.tasks.filter((t) => !t.completed);
		this.save();
	}

	shouldShowEmptyState(): boolean {
		return this.currentTab === "completed" && !this.hasCompletedTasks();
	}

	shouldShowDeleteAllButton(): boolean {
		return this.currentTab === "completed" && this.hasCompletedTasks();
	}

	shouldShowInputContainer(): boolean {
		return this.currentTab === "tasks";
	}

	hasActiveTasks(): boolean {
		return this.tasks.some((t) => !t.completed);
	}

	hasCompletedTasks(): boolean {
		return this.tasks.some((t) => t.completed);
	}
}

// handlers/tab-handler.ts
import { elements } from "../core/dom-elements";
import { TabController } from "../features/tabs";
import type { TaskManager } from "../features/tasks";

export class TabHandler {
	private tabController!: TabController;

	constructor(private taskManager: TaskManager) {}

	init(): void {
		this.initTabController();
		this.initDeleteAllHandler();
	}

	private initTabController(): void {
		this.tabController = new TabController(async (tab) => {
			await this.taskManager.switchTab(tab);
		});
		this.tabController.init();
	}

	private initDeleteAllHandler(): void {
		const deleteBtn = elements.deleteAllButton;
		if (!deleteBtn) return;

		deleteBtn.addEventListener("mousedown", (e) => {
			e.preventDefault();
		});
		deleteBtn.addEventListener("click", async () => {
			deleteBtn.blur();
			await this.taskManager.deleteAllCompleted();
		});
	}
}

// main.ts
import { DateTimeDisplay } from "./features/datetime";
import { SettingsManager } from "./features/settings";
import { TaskManager } from "./features/tasks";
import { ClickHandler } from "./handlers/click-handler";
import { InputHandler } from "./handlers/input-handler";
import { KeyboardHandler } from "./handlers/keyboard-handler";
import { TabHandler } from "./handlers/tab-handler";
import { LanguageLoader } from "./loaders/language-loader";

class App {
	private tasks!: TaskManager;
	private settings!: SettingsManager;
	private inputHandler!: InputHandler;
	private tabHandler!: TabHandler;
	private clickHandler!: ClickHandler;
	private keyboardHandler!: KeyboardHandler;

	async init(): Promise<void> {
		await LanguageLoader.load();

		this.settings = new SettingsManager();
		this.tasks = new TaskManager(this.settings.get());

		this.initHandlers();

		new DateTimeDisplay().start();

		this.settings.subscribe((settings) => {
			this.tasks.updateSettings(settings);
		});

		this.tasks.render();
	}

	private initHandlers(): void {
		this.inputHandler = new InputHandler(this.tasks);
		this.tabHandler = new TabHandler(this.tasks);
		this.clickHandler = new ClickHandler(this.tasks);
		this.keyboardHandler = new KeyboardHandler();

		this.inputHandler.init();
		this.tabHandler.init();
		this.clickHandler.init();
		this.keyboardHandler.init();

		this.initSettings();
	}

	private initSettings(): void {
		const settingsBtn = document.getElementById("settings-button");
		if (!settingsBtn) return;
		settingsBtn.addEventListener("mousedown", (e) => e.preventDefault());
		settingsBtn.addEventListener("click", () => {
			this.settings.showDialog();
			settingsBtn.blur();
		});
	}
}

const app = new App();
app.init().catch(console.error);

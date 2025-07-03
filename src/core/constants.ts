// core/constants.ts
export const STORAGE_KEYS = {
	TASKS: "tasks",
	SETTINGS: "settings",
	LANGUAGE: "language",
} as const;

export const ANIMATION = {
	FADE: 100,
	TAB: 300,
	STAGGER: 40,
} as const;

export const LAYOUT = {
	INPUT_HEIGHT: 36,
	INPUT_MARGIN: 8,
	CONTAINER_PADDING: 24,
	TASK_SPACING: 4,
	FIRST_TASK_MARGIN: 8,
	EMPTY_STATE_HEIGHT: 36,
	BASE_TASK_HEIGHT: 37.33,
	CHARS_PER_LINE: 43,
	PANEL_BORDER: 2,
} as const;

export const DEFAULT_SETTINGS = {
	theme: "light" as const,
	dateFormat: "full" as const,
};

export const SUPPORTED_LANGUAGES = [
	"en",
	"es",
	"fr",
	"de",
	"it",
	"pt",
	"zh",
	"ja",
	"ru",
	"hi",
	"ko",
] as const;

export const DEFAULT_LANGUAGE = "en";

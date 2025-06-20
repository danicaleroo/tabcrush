// core/ui.ts
import { formatDate, getRelativeDate } from "../utils/date";
import { escapeHtml } from "../utils/dom";
import { icon } from "../utils/icons";
import type { Settings, Task } from "./types";
import { i18n } from "../features/i18n";

export function taskItemHTML(task: Task, settings: Settings): string {
	const dateStr =
		settings.dateFormat === "full"
			? getRelativeDate(task.createdAt)
			: formatDate(task.createdAt, settings.dateFormat);

	const sanitizedText = escapeHtml(task.text).replace(/[<>]/g, "");

	const iconSquare = icon("square", "task-icon icon-square");
	const iconSquareCheck = icon("square-check", "task-icon icon-square-check");

	return `
    <li class="task-item group${task.completed ? " completed" : ""}" data-task-id="${task.id}" role="listitem">
      <button class="task-toggle"
        aria-label="${task.completed ? i18n.t("markTaskIncomplete") : i18n.t("markTaskComplete")}"
        aria-pressed="${task.completed}"
        role="checkbox"
        aria-checked="${task.completed}">
        <div class="py-1 self-start flex items-center" aria-hidden="true">
          ${iconSquare}
          ${iconSquareCheck}
        </div>
        <span class="${task.completed ? "completed" : ""}" aria-label="${i18n.t("taskLabel")}: ${sanitizedText}">${sanitizedText}</span>
      </button>
      <div class="task-meta">
        <span class="task-date" aria-label="${i18n.t("createdLabel")} ${dateStr}">${dateStr}</span>
        <button class="task-delete"
          aria-label="${i18n.t("deleteTaskLabel")}: ${sanitizedText}"
          role="button">
          ${icon("trash", "delete-icon")}
        </button>
      </div>
    </li>
  `;
}

export function emptyStateHTML(): string {
	return `<div class="empty-state" data-i18n="noCompletedTasks">${i18n.t("noCompletedTasks")}</div>`;
}

export function settingsFormHTML(s: Settings): string {
	return `
      <fieldset class="settings-section">
        <legend class="sr-only">Appearance Settings</legend>
        <label for="theme">Theme</label>
        <select id="theme" name="theme" aria-describedby="theme-help">
          <option value="light" ${s.theme === "light" ? "selected" : ""}>Light</option>
          <option value="dark" ${s.theme === "dark" ? "selected" : ""}>Dark</option>
        </select>
        <div id="theme-help" class="sr-only">Choose between light and dark theme</div>
      </fieldset>
  
      <fieldset class="settings-section">
        <legend class="sr-only">Date Format Settings</legend>
        <label for="dateFormat">Date Format</label>
        <select id="dateFormat" name="dateFormat" aria-describedby="date-help">
          <option value="full" ${s.dateFormat === "full" ? "selected" : ""}>Full Date</option>
          <option value="short" ${s.dateFormat === "short" ? "selected" : ""}>Short Date</option>
          <option value="weekday" ${s.dateFormat === "weekday" ? "selected" : ""}>Day of Week</option>
        </select>
        <div id="date-help" class="sr-only">Choose how dates are displayed for tasks</div>
      </fieldset>
      
      <div class="flex justify-between items-end gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <a href="https://github.com/danicaleroo/tabcrush" target="_blank" rel="noopener noreferrer" class="text-500" aria-label="${i18n.t("visitGithub")}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g clip-path="url(#clip0_69_1977)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" fill="currentColor"/>
            </g>
            <defs>
            <clipPath id="clip0_69_1977">
            <rect width="16" height="16" fill="white"/>
            </clipPath>
            </defs>
            </svg>
          </a>
          <a href="https://x.com/danicaleroo" target="_blank" rel="noopener noreferrer" class="text-500">Built by Dani Calero</a>
        </div>
        <button type="button" class="close-button focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2" data-i18n="close">${i18n.t("close")}</button>
      </div>
  `;
}

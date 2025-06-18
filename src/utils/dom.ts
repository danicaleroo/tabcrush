// utils/dom.ts
export const $ = <T extends HTMLElement>(id: string): T | null =>
	document.getElementById(id) as T;

export const escapeHtml = (text: string): string => {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
};

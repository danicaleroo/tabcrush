// utils/date.ts
import type { Settings } from "../core/types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

const dateFormatters = {
	full: new Intl.DateTimeFormat(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
	}),
	short: new Intl.DateTimeFormat(undefined, {
		month: "2-digit",
		day: "2-digit",
		year: "2-digit",
	}),
	weekday: new Intl.DateTimeFormat(undefined, {
		weekday: "long",
	}),
};

export const formatTime = (date: Date): string => timeFormatter.format(date);

export const formatDate = (
	timestamp: number,
	format: Settings["dateFormat"]
): string => dateFormatters[format].format(new Date(timestamp));

export function getRelativeDate(timestamp: number): string {
	const date = new Date(timestamp);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date.toDateString() === today.toDateString()) return "Today";
	if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
	return formatDate(timestamp, "short");
}

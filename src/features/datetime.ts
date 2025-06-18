// features/datetime.ts
import { formatDate, formatTime } from "../utils/date";
import { $ } from "../utils/dom";

export class DateTimeDisplay {
	private lastMinute = -1;
	private frame: number | null = null;
	private display: HTMLElement | null = null;

	start(): void {
		this.display = $("datetime-display");
		if (!this.display) return;
		this.update();
		document.addEventListener("visibilitychange", () => {
			if (document.hidden && this.frame) {
				cancelAnimationFrame(this.frame);
				this.frame = null;
			} else if (!document.hidden) {
				this.update();
			}
		});
	}

	private update = (): void => {
		if (!this.display) return;

		const now = new Date();
		const minute = now.getMinutes();
		const currentTime = formatTime(now);
		const currentDate = formatDate(now.getTime(), "full");
		const displayDate = `${currentTime} · ${currentDate}`;

		if (minute !== this.lastMinute) {
			this.display.textContent = displayDate;
			this.lastMinute = minute;
		}

		this.frame = requestAnimationFrame(this.update);
	};
}

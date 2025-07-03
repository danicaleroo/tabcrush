// core/storage.ts
export const storage = {
	get<T>(key: string): T | null {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		} catch {
			return null;
		}
	},

	set(key: string, value: unknown): void {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	},

	remove(key: string): void {
		localStorage.removeItem(key);
	},
};

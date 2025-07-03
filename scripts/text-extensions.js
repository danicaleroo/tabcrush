// scripts/test-extensions.js
import { execSync } from "child_process";
import { existsSync } from "fs";
import { platform } from "os";
import chalk from "chalk";

const browsers = {
	chrome: {
		darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		linux: "google-chrome",
		win32: "start chrome",
	},
	firefox: {
		darwin: "/Applications/Firefox.app/Contents/MacOS/firefox",
		linux: "firefox",
		win32: "start firefox",
	},
};

const targetBrowser = process.argv[2] || "chrome";
const distPath = `browser-extensions/${targetBrowser}/dist`;

if (!existsSync(distPath)) {
	console.error(chalk.red(`\n❌ No build found for ${targetBrowser}`));
	console.log(chalk.yellow(`Please run: npm run build:${targetBrowser}`));
	process.exit(1);
}

console.log(chalk.blue.bold(`\n🧪 Testing ${targetBrowser} Extension\n`));

const currentPlatform = platform();
const browserPath = browsers[targetBrowser]?.[currentPlatform];

if (!browserPath) {
	console.error(
		chalk.red(`Browser path not configured for ${currentPlatform}`)
	);
	process.exit(1);
}

if (targetBrowser === "chrome") {
	console.log(chalk.gray("To test the Chrome extension:"));
	console.log(chalk.cyan("1. Open Chrome and go to chrome://extensions/"));
	console.log(chalk.cyan('2. Enable "Developer mode" (top right)'));
	console.log(chalk.cyan('3. Click "Load unpacked"'));
	console.log(chalk.cyan(`4. Select: ${process.cwd()}/${distPath}`));
	console.log(chalk.cyan("5. Open a new tab to see your extension"));

	// Try to open Chrome extensions page
	try {
		const cmd =
			currentPlatform === "darwin"
				? `"${browserPath}" "chrome://extensions/"`
				: `${browserPath} "chrome://extensions/"`;
		execSync(cmd);
	} catch (e) {
		// Ignore errors, just provide manual instructions
	}
} else if (targetBrowser === "firefox") {
	console.log(chalk.gray("To test the Firefox extension:"));
	console.log(chalk.cyan("1. Open Firefox and go to about:debugging"));
	console.log(
		chalk.cyan('2. Click "This Firefox" (or "Load Temporary Add-on")')
	);
	console.log(chalk.cyan(`3. Navigate to: ${process.cwd()}/${distPath}`));
	console.log(chalk.cyan("4. Select manifest.json"));
	console.log(chalk.cyan("5. Open a new tab to see your extension"));

	// Try to open Firefox debugging page
	try {
		const cmd =
			currentPlatform === "darwin"
				? `"${browserPath}" "about:debugging"`
				: `${browserPath} "about:debugging"`;
		execSync(cmd);
	} catch (e) {
		// Ignore errors, just provide manual instructions
	}
}

console.log(chalk.green(`\n✅ Extension location: ${distPath}`));

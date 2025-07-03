// scripts/build-extensions.js
import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

// Configuration for each browser
const browsers = {
	chrome: {
		name: "Chrome",
		manifestVersion: 3,
		requiredFiles: ["manifest.json", "icon16.png", "icon48.png", "icon128.png"],
		distPath: "browser-extensions/chrome/dist",
	},
	firefox: {
		name: "Firefox",
		manifestVersion: 2, // or 3, depending on your manifest
		requiredFiles: ["manifest.json", "icon16.png", "icon48.png", "icon96.png"],
		distPath: "browser-extensions/firefox/dist",
	},
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldZip = args.includes("--zip");
const targetBrowser = args.find((arg) => !arg.startsWith("--"));

// Determine which browsers to build
const browsersToBuild =
	targetBrowser && browsers[targetBrowser]
		? [targetBrowser]
		: Object.keys(browsers);

console.log("\x1b[34m\x1b[1m🚀 Building Browser Extensions\x1b[0m\n");

// Build each browser extension
for (const browser of browsersToBuild) {
	console.log(
		`\n\x1b[33m📦 Building ${browsers[browser].name} Extension\x1b[0m`
	);
	console.log("\x1b[90m" + "─".repeat(50) + "\x1b[0m");

	try {
		// Step 1: Clean build directory
		const distPath = browsers[browser].distPath;
		if (existsSync(distPath)) {
			execSync(`rm -rf ${distPath}`, { stdio: "pipe" });
		}
		mkdirSync(distPath, { recursive: true });

		// Step 2: Run Vite build
		console.log("\x1b[90m  Building with Vite...\x1b[0m");
		execSync(`BUILD_TARGET=${browser} vite build`, {
			stdio: "pipe",
			env: { ...process.env, FORCE_COLOR: "1" },
		});
		console.log("\x1b[32m  ✓ Build completed\x1b[0m");

		// Step 3: Verify required files
		console.log("\x1b[90m\n  Verifying files:\x1b[0m");
		let allFilesPresent = true;

		// Check for tabcrush.html (renamed from new.html)
		const htmlPath = join(distPath, "tabcrush.html");
		if (existsSync(htmlPath)) {
			console.log("\x1b[32m    ✓ tabcrush.html\x1b[0m");
		} else {
			console.log("\x1b[31m    ✗ tabcrush.html - MISSING!\x1b[0m");
			allFilesPresent = false;
		}

		// Check other required files
		browsers[browser].requiredFiles.forEach((file) => {
			const filePath = join(distPath, file);
			if (existsSync(filePath)) {
				console.log(`\x1b[32m    ✓ ${file}\x1b[0m`);
			} else {
				console.log(`\x1b[31m    ✗ ${file} - MISSING!\x1b[0m`);
				allFilesPresent = false;
			}
		});

		// Check for assets
		const assetsPath = join(distPath, "assets");
		if (existsSync(assetsPath)) {
			const assets = readdirSync(assetsPath);
			console.log(`\x1b[32m    ✓ assets/ (${assets.length} files)\x1b[0m`);
		}

		if (!allFilesPresent) {
			throw new Error("Some required files are missing");
		}

		// Step 4: Validate manifest.json
		console.log("\x1b[90m\n  Validating manifest...\x1b[0m");
		const manifestPath = join(distPath, "manifest.json");
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

		if (manifest.chrome_url_overrides?.newtab === "tabcrush.html") {
			console.log(
				"\x1b[32m    ✓ Manifest correctly references tabcrush.html\x1b[0m"
			);
		} else {
			console.log("\x1b[33m    ⚠ Manifest may need updating\x1b[0m");
		}

		// Step 5: Create ZIP file if requested
		if (shouldZip) {
			console.log("\x1b[90m\n  Creating ZIP file...\x1b[0m");
			const zipName = `tabcrush-${browser}-v${manifest.version}.zip`;
			execSync(`cd ${distPath} && zip -r ../${zipName} . -x "*.DS_Store"`, {
				stdio: "pipe",
			});
			console.log(`\x1b[32m    ✓ Created ${zipName}\x1b[0m`);
		}

		console.log(
			`\n\x1b[32m\x1b[1m✅ ${browsers[browser].name} extension build successful!\x1b[0m`
		);
	} catch (error) {
		console.error(
			`\n\x1b[31m❌ ${browsers[browser].name} build failed:\x1b[0m`,
			error.message
		);
		process.exit(1);
	}
}

// Summary
console.log("\n\x1b[34m\x1b[1m📊 Build Summary\x1b[0m");
console.log("\x1b[90m" + "─".repeat(50) + "\x1b[0m");

browsersToBuild.forEach((browser) => {
	const distPath = browsers[browser].distPath;
	console.log(`\n\x1b[36m${browsers[browser].name}:\x1b[0m`);
	console.log(`\x1b[90m  📁 Distribution: ${distPath}\x1b[0m`);

	if (shouldZip) {
		const manifest = JSON.parse(
			readFileSync(join(distPath, "manifest.json"), "utf-8")
		);
		console.log(
			`\x1b[90m  📦 ZIP file: tabcrush-${browser}-v${manifest.version}.zip\x1b[0m`
		);
	}
});

console.log("\n\x1b[33m\x1b[1m🎯 Next Steps:\x1b[0m");
console.log(
	"\x1b[90m  1. Test extensions by loading the dist folders in each browser\x1b[0m"
);
console.log(
	"\x1b[90m  2. Run with --zip flag to create store-ready packages\x1b[0m"
);
console.log(
	"\x1b[90m  3. Upload ZIP files to respective extension stores\x1b[0m"
);

console.log("\n\x1b[90m💡 Available commands:\x1b[0m");
console.log(
	"\x1b[90m  npm run build:extensions          # Build all extensions\x1b[0m"
);
console.log(
	"\x1b[90m  npm run build:extensions chrome   # Build Chrome only\x1b[0m"
);
console.log(
	"\x1b[90m  npm run build:extensions firefox  # Build Firefox only\x1b[0m"
);
console.log(
	"\x1b[90m  npm run build:extensions --zip    # Build all and create ZIPs\x1b[0m"
);
console.log(
	"\x1b[90m  npm run package:extensions        # Build all and create ZIPs\x1b[0m"
);

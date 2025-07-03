// vite.config.ts
import { defineConfig, Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	statSync,
	renameSync,
} from "fs";
import { join } from "path";

// Detect build target from environment
const BUILD_TARGET = process.env.BUILD_TARGET; // 'chrome', 'firefox', or undefined for regular build
const isExtensionBuild =
	BUILD_TARGET === "chrome" || BUILD_TARGET === "firefox";

// Plugin to handle extension-specific tasks
function extensionBuildPlugin(): Plugin {
	return {
		name: "extension-build",
		closeBundle() {
			if (!isExtensionBuild || !BUILD_TARGET) return;

			const sourceDir = `browser-extensions/${BUILD_TARGET}`;
			const distDir = `browser-extensions/${BUILD_TARGET}/dist`;

			// Copy manifest.json
			const manifestSrc = join(sourceDir, "manifest.json");
			const manifestDest = join(distDir, "manifest.json");

			if (existsSync(manifestSrc)) {
				copyFileSync(manifestSrc, manifestDest);
				console.log(`✓ Copied manifest.json for ${BUILD_TARGET}`);
			}

			// Copy all icon files
			const files = readdirSync(sourceDir);
			files.forEach((file) => {
				if (file.match(/^icon\d+\.png$/)) {
					const src = join(sourceDir, file);
					const dest = join(distDir, file);
					copyFileSync(src, dest);
					console.log(`✓ Copied ${file} for ${BUILD_TARGET}`);
				}
			});

			// Copy any other browser-specific assets (if they exist)
			const additionalAssets = ["_locales", "images", "fonts"];
			additionalAssets.forEach((asset) => {
				const assetPath = join(sourceDir, asset);
				if (existsSync(assetPath) && statSync(assetPath).isDirectory()) {
					copyDirectory(assetPath, join(distDir, asset));
					console.log(`✓ Copied ${asset} directory for ${BUILD_TARGET}`);
				}
			});

			// Rename new.html → tabcrush.html inside the written bundle (Vite doesn't expose HTML in generateBundle)
			const newHtmlPath = join(distDir, "new.html");
			const tabcrushHtmlPath = join(distDir, "tabcrush.html");
			if (existsSync(newHtmlPath)) {
				renameSync(newHtmlPath, tabcrushHtmlPath);
				console.log("✓ Renamed new.html to tabcrush.html");
			}

			// Copy essential assets from the top-level public/ folder that the extension page references with absolute paths
			const publicDir = join(__dirname, "public");
			// fonts
			const publicFonts = join(publicDir, "fonts");
			if (existsSync(publicFonts)) {
				copyDirectory(publicFonts, join(distDir, "fonts"));
				console.log("✓ Copied fonts directory");
			}
			// locales
			const publicLocales = join(publicDir, "locales");
			if (existsSync(publicLocales)) {
				copyDirectory(publicLocales, join(distDir, "locales"));
				console.log("✓ Copied locales directory");
			}
			// root-level static files (icon.svg, favicon.ico)
			["icon.svg", "favicon.ico"].forEach((file) => {
				const src = join(publicDir, file);
				if (existsSync(src)) {
					copyFileSync(src, join(distDir, file));
					console.log(`✓ Copied ${file}`);
				}
			});
		},
		generateBundle(options, bundle) {
			// Rename the HTML file in the bundle before it's written
			if (isExtensionBuild) {
				for (const fileName in bundle) {
					if (fileName === "new.html") {
						bundle["tabcrush.html"] = bundle[fileName];
						delete bundle[fileName];

						// Update any references in other files
						for (const file in bundle) {
							if (bundle[file].type === "asset" && bundle[file].source) {
								bundle[file].source = bundle[file].source
									.toString()
									.replace(/new\.html/g, "tabcrush.html");
							}
						}
					}
				}
			}
		},
	};
}

// Helper function to recursively copy directories
function copyDirectory(src: string, dest: string) {
	if (!existsSync(dest)) {
		mkdirSync(dest, { recursive: true });
	}

	const entries = readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
}

// Build plugins array
const buildPlugins = (): Plugin[] => {
	const plugins: Plugin[] = [...tailwindcss()];

	// Add extension plugin for extension builds
	if (isExtensionBuild) {
		plugins.push(extensionBuildPlugin());
	}

	// Add PWA plugin only for regular builds
	if (!isExtensionBuild) {
		plugins.push(
			...VitePWA({
				registerType: "autoUpdate",
				includeAssets: [],
				workbox: {
					globPatterns: [
						"new.html",
						"**/*.{js,css}",
						"fonts/*.woff2",
						"icon.svg",
						"favicon.ico",
					],
					globIgnores: [
						"index.html",
						"privacy.html",
						"**/browser-logos/**",
						"**/node_modules/**",
						"**/*.map",
					],
					navigateFallback: null,
					runtimeCaching: [
						{
							urlPattern: /\/locales\/.*\.json$/,
							handler: "CacheFirst",
							options: {
								cacheName: "translations",
								expiration: {
									maxEntries: 11,
									maxAgeSeconds: 60 * 60 * 24 * 30,
								},
							},
						},
						{
							urlPattern: /\/(index|privacy)\.html$/,
							handler: "NetworkFirst",
							options: {
								cacheName: "pages",
								expiration: {
									maxEntries: 2,
									maxAgeSeconds: 60 * 60 * 24,
								},
							},
						},
						{
							urlPattern:
								/\/(browser-logos|twitter-image|og-image).*\.(svg|jpg|png)$/,
							handler: "CacheFirst",
							options: {
								cacheName: "landing-assets",
								expiration: {
									maxEntries: 20,
									maxAgeSeconds: 60 * 60 * 24 * 7,
								},
							},
						},
					],
					skipWaiting: true,
					clientsClaim: true,
					cleanupOutdatedCaches: true,
				},
				manifest: false,
			})
		);
	}

	return plugins;
};

export default defineConfig({
	plugins: buildPlugins(),
	// Disable public directory for extension builds
	publicDir: isExtensionBuild ? false : "public",
	build: {
		target: "esnext",
		minify: "terser",
		cssMinify: true,
		// Output directory based on build target
		outDir: isExtensionBuild
			? `browser-extensions/${BUILD_TARGET}/dist`
			: "dist",
		emptyOutDir: true,
		rollupOptions: {
			input: isExtensionBuild
				? {
						// Only new.html for extensions
						main: resolve(__dirname, "new.html"),
					}
				: {
						// All pages for regular build
						main: resolve(__dirname, "new.html"),
						landing: resolve(__dirname, "index.html"),
						privacy: resolve(__dirname, "privacy.html"),
					},
			output: {
				// Use consistent naming for extensions (no hash)
				entryFileNames: isExtensionBuild
					? "assets/[name].js"
					: "assets/[name]-[hash].js",
				chunkFileNames: isExtensionBuild
					? "assets/[name].js"
					: "assets/[name]-[hash].js",
				assetFileNames: (assetInfo) => {
					if (isExtensionBuild) {
						// Simple naming for extensions
						const extname = assetInfo.name?.split(".").pop();
						if (extname === "css") return "assets/[name].css";
						if (extname === "woff2") return "fonts/[name].[ext]";
						return "assets/[name].[ext]";
					}
					// Regular build with hashes
					if (assetInfo.name?.endsWith(".css")) {
						return "assets/[name]-[hash].css";
					}
					return "assets/[name]-[hash].[ext]";
				},
			},
			// More aggressive optimization for extensions
			treeshake: isExtensionBuild
				? {
						moduleSideEffects: false,
						propertyReadSideEffects: false,
					}
				: true,
		},
		cssCodeSplit: !isExtensionBuild,
		assetsInlineLimit: isExtensionBuild ? 10240 : 4096,
		reportCompressedSize: false,
		sourcemap: !isExtensionBuild,
		// More aggressive minification for extensions
		terserOptions: isExtensionBuild
			? {
					compress: {
						drop_console: true,
						drop_debugger: true,
						pure_funcs: ["console.log", "console.debug"],
						passes: 2,
					},
					mangle: {
						safari10: true,
					},
					format: {
						comments: false,
					},
				}
			: undefined,
	},
});

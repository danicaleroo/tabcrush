// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
	plugins: [
		tailwindcss(),
		VitePWA({
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
		}),
	],
	build: {
		target: "esnext",
		minify: "terser",
		cssMinify: true,
		rollupOptions: {
			input: {
				main: "new.html",
				landing: "index.html",
				privacy: "privacy.html",
			},
			output: {
				chunkFileNames: "assets/[name]-[hash].js",
				entryFileNames: "assets/[name]-[hash].js",
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith(".css")) {
						return "assets/[name]-[hash].css";
					}
					return "assets/[name]-[hash].[ext]";
				},
			},
		},
		cssCodeSplit: true,
		assetsInlineLimit: 4096,
		reportCompressedSize: false,
	},
});

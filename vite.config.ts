// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"icon.svg",
				"InterDisplay-Medium.woff2",
				"inter-variable.ttf",
				"favicon-16x16.png",
				"favicon-32x32.png",
				"apple-touch-icon.png",
				"pwa-192x192.png",
				"pwa-512x512.png",
				"favicon.ico",
			],
			workbox: {
				globPatterns: ["**/*.{js,css,svg,woff2,json,png,html,ico}"],
				navigateFallback: "index.html",
				navigateFallbackDenylist: [/sitemap\.xml$/, /robots\.txt$/],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /\/locales\/.*\.json$/,
						handler: "CacheFirst",
						options: {
							cacheName: "locales",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
						},
					},
				],
				skipWaiting: true,
				clientsClaim: true,
				cleanupOutdatedCaches: true,
			},
			manifest: {
				name: "tabcrush",
				short_name: "tabcrush",
				description:
					"tabcrush is a lightning-fast, offline-first task manager for your browser's new tab. Manage todos locally with zero latency, complete privacy, and no internet required. Free forever.",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				display: "standalone",
				icons: [
					{
						src: "/favicon-16x16.png",
						sizes: "16x16",
						type: "image/png",
					},
					{
						src: "/favicon-32x32.png",
						sizes: "32x32",
						type: "image/png",
					},
					{
						src: "/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png",
					},
					{
						src: "/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
		}),
	],
	build: {
		target: "esnext",
		minify: "terser",
		cssMinify: true,
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: [
					"console.log",
					"console.info",
					"console.debug",
					"console.trace",
				],
				passes: 2,
				unsafe: true,
				unsafe_comps: true,
				unsafe_math: true,
				unsafe_proto: true,
			},
			mangle: {
				properties: {
					regex: /^_/,
				},
			},
			format: {
				comments: false,
			},
		},
		rollupOptions: {
			input: {
				main: "index.html",
				app: "new.html",
				privacy: "privacy.html",
			},
			output: {
				manualChunks: undefined,
				chunkFileNames: "[name]-[hash].js",
				entryFileNames: "[name]-[hash].js",
				assetFileNames: "[name]-[hash].[ext]",
			},
		},
		// Enable advanced optimizations
		cssCodeSplit: true,
		assetsInlineLimit: 4096,
		reportCompressedSize: false,
	},
});

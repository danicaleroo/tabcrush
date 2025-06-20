// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "script",
			includeAssets: [],
			workbox: {
				globPatterns: [
					"new.html",
					"assets/*.{js,css}",
					"fonts/InterDisplay-Medium.woff2",
					"icon.svg",
					"favicon.ico",
				],
				navigateFallback: null,
				navigateFallbackDenylist: [/.*/], // Denegar todo
				runtimeCaching: [
					{
						urlPattern: /\/locales\/.*\.json$/,
						handler: "CacheFirst",
						options: {
							cacheName: "locales",
							expiration: {
								maxEntries: 11, // Solo los idiomas que tienes
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						// PWA assets solo cuando se necesiten
						urlPattern: /\/(pwa-|apple-touch-icon|favicon-).*\.(png|ico)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "pwa-assets",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
					{
						// Manifest solo cuando se necesite
						urlPattern: /manifest\.webmanifest$/,
						handler: "NetworkFirst",
						options: {
							cacheName: "manifest",
							expiration: {
								maxEntries: 1,
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
		cssCodeSplit: true,
		assetsInlineLimit: 4096,
		reportCompressedSize: false,
	},
});

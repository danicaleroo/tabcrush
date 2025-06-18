// postcss.config.js

export default {
	plugins: {
		autoprefixer: {},
		...(process.env.NODE_ENV === "production"
			? {
					cssnano: {
						preset: [
							"default", // Changed from "advanced" to "default"
							{
								discardComments: {
									removeAll: true,
								},
								// Remove aggressive optimizations that might break styles
								normalizeWhitespace: false,
								minifySelectors: false,
								uniqueSelectors: true,
								mergeRules: true,
								cssDeclarationSorter: false,
							},
						],
					},
				}
			: {}),
	},
};

import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
	worker: {
		name: "discordworker",
		compatibilityDate: "2024-12-24",
		compatibilityFlags: [
			"nodejs_compat",
		],
		entrypoint: "src/worker.ts",
		workersDev: false,
		previewUrls: false,
		observability: {
			enabled: true,
		},
		env: { DISCORD_CONFIG: bindings.secret() },
		triggers: [
			triggers.queue({
				name: "discordqueue",
			}),
		],
	},
});

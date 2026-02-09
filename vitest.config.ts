import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    restoreMocks: true,
    poolOptions: {
      workers: {
        singleWorker: true,
        miniflare: {
          // Required to use `SELF.queue()`. This is an experimental
          // compatibility flag, and cannot be enabled in production.
          compatibilityFlags: ["service_binding_extra_handlers"],
          queueConsumers: {
            // queue name
            slackqueue: { maxBatchTimeout: 0.05 /* 50ms */ },
          },
          bindings: {
            DISCORD_CONFIG:
              '{"DEFAULT": {"TOKEN":"test_token", "CHANNEL_ID": "test_channel_id"}, "CAT_BOT": {"TOKEN":"test_token_cat", "CHANNEL_ID":"test_channel_id_cat"}}',
          },
        },
        wrangler: {
          configPath: "./wrangler.jsonc",
        },
      },
    },
  },
});

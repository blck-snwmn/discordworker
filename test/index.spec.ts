import { randomBytes } from "node:crypto";
import {
	createExecutionContext,
	createMessageBatch,
	env,
	fetchMock,
	getQueueResult,
	waitOnExecutionContext,
} from "cloudflare:test";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import worker from "../src/worker";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

beforeAll(() => {
	// Enable outbound request mocking...
	fetchMock.activate();
	// ...and throw errors if an outbound request isn't mocked
	fetchMock.disableNetConnect();
});

afterEach(() => {
	vi.restoreAllMocks();
	fetchMock.assertNoPendingInterceptors();
});

describe("test queue comsumer", () => {
	it("consumes queue messages", async () => {
		fetchMock
			.get("https://discord.com")
			.intercept({
				path: "/api/v10/channels/TEST_CHANNEL/messages",
				method: "POST",
				headers: {
					Authorization: "Bot test_token_cat",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					channel: "TEST_CHANNEL",
					body: "Test",
				}),
			})
			.reply(200);

		const messages: ServiceBindingQueueMessage<QueueMessage>[] = [
			{
				id: randomBytes(16).toString("hex"),
				timestamp: new Date(1000),
				attempts: 0,
				body: {
					type: "send_message",
					channelId: "TEST_CHANNEL",
					message: {
						channel: "TEST_CHANNEL",
						body: "Test",
					},
				},
			},
		];
		const batch = createMessageBatch("queue", messages);
		const ctx = createExecutionContext();
		await worker.queue(batch, env, ctx);

		const result = await getQueueResult(batch, ctx);
		expect(result.outcome).toBe("ok");
		expect(result.retryBatch.retry).toBe(false); // `true` if `batch.retryAll()` called
		expect(result.ackAll).toBe(false); // `true` if `batch.ackAll()` called
		expect(result.retryMessages).toStrictEqual([]);
		expect(result.explicitAcks).toStrictEqual([messages[0].id]);
	});

	it("retries when message sending fails", async () => {
		fetchMock
			.get("https://discord.com")
			.intercept({
				path: "/api/v10/channels/TEST_CHANNEL/messages",
				method: "POST",
				headers: {
					Authorization: "Bot test_token_cat",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					channel: "TEST_CHANNEL",
					body: "Test",
				}),
			})
			.reply(400, "Bad Request");

		const messages: ServiceBindingQueueMessage<QueueMessage>[] = [
			{
				id: randomBytes(16).toString("hex"),
				timestamp: new Date(1000),
				attempts: 0,
				body: {
					type: "send_message",
					channelId: "TEST_CHANNEL",
					message: {
						channel: "TEST_CHANNEL",
						body: "Test",
					},
				},
			},
		];
		const batch = createMessageBatch("queue", messages);
		const ctx = createExecutionContext();
		await worker.queue(batch, env, ctx);

		const result = await getQueueResult(batch, ctx);
		expect(result.outcome).toBe("ok");
		expect(result.retryBatch.retry).toBe(false);
		expect(result.ackAll).toBe(false);
		expect(result.retryMessages).toStrictEqual([{ msgId: messages[0].id }]);
		expect(result.explicitAcks).toStrictEqual([]);
	});

	it("uses default channel ID when channelId is empty", async () => {
		const defaultChannelId = "test_channel_id_cat";
		const token = "test_token_cat";

		fetchMock
			.get("https://discord.com")
			.intercept({
				path: `/api/v10/channels/${defaultChannelId}/messages`,
				method: "POST",
				headers: {
					Authorization: `Bot ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					channel: defaultChannelId,
					body: "Test",
				}),
			})
			.reply(200);

		const messages: ServiceBindingQueueMessage<QueueMessage>[] = [
			{
				id: randomBytes(16).toString("hex"),
				timestamp: new Date(1000),
				attempts: 0,
				body: {
					type: "send_message",
					channelId: "",
					message: {
						channel: defaultChannelId,
						body: "Test",
					},
				},
			},
		];
		const batch = createMessageBatch("queue", messages);
		const ctx = createExecutionContext();

		await worker.queue(batch, env, ctx);

		const result = await getQueueResult(batch, ctx);
		expect(result.outcome).toBe("ok");
		expect(result.retryBatch.retry).toBe(false);
		expect(result.ackAll).toBe(false);
		expect(result.retryMessages).toStrictEqual([]);
		expect(result.explicitAcks).toStrictEqual([messages[0].id]);
	});

	it("uses default channel ID when message channel is not set", async () => {
		const defaultChannelId = "test_channel_id_cat";
		const token = "test_token_cat";

		fetchMock
			.get("https://discord.com")
			.intercept({
				path: `/api/v10/channels/${defaultChannelId}/messages`,
				method: "POST",
				headers: {
					Authorization: `Bot ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					body: "Test",
				}),
			})
			.reply(200);

		const messages: ServiceBindingQueueMessage<QueueMessage>[] = [
			{
				id: randomBytes(16).toString("hex"),
				timestamp: new Date(1000),
				attempts: 0,
				body: {
					type: "send_message",
					message: {
						body: "Test",
					},
				},
			},
		];
		const batch = createMessageBatch("queue", messages);
		const ctx = createExecutionContext();

		await worker.queue(batch, env, ctx);

		const result = await getQueueResult(batch, ctx);
		expect(result.outcome).toBe("ok");
		expect(result.retryBatch.retry).toBe(false);
		expect(result.ackAll).toBe(false);
		expect(result.retryMessages).toStrictEqual([]);
		expect(result.explicitAcks).toStrictEqual([messages[0].id]);
	});
});

type QueueMessage = UnknownMessage | SendMessage;

type UnknownMessage = {
	type: "unknown";
};

type SendMessage = {
	type: "send_message";
	channelId: string;
	message: Record<string, string>;
};

export interface Env {
	DQUEUE: Queue<QueueMessage>;
	DISCORD_TOKEN: string;

	// DISCORD_TARGET_CHANNEL_ID: string; // test
}

const version = "10";
const baseURL = `https://discord.com/api/v${version}`;

export default {
	// 	async fetch(
	// 		request: Request,
	// 		env: Env,
	// 		ctx: ExecutionContext,
	// 	): Promise<Response> {
	// 		await env.DQUEUE.send({
	// 			type: "send_message",
	// 			channelId: env.DISCORD_TARGET_CHANNEL_ID,
	// 			message: {
	// 				content: `# Title
	// this is title

	// ## Subtitle
	// this is subtitle
	// `,
	// 			},
	// 		});
	// 		return new Response("ok");
	// 	},

	async queue(
		batch: MessageBatch<QueueMessage>,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		for (const message of batch.messages) {
			if (message.body.type === "send_message") {
				const body = message.body;
				const url = `${baseURL}/channels/${body.channelId}/messages`;
				const messageBody = body.message;

				const resp = await fetch(url, {
					method: "POST",
					headers: {
						Authorization: `Bot ${env.DISCORD_TOKEN}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(messageBody),
				});
				if (resp.status !== 200) {
					console.error(`failed: ${await resp.text()}`);
					message.retry();
					continue;
				}
			}
			message.ack();
		}
	},
};

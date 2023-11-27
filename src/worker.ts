type QueueMessage = UnknownMessage | SendMessage;

type UnknownMessage = {
	type: "unknown";
};

type SendMessage = {
	type: "send_message";
	channelId: string;
	message: Record<string, string>;
};

type Config = {
	DEFAULT: ConfigItem;
	CAT_BOT: ConfigItem;
};

type ConfigItem = {
	TOKEN: string;
	CHANNEL_ID: string;
};

export interface Env {
	DQUEUE: Queue<QueueMessage>;
	DISCORD_CONFIG: string;
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
				const messageBody = body.message;

				const config = JSON.parse(env.DISCORD_CONFIG) as Config;
				const token = config.CAT_BOT.TOKEN;
				const channelId = config.CAT_BOT.CHANNEL_ID;
				const url = `${baseURL}/channels/${channelId}/messages`;
				const resp = await fetch(url, {
					method: "POST",
					headers: {
						Authorization: `Bot ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(messageBody),
				});
				if (resp.status !== 200) {
					console.error(`failed: ${await resp.text()}`);
					message.retry();
					continue;
				}
				// const resp = await fetch(url, {
				// 	method: "POST",
				// 	headers: {
				// 		Authorization: `Bot ${"aaa"}`,
				// 		"Content-Type": "application/json",
				// 	},
				// 	body: JSON.stringify(messageBody),
				// });
				// if (resp.status !== 200) {
				// 	console.error(`failed: ${await resp.text()}`);
				// 	message.retry();
				// 	continue;
				// }
			}
			message.ack();
		}
	},
};

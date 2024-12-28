const version = "10";
const baseURL = `https://discord.com/api/v${version}`;

export default {
	async queue(
		batch: MessageBatch<QueueMessage>,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		for (const message of batch.messages) {
			console.info(`processing message id: ${message.id}`);
			console.info(`message type: ${message.body.type}`);
			console.info(`message attempts: ${message.attempts}`);

			if (message.body.type === "send_message") {
				const body = message.body;
				const messageBody = body.message;

				const config = JSON.parse(env.DISCORD_CONFIG) as Config;
				const token = config.CAT_BOT.TOKEN;
				const channelId = config.CAT_BOT.CHANNEL_ID;
				const url = `${baseURL}/channels/${channelId}/messages`;
				console.info(`sending message to ${url}`);
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
			}
			message.ack();
		}
	},
} satisfies ExportedHandler<Env, QueueMessage>;

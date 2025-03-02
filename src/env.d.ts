type Config = {
	DEFAULT: ConfigItem;
	CAT_BOT: ConfigItem;
};

type ConfigItem = {
	TOKEN: string;
	CHANNEL_ID: string;
};

type QueueMessage = UnknownMessage | SendMessage;

type UnknownMessage = {
	type: "unknown";
};

type SendMessage = {
	type: "send_message";
	channelId?: string;
	message: Record<string, string>;
};

interface Env {
	DQUEUE: Queue<QueueMessage>;
	DISCORD_CONFIG: string;
}

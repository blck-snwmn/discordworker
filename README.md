# discordworker
A worker that consume messages from the queue and notifies Discrod. 

## Setting(for Local)
1. Create a file named .dev.vars in the project root directory.
2. Write the following key-value pairs in the .dev.vars file:
  ```
  DISCORD_TOKEN=<Your_Discord_TOKEN>
  ```

Replace 
- '<Your_Discord_TOKEN>' with the bearer token for the Discord file upload API

## Setting
Run the following commands to add your secrets to the Workers configuration:

Set secret
```bash
wrangler secret put DISCORD_TOKEN
```

Create queues
```bash
wrangler queues create discordqueue
```

## Deploy
After you've added the secrets, deploy the Worker with the following command:
```bash
wrangler deploy
```

## Use
### Send to queue from cf worker(note: Queues is open beta)
Add the following to your wrangler.toml

```toml
[[queues.producers]]
queue = "discordqueue"
binding = "DQUEUE"
```

Add the following to your worker script

```js
export interface Env {
	DQUEUE: Queue;
}

...

await env.DQUEUE.send({
    type: "send_message",
    channelId: "your channelID",
    message: {
        content: "Hello, world!",
    },
});
```

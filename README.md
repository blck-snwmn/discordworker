# discordworker
A worker that consume messages from the queue and notifies Discrod. 

## Setting(for Local)
1. Create a file named .dev.vars in the project root directory.
2. Write the following key-value pairs in the .dev.vars file:
  ```
  DISCORD_CONFIG={"DEFAULT":{"TOKEN":"<Your_Discord_TOKEN>","CHANNEL_ID":"<Your_Channel_ID>"},"CAT_BOT":{"TOKEN":"<Your_CAT_BOT_TOKEN>","CHANNEL_ID":"<Your_CAT_BOT_Channel_ID>"}}
  ```

Replace 
- Replace the token and channel placeholders for each bot.

## Setting
Run the following commands to add your secrets to the Workers configuration:

Deploy with secrets
```bash
pnpm exec cf deploy --mode production --secrets-file .dev.vars
```

Create queues
```bash
pnpm exec cf queues create --queue-name discordqueue
```

## Deploy
After you've added the secrets, deploy the Worker with the following command:
```bash
pnpm run deploy
```

## Development

CLI tools (`lefthook`) are managed by [aqua](https://aquaproj.github.io/) with versions pinned in [aqua.yaml](aqua.yaml).

### Install tools

Install aqua itself first (see the [aqua installation guide](https://aquaproj.github.io/docs/install)), then install the pinned tools:

```bash
aqua install
```

### Set up git hooks

[lefthook](lefthook.yml) runs lint and format checks on staged files before each commit. Register the hooks once after cloning:

```bash
lefthook install
```

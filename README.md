## Developing Locally

- Make sure you have SSH (passwordless) access to your Raspberry Pi.
- Clone/fork this repo onto both your local machine and your Raspberry Pi.
- `npm install` inside both repos.
- Locally, create a file called `sync.config.json` with these values:

```
{
  "username": "<username>",
  "hostname": "<hostname or IP address of your Pi>",
  "directory": "<parent directory on Pi into which the repo was cloned>",
  "quiet": <true|false> // Disable most rsync logs (defaults to false)
}
```

- Locally, you can now run `npm run sync-changes`, and any changes made to files inside `/src` will automatically be uploaded to your Pi.
- From the Pi, you can run `npm run build-changes`, and any changes pushed to `/src` will automatically be rebuilt. You can run additional scripts (test scripts, etc) by appending the shell commands to the `exec` property inside `nodemon.build.json`.

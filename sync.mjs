/**
 * Copies this project to the Raspberry Pi via rsync.
 * Create a JSON file named "sync.config.json" that has these properties:
 *  - username
 *  - hostname
 *  - directory
 *  - quiet (optional)
 */
import chalk from 'chalk';
import Rsync from 'rsync';
import { readFile } from 'node:fs/promises';

const {
  username,
  hostname,
  directory,
  quiet = false,
} = JSON.parse(await readFile('./sync.config.json'));

// Build the command
const rsync = Rsync.build({
  shell: 'ssh',
  flags: 'ahP',
  recursive: true,
  exclude: [
    '.git',
    '.DS_Store',
    'node_modules',
    'build',
    'package-lock.json',
    '.vscode',
    'dist',
  ],
  source: process.cwd(),
  destination: `${username}@${hostname}:${directory}`,
});

console.log(chalk.magenta(`\n🚀\t$ ${rsync.command()}`));

// Execute the command
rsync
  .output(
    data =>
      quiet ||
      console.log(
        chalk.blue(`📤\t${data.toString().split('\n').slice(0, 1).join('')}`)
      )
  )
  .execute((error, code) => {
    if (error) {
      console.error(chalk.red('👎\t', error));
    } else {
      console.log(chalk.green(`👍\tDone! [exit code ${code}]\n\n`));
    }
  });

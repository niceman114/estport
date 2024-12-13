#!/usr/bin/env node

import {exec} from 'child_process';
import packageJson from '../package.json';

const usage: string = `Usage:
    ${packageJson.name} <PORT=0-65535> [--output=json]
    ${packageJson.name} --version
    ${packageJson.name} [--help | -h]

Description:
    Display ESTABLISHED connections on a specific port,
    including the PID and command of the process.

Examples:
    ${packageJson.name} 3000
    ${packageJson.name} 3000 --output=json
    ${packageJson.name} --version
    ${packageJson.name} --help
`;

const showUsage = (): void => {
  console.info(usage.trim());
};

const execAsync = (command: string) => new Promise<{ stdout: string; stderr: string }>((resolve) => {
  exec(command, (error, stdout, stderr) => {
    resolve({
      stdout: stdout.trim(),
      stderr: error && stderr.trim().length > 0 ? error.message.trim() : stderr.trim()
    });
  });
});

const scan = async (port: string, outputJson: boolean): Promise<Array<{pid: string, command: string}>> => {
  const delimiter = '  '; // 2 spaces
  const {stdout, stderr} = await execAsync(`lsof -t -i :${port} | xargs -I {} sh -c 'echo "{}${delimiter}$(ps -o args= -p {})"'`);

  if (stderr) {
    console.error(stderr);
    process.exit(1);
  }

  const outputs: Array<{pid: string, command: string}> = [];

  stdout.split('\n').filter(line => line.length > 0).forEach((line: string) => {
    const [head, ...tail] = line.split(delimiter);
    outputs.push({
      pid : head,
      command : tail.join(delimiter)
    });
  });

  return outputs;
};

(async () => {
  const option = process.argv[2];
  const outputJson = process.argv.includes('--output=json');

  if (!option || option === '-h' || option === '--help') {
    showUsage();
    process.exit(0);
  }

  if (option === '--version') {
    console.info(`v${packageJson.version}`);
    process.exit(0);
  }

  if (isNaN(Number(option)) || Number(option) < 0 || Number(option) > 65535) {
    console.error(`Invalid option: ${option}`);
    showUsage();
    process.exit(1);
  }

  const outputs = await scan(option, outputJson);

  if (outputJson) {
    console.info(JSON.stringify(outputs));
  } else if (outputs.length == 0) {
    console.log(`Nothing on port ${option}`);
  } else {
    outputs.forEach((output, index) => {
      console.info(`#${index} [${output.pid}] ${output.command}`);
    });
  }
})();

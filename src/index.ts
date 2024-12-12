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
  const {stdout, stderr} = await execAsync(`lsof -t -i :${port}`);

  if (stderr) {
    console.error(stderr);
    process.exit(1);
  }

  const pids = stdout.split('\n').filter(pid => pid !== '');

  if (pids.length === 0) {
    console.log(`Nothing on port ${port}`);
    process.exit(0);
  }

  const outputs: Array<{pid: string, command: string}> = [];

  for (const pid of pids) {
    const {stdout, stderr} = await execAsync(`ps -p ${pid} -o args=`);
    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }

    outputs.push({pid: pid, command: stdout});
  }

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
  } else {
    outputs.forEach((output, index) => {
      console.info(`#${index} [${output.pid}] ${output.command}`);
    });
  }
})();

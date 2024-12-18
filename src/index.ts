#!/usr/bin/env node

import {exec} from 'child_process';
import packageJson from '../package.json';
import {Process, ScanResult} from "./types";

// NOTE: Constants defined without importing the os module
const isWindows = process.platform === "win32";
const EOL = isWindows ? '\r\n' : '\n';

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

const makePortScanCommand = (port: string, delimiter: string): string => {
  if (isWindows) {
    return `(Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue | Where-Object { ($_.LocalPort -eq ${port}) -or ($_.RemotePort -eq ${port} -and ($_.RemoteAddress -eq '127.0.0.1' -or $_.RemoteAddress -eq '::1')) } | Select-Object -ExpandProperty OwningProcess | ForEach-Object { "$_${delimiter}$((Get-Process -Id $_).Path)" })`;
    // NOTE: also get the same result with the command below
    // `netstat -anop tcp | Select-String -Pattern "^\\s*TCP\\s+(127\\.0\\.0\\.1:${port}|::1:${port})\\s.*|.*\\s+(127\\.0\\.0\\.1:${port}|::1:${port})\\s" | Select-String "ESTABLISHED" | ForEach-Object { $_ -match '\\s+(\\d+)\\s*$' | Out-Null; "$($matches[1])${delimiter}$((Get-Process -Id $($matches[1])).Path)" }`;
  }

  return `lsof -t -i TCP:${port} | xargs -I {} sh -c 'echo "{}${delimiter}$(ps -o args= -p {})"'`;
}

const execAsync = (command: string) => new Promise<{ stdout: string; stderr: string }>((resolve) => {
  let execOptions = {};
  if (isWindows) {
    execOptions = {shell: 'powershell'};
  }

  exec(command, execOptions, (error, stdout, stderr) => {
    resolve({
      stdout: stdout.trim(),
      stderr: error && stderr.trim().length > 0 ? error.message.trim() : stderr.trim()
    });
  });
});

const scan = async (port: string): Promise<ScanResult> => {
  const delimiter = '  '; // 2 spaces
  const portScanCommand = makePortScanCommand(port, delimiter);
  const {stdout, stderr} = await execAsync(portScanCommand);

  if (stderr) {
    return {
      success: false,
      message: stderr,
      data: [],
    };
  }

  const outputs: Array<Process> = [];

  stdout.split(EOL).filter(line => line.length > 0).forEach((line: string) => {
    const [head, ...tail] = line.split(delimiter);
    outputs.push({
      pid : head,
      command : tail.join(delimiter),
    });
  });

  return {
    success: true,
    data: outputs,
  };
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

  const scanResult = await scan(option);

  if (!scanResult.success) {
    console.error(scanResult.message);
    process.exit(1);
  }

  const outputs = scanResult.data;

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

# estport

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fniceman114%2Festport&title_bg=%23555555&icon=awesomelists.svg&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
[![NPM Version](https://img.shields.io/npm/v/estport.svg?logo=npm)](https://www.npmjs.com/package/estport)
[![NPM Downloads](https://img.shields.io/npm/dt/estport?logo=npm)](https://www.npmjs.com/package/estport)

A simple CLI tool that scans a specific port and displays the PID and full path of the process that initiated the TCP connection.

## How to install

```bash
npm install -g estport
```

## How to use

### Scan port

```bash
estport <PORT=0-65535>
```

### Scan port and display output as json string

```bash
estport <PORT=0-65535> --output=json
```

### Etc
Check version

```bash
estport --version
```

Help usage

```bash
estport [--help | -h]
```

## Examples

### Scan on port 3000

```bash
> estport 3000
#0 [2479] /Applications/Google Chrome.app/{...}/Google Chrome Helper --type=utility {...}
#1 [98169] /opt/homebrew/Cellar/node@22/22.11.0/bin/node /{...}/node_modules/react-scripts/scripts/start.js
```
on Windows is below:
```cmd 
PS C:\WINDOWS> estport 3000
#0 [2284] C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
#1 [16992] C:\Program Files\nodejs\node.exe
```

### Scan on port 3000 and display output as json string

```bash 
> estport 3000 --output=json | jq
[
  {
    "pid": "2479",
    "command": "/Applications/Google Chrome.app/{...}/Google Chrome Helper --type=utility {...}"
  },
  {
    "pid": "98169",
    "command": "/opt/homebrew/Cellar/node@22/22.11.0/bin/node /{...}/node_modules/react-scripts/scripts/start.js"
  }
]
```

on Windows is below:
```cmd 
PS C:\WINDOWS> estport 3000 --output=json | jq
[
  {
    "pid": "2284",
    "command": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  },
  {
    "pid": "16992",
    "command": "C:\\Program Files\\nodejs\\node.exe"
  }
]
```

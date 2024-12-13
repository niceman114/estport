# estport

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fniceman114%2Festport&title_bg=%23555555&icon=awesomelists.svg&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
[![NPM Version](https://img.shields.io/npm/v/estport.svg?logo=npm)](https://www.npmjs.com/package/estport)
[![NPM Downloads](https://img.shields.io/npm/dt/estport?logo=npm)](https://www.npmjs.com/package/estport)

A simple CLI tool to check established connections on a specific port and display the PID and the full path of the process that initiated the connection.

## How to install

```bash
npm install -g estport
```

## How to use

Scan established port

```bash
estport <PORT=0-65535>
```

Scan established port and output as json string

```bash
estport <PORT=0-65535> --output=json
```

Check version

```bash
estport --version
```

Help usage

```bash
estport [--help | -h]
```

## Examples

Scan established connections on port 3000

```bash 
> estport 3000
#0 [2479] /Applications/Google Chrome.app/{...}/Google Chrome Helper --type=utility {...}
#1 [98169] /opt/homebrew/Cellar/node@22/22.11.0/bin/node /{...}/node_modules/react-scripts/scripts/start.js
```

Scan established connections on port 3000 and output as json string

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
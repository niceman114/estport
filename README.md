# estport

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
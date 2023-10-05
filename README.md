# @webtypen/monitor-client | $ wtm

## Installation

```bash
$ npm install -g @webtypen/monitor-client
```

## Usage

```bash
# Show current state
$ wtm status

# Start monitoring
$ wtm start

# Start stop
$ wtm stop

# Set Custom-Config-Path
$ wtm config.path /home/{USER}/wt_monitoring.json

# Show installed version
$ wtm version
```

## Actions

Register an action:

```json
    ...
    "actions": {
        "my_backup_action": {
            "type": "backup.mongodb",
            "database": "{MONGODB_DATABASE_NAME}",
            "automation": { "mode": "daily", "times": ["18:30"] }
        }
    }
    ...
```

Manually run an action:

```bash
$ wtm run my_backup_action
```

## Process Management

Register a process:

```json
    ...
    "processes": {
        "api": {
            "command": "cd /{PROJECT_DIR}/ && node app.js",
            "autostart": true
        }
    }
    ...
```

Usage:

```bash
# Show process state
$ wtm process.status

# Start a process
$ wtm process.start {PROCESS_KEY}

# Restart a process
$ wtm process.restart {PROCESS_KEY}

# Stop a process
$ wtm process.stop {PROCESS_KEY}
```

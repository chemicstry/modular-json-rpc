[![Build Status](https://travis-ci.org/chemicstry/modular-json-rpc.svg?branch=master)](https://travis-ci.org/chemicstry/modular-json-rpc) [![Coverage Status](https://coveralls.io/repos/github/chemicstry/modular-json-rpc/badge.svg?branch=master)](https://coveralls.io/github/chemicstry/modular-json-rpc?branch=master)

# modular-json-rcp
modular-json-rpc is a JSON-RPC 2.0 library.

## Features:
- Simple transport interface allows easy addition of different transports (only [ws](https://github.com/websockets/ws) transport is implemented at the moment)
- Supports bidirectional calls (see `RPCNode`)
- Supports async calls and async server methods
- Written in typescript (has definitions)

# Examples
## Server-client RPC
### Server code
```javascript
const RPC = require('modular-json-rpc');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log("New websocket client");

    // Create transport interface via websocket
    var transport = new RPC.WSTransport(ws);

    // Create RPC server
    var server = new RPC.RPCServer(transport);

    // Bind methods
    server.bind("hello", (name) => {
        return `Hello, ${name}!`;
    });

    server.bind("add", (a, b) => {
        return a + b;
    });

    console.log("RPC Server ready!");
});

console.log("Server listening on port 8080");
```
### Client code
```javascript
const RPC = require('modular-json-rpc');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', async () => {
    console.log("Websocket connected.");

    // Create transport interface via websocket
    var transport = new RPC.WSTransport(ws);

    // Create RPC client
    var client = new RPC.RPCClient(transport);

    console.log(`Calling method hello("world").`);
    var result1 = await client.call("hello", "World");
    console.log(`Response: ${result1}`);

    console.log(`Calling method add(16, 32).`)
    var result2 = await client.call("add", 16, 32);
    console.log(`Response: ${result2}`);

    process.exit();
});

```
### Client console output
```shell
$ node client.js
Websocket connected.
Calling method hello("world").
Response: Hello, World!
Calling method add(16, 32).
Response: 48
```

## Bidirectional RPC
### Node (ws server) code
```javascript
const RPC = require('modular-json-rpc');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log("New websocket client");

    // Create transport interface via websocket
    var transport = new RPC.WSTransport(ws);

    // Create RPC node
    var node = new RPC.RPCNode(transport);

    // Note that hello method does not have name argument
    // name is retrieved by calling back and asking for a name
    node.bind("hello", async () => {
        var name = await node.call('getname');

        return `Hello, ${name}!`;
    });
});

console.log("Server listening on port 8080");
```
### Node (ws client) code
```javascript
const RPC = require('modular-json-rpc');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', async () => {
    console.log("Websocket connected.");

    // Create transport interface via websocket
    var transport = new RPC.WSTransport(ws);

    // Create RPC node
    var node = new RPC.RPCNode(transport);

    // Other node will call back and request a name
    node.bind('getname', () => {
        return "World";
    });

    // Call hello method without providing name
    var result = await node.call('hello');
    console.log(`Response: ${result}`);

    process.exit();
});
```
### Client console output
```shell
$ node node_client.js
Websocket connected.
Response: Hello, World!
```
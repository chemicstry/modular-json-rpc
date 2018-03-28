const RPC = require('../');
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

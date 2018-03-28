const RPC = require('../');
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

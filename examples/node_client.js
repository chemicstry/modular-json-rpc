const RPC = require('../');
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

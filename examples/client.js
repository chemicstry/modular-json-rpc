const RPC = require('../');
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

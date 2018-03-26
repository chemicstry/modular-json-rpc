import { describe, it } from 'mocha';
import { expect } from 'chai';
import { WSTransport } from './WSTransport';
import WebSocket = require('ws');

// Disabled temporarily
describe.skip('WSTransport', () => {
    let server: WebSocket.Server;
    let client: WebSocket;
    let transport: WSTransport;

    // Sends message to all clients
    function ServerSend(message: string) {
        server.clients.forEach((ws: WebSocket) => {
            if (ws.readyState === WebSocket.OPEN)
                ws.send(message);
        });
    }

    before(() => {
        // Start server
        server = new WebSocket.Server({ port: 3000 });
        server.on('connection', function connection(ws: WebSocket) {
            ws.send('something');
        });

        // Start client
        client = new WebSocket('ws://localhost:3000');

        // Start WSTransport
        transport = new WSTransport(client);
    });

    it('Should receive message correctly', () => {
        transport.SetDownstreamCb((message: string) => {
            expect(message).to.equal('something');
        });
        ServerSend('something');
    }).timeout(1000);

    after(() => {
        // Stop client
        client.close();
        // Stop server
        server.close();
    });
});


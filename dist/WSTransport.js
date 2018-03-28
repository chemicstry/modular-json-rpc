"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// WebSocket ('ws' package) transport
class WSTransport {
    constructor(ws) {
        this.ws = ws;
        this.downstreamCb = null;
        // Bind to websocket receive event
        this.ws.on('message', (message) => this.onReceive(message));
    }
    onReceive(message) {
        // Call downstream (JSON-RPC protocol)
        if (this.downstreamCb)
            this.downstreamCb(message);
    }
    SendUpstream(data) {
        this.ws.send(JSON.stringify(data));
    }
    SetDownstreamCb(cb) {
        this.downstreamCb = cb;
    }
}
exports.WSTransport = WSTransport;

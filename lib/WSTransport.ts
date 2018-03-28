import {Transport, TransportCb} from './Transport';
import * as WebSocket from 'ws';

// WebSocket ('ws' package) transport
class WSTransport implements Transport
{
    public ws: WebSocket;
    private downstreamCb: TransportCb | null;

    constructor(ws: WebSocket)
    {
        this.ws = ws;
        this.downstreamCb = null;

        // Bind to websocket receive event
        this.ws.on('message', (message: string): void => this.onReceive(message));
    }

    onReceive(message: string)
    {
        // Call downstream (JSON-RPC protocol)
        if (this.downstreamCb)
            this.downstreamCb(message);
    }

    SendUpstream(data: string): void {
        this.ws.send(data);
    }

    SetDownstreamCb(cb: TransportCb): void {
        this.downstreamCb = cb;
    }
}

export {
    WSTransport
};

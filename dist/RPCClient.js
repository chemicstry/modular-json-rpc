"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const Defines_1 = require("./Defines");
const timers_1 = require("timers");
const events_1 = require("events");
// Does not contain transport
class RPCClientBase extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        // Request id autoincrement
        this.requestId = 0;
        // Holds all pending requests
        this.requests = {};
        // Time in ms to wait for server response
        this.requestTimeout = Defines_1.JSONRPC_TIMEOUT;
    }
    // Calls remote RPC function
    call(name, ...params) {
        let id = this.requestId++;
        return new Promise((resolve, reject) => {
            // Set timeout
            let timer = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.requestTimeout);
            this.requests[id] = (result) => {
                // Response received, clear timeout
                timers_1.clearTimeout(timer);
                if (result instanceof Message_1.RPCResponseResult)
                    resolve(result.result);
                else
                    reject(new Defines_1.RPCMethodError(result.error.code, result.error.message, result.error.data));
            };
            this.send(new Message_1.RPCRequest(id, name, params));
        });
    }
    notify(name, ...params) {
        this.send(new Message_1.RPCRequest(undefined, name, params));
    }
    handleResponse(res) {
        if (typeof res.id !== "number") {
            this.emit('error', new Error(`Response id is not a number`));
            return;
        }
        if (!this.requests[res.id]) {
            this.emit('error', new Error(`Request with id ${res.id} not found`));
            return;
        }
        // Resolve promise
        this.requests[res.id](res);
        // Remove request
        delete this.requests[res.id];
    }
}
exports.RPCClientBase = RPCClientBase;
class RPCClient extends RPCClientBase {
    constructor(transport) {
        super();
        this.transport = transport;
        this.transport.SetDownstreamCb((data) => this.parseMessage(data));
    }
    // Parses received string and handles as request or response
    parseMessage(data) {
        try {
            var message = Message_1.ParseRPCMessage(data);
        }
        catch (e) {
            this.emit('error', new Error(`Message parse failed: ${e.message}`));
            return;
        }
        if (message.isResponse())
            this.handleResponse(message);
        else
            this.emit('error', new Error('Received message of non RPCResponse type'));
    }
    send(msg) {
        this.transport.SendUpstream(JSON.stringify(msg));
    }
}
exports.RPCClient = RPCClient;

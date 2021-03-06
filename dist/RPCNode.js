"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RPCClient_1 = require("./RPCClient");
const RPCServer_1 = require("./RPCServer");
const Message_1 = require("./Message");
const events_1 = require("events");
const Defines_1 = require("./Defines");
// Hack for multiple inheritance
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}
class RPCNode extends events_1.EventEmitter {
    constructor(transport) {
        super();
        // Hacks to achieve multiple inheritance
        // RPCClientBase
        this.requestId = 0;
        this.requests = {};
        this.requestTimeout = Defines_1.JSONRPC_TIMEOUT;
        // RPCServerBase
        this.handlers = {};
        this.transport = transport;
        this.transport.SetDownstreamCb((data) => this.parseMessage(data));
    }
    /* istanbul ignore next */
    call(name, ...params) { return new Promise((res, rej) => { }); }
    ;
    /* istanbul ignore next */
    notify(name, ...params) { }
    ;
    /* istanbul ignore next */
    handleResponse(res) { }
    ;
    /* istanbul ignore next */
    bind(name, handler) { }
    ;
    /* istanbul ignore next */
    handleRequest(req) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    ;
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
            this.handleRequest(message);
    }
    send(msg) {
        this.transport.SendUpstream(JSON.stringify(msg));
    }
}
exports.RPCNode = RPCNode;
applyMixins(RPCNode, [RPCClient_1.RPCClientBase, RPCServer_1.RPCServerBase]);

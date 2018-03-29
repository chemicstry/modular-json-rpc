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
const Message_1 = require("./Message");
const Defines_1 = require("./Defines");
class RPCServerBase {
    constructor() {
        // Holds all binded server methods
        this.handlers = {};
    }
    bind(name, handler) {
        this.handlers[name] = handler;
    }
    handleRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.handlers[req.method] === undefined) {
                this.send(new Message_1.RPCResponseError(req.id, {
                    code: -32601,
                    message: 'Method not found'
                }));
                return;
            }
            try {
                // Expand arguments if it is array
                if (req.params instanceof Array)
                    var result = yield this.handlers[req.method](...req.params);
                else
                    var result = yield this.handlers[req.method](req.params);
            }
            catch (e) {
                // Send a custom error
                if (e instanceof Defines_1.RPCMethodError) {
                    this.send(new Message_1.RPCResponseError(req.id, {
                        code: e.code,
                        message: e.message,
                        data: e.data
                    }));
                }
                // Send internal server error
                else {
                    this.send(new Message_1.RPCResponseError(req.id, {
                        code: -32603,
                        message: e.name + ': ' + e.message,
                    }));
                }
                return;
            }
            // Do not send result if request was notification
            if (!req.isNotification())
                this.send(new Message_1.RPCResponseResult(req.id, result));
        });
    }
}
exports.RPCServerBase = RPCServerBase;
class RPCServer extends RPCServerBase {
    constructor(transport) {
        super();
        this.transport = transport;
        this.transport.SetDownstreamCb((data) => this.parseMessage(data));
    }
    parseMessage(data) {
        try {
            var message = Message_1.ParseRPCMessage(data);
        }
        catch (e) {
            if (e instanceof Message_1.JSONParseError) {
                this.send(new Message_1.RPCResponseError(null, {
                    code: -32700,
                    message: 'Parse error',
                }));
            }
            else {
                this.send(new Message_1.RPCResponseError(null, {
                    code: -32600,
                    message: 'Invalid Request',
                }));
            }
            return;
        }
        if (message instanceof Message_1.RPCRequest)
            this.handleRequest(message);
        else {
            this.send(new Message_1.RPCResponseError(null, {
                code: -32600,
                message: 'Invalid Request',
            }));
        }
    }
    send(msg) {
        this.transport.SendUpstream(JSON.stringify(msg));
    }
}
exports.RPCServer = RPCServer;

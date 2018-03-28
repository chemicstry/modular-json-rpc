import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
    RPCMessage,
    RPCError,
    RPCRequest,
    RPCResponse,
    RPCResponseError,
    RPCResponseResult,
    JSONParseError,
    InvalidMessageError,
    InvalidRequestError,
    InvalidResponseError,
    ParseRPCMessage
} from './Message';

describe('RPCMessage', () => {
    describe('isRequest', () => {
        it('Should return true when constructed as RPCRequest', () => {
            let msg = new RPCRequest(69, "test");

            expect(msg.isRequest()).to.equal(true);
        });

        it('Should return false when constructed as RPCResponseResult', () => {
            let msg = new RPCResponseResult(69, "test");

            expect(msg.isRequest()).to.equal(false);
        });

        it('Should return false when constructed as RPCResponseError', () => {
            let msg = new RPCResponseResult(69, {
                code: 123,
                message: "testing"
            });

            expect(msg.isRequest()).to.equal(false);
        });
    });

    describe('isResponse', () => {
        it('Should return true when constructed as RPCResponseResult', () => {
            let msg = new RPCResponseResult(69, "test");

            expect(msg.isResponse()).to.equal(true);
        });

        it('Should return true when constructed as RPCResponseError', () => {
            let msg = new RPCResponseResult(69, {
                code: 123,
                message: "testing"
            });

            expect(msg.isResponse()).to.equal(true);
        });

        it('Should return false when constructed as RPCRequest', () => {
            let msg = new RPCRequest(69, "test");

            expect(msg.isResponse()).to.equal(false);
        });
    });
});

describe('RPCRequest', () => {
    describe('construct', () => {
        it('Should return a valid object when constructed without params', () => {
            let req = new RPCRequest(69, "test");
            expect(req).to.deep.equal({
                jsonrpc: "2.0",
                method: "test",
                id: 69
            });
        });
    
        it('Should return a valid object when constructed with params', () => {
            let req = new RPCRequest(69, "test", [1, 2, 3]);
            expect(req).to.deep.equal({
                jsonrpc: "2.0",
                method: "test",
                params: [1, 2, 3],
                id: 69
            });
        });
    });

    describe('isNotification', () => {
        it('Should return true when id is not provided', () => {
            let req = new RPCRequest(undefined, "test");
            expect(req.isNotification()).to.equal(true);
        });
    
        it('Should return true when id is null', () => {
            let req = new RPCRequest(null, "test");
            expect(req.isNotification()).to.equal(true);
        });
    
        it('Should return false when id is number', () => {
            let req = new RPCRequest(10, "test");
            expect(req.isNotification()).to.equal(false);
        });

        it('Should return false when id is string', () => {
            let req = new RPCRequest("test", "test");
            expect(req.isNotification()).to.equal(false);
        });
    });
});

describe('RPCResponseError', () => {
    describe('construct', () => {
        it('Should return a valid rpc response error object error when constructed', () => {
            let res = new RPCResponseError(69, {
                code: 123,
                message: "testing",
                data: {
                    test: true
                }
            });
    
            expect(res).to.deep.equal({
                jsonrpc: "2.0",
                id: 69,
                error: {
                    code: 123,
                    message: "testing",
                    data: {
                        test: true
                    }
                }
            });
        });

        it('Should initialise default values when constructed without params', () => {
            let res = new RPCResponseError(69, new RPCError());
    
            expect(res).to.deep.equal({
                jsonrpc: "2.0",
                id: 69,
                error: {
                    code: 0,
                    message: "",
                }
            });
        });
    });
});

describe('RPCResponseResult', () => {
    describe('construct', () => {
        it('Should return a valid rpc response result object when constructed', () => {
            let res = new RPCResponseResult(69, true);

            expect(res).to.deep.equal({
                jsonrpc: "2.0",
                id: 69,
                result: true
            });
        });
    });
});

describe('ParseRPCMessage', () => {
    it('Should return a RPCRequest when provided with a valid JSON RPC request object', () => {
        let request = '{"jsonrpc": "2.0", "method": "test", "params": [1, 2, 3], "id": 123}';

        expect(ParseRPCMessage(request)).to.deep.equal({
            jsonrpc: "2.0",
            method: "test",
            params: [1, 2, 3],
            id: 123
        });
    });

    it('Should return a RPCResponseResult when provided with a valid JSON RPC response result object', () => {
        let request = '{"jsonrpc": "2.0", "result": "success", "id": 69}';

        expect(ParseRPCMessage(request)).to.deep.equal({
            jsonrpc: "2.0",
            result: "success",
            id: 69
        });
    });

    it('Should return a RPCResponseError when provided with a valid JSON RPC response error object', () => {
        let request = '{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": 69}';

        expect(ParseRPCMessage(request)).to.deep.equal({
            jsonrpc: "2.0",
            error: {
                code: -32700,
                message: "Parse error"
            },
            id: 69
        });
    });

    it('Should return a RPCResponseError when provided with a valid JSON RPC response error object with data', () => {
        let request = '{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error", "data": "troll"}, "id": 69}';

        expect(ParseRPCMessage(request)).to.deep.equal({
            jsonrpc: "2.0",
            error: {
                code: -32700,
                message: "Parse error",
                data: "troll"
            },
            id: 69
        });
    });

    it('Should throw JSONParseError when invalid json is provided', () => {
        let request = '{"jsonrpc": "2.0"invalid, "method": "test", "params": [1, 2, 3], "id": 123}';

        expect(() => ParseRPCMessage(request)).to.throw(JSONParseError);
    });

    it('Should throw InvalidMessageError when jsonrpc field is wrong', () => {
        let request = '{"jsonrpc": "2.5", "result": "success", "id": 69}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidMessageError, 'wrong json rpc version');
    });

    it('Should throw InvalidMessageError when json object is of invalid JSON RPC type', () => {
        let request = '{"jsonrpc": "2.0", "id": 69}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidMessageError, 'unknown message type');
    });

    it('Should throw InvalidRequestError when method field is not string', () => {
        let request = '{"jsonrpc": "2.0", "method": 15, "id": 123}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidRequestError, 'method is not a string');
    });

    it('Should throw InvalidResponseError when id field is missing', () => {
        let request = '{"jsonrpc": "2.0", "result": "15"}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidResponseError, 'id not found');
    });

    it('Should throw InvalidResponseError when error code field is not a number', () => {
        let request = '{"jsonrpc": "2.0", "error": {"code": "test", "message": "msg"}}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidResponseError, 'error code is not a number');
    });

    it('Should throw InvalidResponseError when error message field is not string', () => {
        let request = '{"jsonrpc": "2.0", "error": {"code": 20, "message": 15}}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidResponseError, 'error message is not a string');
    });
});

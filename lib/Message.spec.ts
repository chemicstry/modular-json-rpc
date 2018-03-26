import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
    RPCMessage,
    RPCError,
    RPCRequest,
    RPCResponse,
    JSONParseError,
    InvalidMessageError,
    InvalidRequestError,
    InvalidResponseError,
    ParseRPCMessage
} from './Message';

describe('RPCRequest', () => {
    it('Should construct a valid object without params', () => {
        let req = new RPCRequest(69, "test");
        expect(req).to.deep.equal({
            jsonrpc: "2.0",
            method: "test",
            id: 69
        });
    });

    it('Should construct a valid object with params', () => {
        let req = new RPCRequest(69, "test", [1, 2, 3]);
        expect(req).to.deep.equal({
            jsonrpc: "2.0",
            method: "test",
            params: [1, 2, 3],
            id: 69
        });
    });

    it('Should correctly identify notification without id', () => {
        let req = new RPCRequest(undefined, "test");
        expect(req.isNotification()).to.equal(true);
    });

    it('Should correctly identify notification with null id', () => {
        let req = new RPCRequest(null, "test");
        expect(req.isNotification()).to.equal(true);
    });

    it('Should correctly identify a non notification', () => {
        let req = new RPCRequest(10, "test");
        expect(req.isNotification()).to.equal(false);
    });
});

describe('RPCResponse', () => {
    it('Should correctly encode RPCResponse with error', () => {
        let res = new RPCResponse(10, undefined, {
            code: -32601,
            message: 'Method not found'
        });

        expect(res).to.deep.equal({
            jsonrpc: "2.0",
            error: {
                code: -32601,
                message: 'Method not found'
            },
            id: 10
        });
    });

    it('Should correctly encode RPCResponse with result', () => {
        let res = new RPCResponse(10, true);

        expect(res).to.deep.equal({
            jsonrpc: "2.0",
            result: true,
            id: 10
        });
    });

    it('Should throw on coexisting result and error', () => {
        let test = () => new RPCResponse(10, true, {
            code: -32601,
            message: 'Method not found'
        });

        expect(test).to.throw(Error, "Result and error can not coexist in RPCResponse");
    });

    it('Should throw on nonexisting result and error', () => {
        let test = () => new RPCResponse(10);

        expect(test).to.throw(Error, "Result or error must exist in RPCResponse");
    });
});

describe('ParseRPCMessage', () => {
    it('Should correcly parse valid request object', () => {
        let request = '{"jsonrpc": "2.0", "method": "test", "params": [1, 2, 3], "id": 123}';

        expect(ParseRPCMessage(request)).to.deep.equal({
            jsonrpc: "2.0",
            method: "test",
            params: [1, 2, 3],
            id: 123
        });
    });

    it('Should correcly parse valid response success object', () => {
        let request = '{"jsonrpc": "2.0", "result": "success", "id": 69}';

        expect(ParseRPCMessage(request)).to.deep.equal({
            jsonrpc: "2.0",
            result: "success",
            id: 69
        });
    });

    it('Should correcly parse valid response error object', () => {
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

    it('Should correcly parse valid response error with data object', () => {
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

    it('Should throw JSONParseError on invalid json', () => {
        let request = '{"jsonrpc": "2.0"invalid, "method": "test", "params": [1, 2, 3], "id": 123}';

        expect(() => ParseRPCMessage(request)).to.throw(JSONParseError);
    });

    it('Should throw InvalidMessageError on wrong jsonrpc field', () => {
        let request = '{"jsonrpc": "2.5", "result": "success", "id": 69}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidMessageError, 'wrong json rpc version');
    });

    it('Should throw InvalidMessageError on invalid JSON-RPC type', () => {
        let request = '{"jsonrpc": "2.0", "id": 69}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidMessageError, 'unknown message type');
    });

    it('Should throw InvalidRequestError on wrong method field', () => {
        let request = '{"jsonrpc": "2.0", "method": 15, "id": 123}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidRequestError, 'method is not a string');
    });

    it('Should throw InvalidRequestError on wrong method field', () => {
        let request = '{"jsonrpc": "2.0", "method": 15, "id": 123}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidRequestError, 'method is not a string');
    });

    it('Should throw InvalidResponseError on missing id field', () => {
        let request = '{"jsonrpc": "2.0", "result": "15"}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidResponseError, 'id not found');
    });

    it('Should throw InvalidResponseError on wrong error code field', () => {
        let request = '{"jsonrpc": "2.0", "error": {"code": "test", "message": "msg"}}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidResponseError, 'error code is not a number');
    });

    it('Should throw InvalidResponseError on wrong error message field', () => {
        let request = '{"jsonrpc": "2.0", "error": {"code": 20, "message": 15}}';

        expect(() => ParseRPCMessage(request)).to.throw(InvalidResponseError, 'error message is not a string');
    });
});

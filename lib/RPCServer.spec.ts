import { describe, it } from 'mocha';
import { expect, assert } from 'chai';
import { TransportCb } from './Transport';
import { RPCServer } from './RPCServer';
import { RPCMethodError } from './Defines';

describe('RPCServer', () => {
    it('Should handle valid request when request has array params', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: 10,
                    result: 20
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // bind method
        server.bind("test", (a: number, b: number) => {
            return a + b;
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"method":"test","params":[5,15]}');
    });

    it('Should handle valid request when request has object params', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: 10,
                    result: 20
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // bind method
        server.bind("test", (data: any) => {
            return data.a + data.b;
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"method":"test","params":{"a":5,"b":15}}');
    });

    it('Should respond with method not found error when request method is not bound', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: 10,
                    error: {
                        code: -32601,
                        message: 'Method not found'
                    }
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"method":"test","params":{"a":5,"b":15}}');
    });

    it('Should not respond when handling notification', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: /* istanbul ignore next */ (data: string) => {
                // Fail here, should not be called
                assert.fail("Should not be called");
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // bind method
        server.bind("test", (data: any) => {
            return data.a + data.b;
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","method":"test","params":{"a":5,"b":15}}');

        expect(true).to.equal(true);
    });

    it('Should respond with error when handler throws RPCMethodError', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: 10,
                    error: {
                        code: 69,
                        message: 'This is an error',
                        data: {
                            test: true
                        }
                    }
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // bind method
        server.bind("test", (a: number, b: number) => {
            throw new RPCMethodError(69, "This is an error", {test: true});
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"method":"test","params":[5,15]}');
    });

    it('Should respond with internal server error when handler throws unknown error', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: 10,
                    error: {
                        code: -32603,
                        message: "Error: Generic error",
                    }
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // bind method
        server.bind("test", (a: number, b: number) => {
            throw new Error("Generic error");
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"method":"test","params":[5,15]}');
    });

    it('Should respond with parse error when message is invalid json', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32700,
                        message: "Parse error",
                    }
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // call rpc method
        downstreamcb('{"jsonrpc"broken:"2.0","id":10,"method":"test","params":[5,15]}');
    });

    it('Should respond with invalid request when message is invalid JSON RPC request object', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32600,
                        message: "Invalid Request",
                    }
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"params":[5,15]}');
    });

    it('Should respond with invalid request when message is JSON RPC response object', () => {
        let downstreamcb: any;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                // Parse json to avoid string comparison
                expect(JSON.parse(data)).to.deep.equal({
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32600,
                        message: "Invalid Request",
                    }
                });
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"result":true}');
    });
});

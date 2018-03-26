import { describe, it } from 'mocha';
import { expect, assert } from 'chai';
import { TransportCb } from './Transport';
import { RPCServer } from './RPCServer';
import { RPCMethodError } from './Defines';

describe('RPCServer', () => {
    it('Should handle valid request with array params', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should handle valid request with object params', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should respond with method not found error', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should not respond to notification', () => {
        let downstreamcb: TransportCb = (data: string) => {};

        let called = false;

        // Setup RPCServer with dummy transport
        let server = new RPCServer({
            SendUpstream: (data: string) => {
                called = true;
            },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // bind method
        server.bind("test", (data: any) => {
            return data.a + data.b;
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","method":"test","params":{"a":5,"b":15}}');

        expect(called).to.equal(false);
    });

    it('Should respond with thrown instance of RPCMethodError', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should respond with internal server error due to invalid throw', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should respond with parse error due to invalid message', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should respond with invalid request due to invalid request object', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

    it('Should respond with invalid request when response object is sent', () => {
        let downstreamcb: TransportCb = (data: string) => {};

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

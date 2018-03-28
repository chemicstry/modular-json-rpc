import { describe, it } from 'mocha';
import { expect, assert } from 'chai';
import { TransportCb } from './Transport';
import { RPCClient } from './RPCClient';
import { RPCMethodError } from './Defines';

describe('RPCClient', () => {
    describe('notify', () => {
        it('Should send request without id when called', () => {
            let downstreamcb: any;
    
            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: (data: string) => {
                    // Parse json to avoid string comparison
                    expect(JSON.parse(data)).to.deep.equal({
                        jsonrpc: "2.0",
                        method: "test",
                        params: [1, 2, 3]
                    });
                },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });
    
            // Send notification
            client.notify("test", 1, 2, 3);
        });
    });

    describe('call', () => {
        it('Should return results when using call', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: (data: string) => {
                    // Imitate server response
                    downstreamcb(JSON.stringify({
                        jsonrpc: "2.0",
                        id: JSON.parse(data).id,
                        result: 10
                    }));
                },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            // call rpc method
            var res = await client.call("test", 1, 2);

            expect(res).to.equal(10);
        });

        it('Should throw error when error response is received', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: (data: string) => {
                    // Imitate server response
                    downstreamcb(JSON.stringify({
                        jsonrpc: "2.0",
                        id: JSON.parse(data).id,
                        error: {
                            code: 123,
                            message: "Testing"
                        }
                    }));
                },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            try {
                await client.call("test");
            } catch (e) {
                expect(e.code).to.equal(123);
                expect(e.message).to.equal("Testing");
            }
        });

        it('Should throw timeout error when no response from server is received', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: /* istanbul ignore next */ (data: string) => {
                    // Do nothing
                },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            // Reduce timeout to speed up tests
            client.requestTimeout = 10;

            try {
                await client.call("test");
            } catch (e) {
                expect(e.message).to.equal("Request timed out");
            }
        });
    });

    describe(`on('error')`, () => {
        it('Should emit error when non numeric response id is received', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: /* istanbul ignore next */ (data: string) => { },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            // Listen for errors
            client.on('error', (e) => {
                expect(e.message).to.equal("Response id is not a number");
            })

            // Send a forged server message
            downstreamcb(JSON.stringify({
                jsonrpc: "2.0",
                id: "test",
                result: true
            }));
        });

        it('Should emit error when non existing response id is received', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: /* istanbul ignore next */ (data: string) => { },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            // Listen for errors
            client.on('error', (e) => {
                expect(e.message).to.equal("Request with id 10 not found");
            })

            // Send a forged server message
            downstreamcb(JSON.stringify({
                jsonrpc: "2.0",
                id: 10,
                result: true
            }));
        });

        it('Should emit parse error when response is malformed', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: /* istanbul ignore next */ (data: string) => { },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            // Listen for errors
            client.on('error', (e) => {
                expect(e.message).to.equal("Message parse failed: Invalid Message: wrong json rpc version");
            })

            // Send a forged server message
            downstreamcb(JSON.stringify({
                jsonrpc: "2.999",
                id: 10,
                result: true
            }));
        });

        it('Should emit error when response type is not RPCResponse', async () => {
            let downstreamcb: any;

            // Setup RPCClient with dummy transport
            let client = new RPCClient({
                SendUpstream: /* istanbul ignore next */ (data: string) => { },
                SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
            });

            // Listen for errors
            client.on('error', (e) => {
                expect(e.message).to.equal("Received message of non RPCResponse type");
            })

            // Send a forged server message
            downstreamcb(JSON.stringify({
                jsonrpc: "2.0",
                method: "test"
            }));
        });
    });
});

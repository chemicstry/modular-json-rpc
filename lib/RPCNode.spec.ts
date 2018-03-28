import { describe, it } from 'mocha';
import { expect, assert } from 'chai';
import { TransportCb } from './Transport';
import { RPCNode } from './RPCNode';
import { RPCMethodError } from './Defines';

describe('RPCClient', () => {
    it('Should work as RPCClient when using call', async () => {
        let downstreamcb: any;

        // Setup RPCNode with dummy transport
        let node = new RPCNode({
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
        var res = await node.call("test", 1, 2);

        expect(res).to.equal(10);
    });

    it('Should work as RPCServer when request is received', () => {
        let downstreamcb: any;

        // Setup RPCNode with dummy transport
        let node = new RPCNode({
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
        node.bind("test", (a: number, b: number) => {
            return a + b;
        });

        // call rpc method
        downstreamcb('{"jsonrpc":"2.0","id":10,"method":"test","params":[5,15]}');
    });

    it('Should emit parse error when response is malformed', async () => {
        let downstreamcb: any;

        // Setup RPCNode with dummy transport
        let node = new RPCNode({
            SendUpstream: (data: string) => { },
            SetDownstreamCb: (cb: TransportCb) => downstreamcb = cb
        });

        // Listen for errors
        node.on('error', (e) => {
            expect(e.message).to.equal("Message parse failed: Invalid Message: wrong json rpc version");
        })

        // Send a forged server message
        downstreamcb(JSON.stringify({
            jsonrpc: "2.999",
            id: 10,
            result: true
        }));
    });
});
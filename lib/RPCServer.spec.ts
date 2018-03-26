import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TransportCb } from './Transport';
import { RPCServer } from './RPCServer';

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
});

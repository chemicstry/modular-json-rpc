declare type TransportCb = (data: string) => void;

interface Transport
{
    SendUpstream(data: string): void;
    SetDownstreamCb(cb: TransportCb): void;
}

export {
    TransportCb,
    Transport
}

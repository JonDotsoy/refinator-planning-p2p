import { createContext, createElement, FC, useContext, useEffect, useMemo, useState } from "react";
import { ArgsType } from "./ArgsType";
import { asNotUndefined } from "./as";
import { PeerConnectionUtil } from "./peer-connection-util";
import { PeerConnectionListUtil } from "./PeerConnectionListUtil";

type EventsMap = { [k: string]: (...args: any) => void };
type AddListener<T extends EventsMap, K extends keyof T> = (eventName: K, listener: (...args: ArgsType<T[K]>) => void) => void;

export const PeerConnectionListContext = createContext<{ peerConnectionListUtil: PeerConnectionListUtil } | undefined>(undefined);

export const PeerConnectionListProvider: FC<{ peerId: string, roomId: string, peerConnections?: PeerConnectionUtil[] }> = ({ peerId, roomId, peerConnections, children }) => {
    const [refPeerConnectionListUtil, setRefPeerConnectionListUtil] = useState<{ v: number, peerConnectionListUtil: PeerConnectionListUtil }>();

    useEffect(() => {
        // console.log('mount')
        // const peerConnectionListUtil = new PeerConnectionListUtil(roomId, peerId)

        // // @ts-ignore
        // globalThis.peerConnectionListUtil = peerConnectionListUtil;

        // const handler = () => {
        //     setRefPeerConnectionListUtil((o) => ({ v: (o?.v ?? 0) + 1, peerConnectionListUtil }));
        // }

        // peerConnectionListUtil.on('changes', handler)
        // peerConnectionListUtil.on('close', () => {
        //     createAlertLog('Rooms is closed')
        // })

        // return () => {
        //     console.log('unmount')
        //     peerConnectionListUtil.close();
        //     peerConnectionListUtil.off('changes', handler)
        // }
    }, [peerId, roomId]);

    if (!refPeerConnectionListUtil?.peerConnectionListUtil) {
        return null;
    }

    return createElement(
        PeerConnectionListContext.Provider,
        { value: refPeerConnectionListUtil },
        children,
    );
};

export const usePeerConnections = () => asNotUndefined(useContext(PeerConnectionListContext));

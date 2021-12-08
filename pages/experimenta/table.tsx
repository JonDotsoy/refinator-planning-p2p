import { useRouter } from "next/dist/client/router";
import React, { FC, useEffect } from "react";
import { v4 as randomUUID } from 'uuid';
import { PeerConnectionListProvider, usePeerConnections } from "../../components/peer-connections-util-list";
import { InspectPre } from "../../components/Inspect";
import { createAlertLog } from "../../components/alert-logs";
import { Button } from "../../components/atoms/button";
import { PeerConnectionListUtil } from "../../components/PeerConnectionListUtil";


process.nextTick(() => {
    // @ts-ignore
    globalThis.peerConnectionListUtil = globalThis.peerConnectionListUtil ?? [];

    const createLocalRoom = (name: string) => {
        const peerConnectionListUtil = new PeerConnectionListUtil('demo-room', name);

        // @ts-ignore
        globalThis.peerConnectionListUtil.push(peerConnectionListUtil);
    }

    createLocalRoom('demo-room-1');
    // createLocalRoom('demo-room-2');
})

const useQueryString = (k: string, initValue = () => `${randomUUID()}`) => {
    const router = useRouter();
    const queryRoomId = router.query[k]
    const queryValue = typeof queryRoomId === 'string' ? queryRoomId : undefined;

    useEffect(() => {
        if (router.isReady && !queryValue && globalThis.location) {
            const u = new URL(globalThis.location.href)

            u.searchParams.set(k, initValue());

            process.nextTick(() => {
                globalThis.location.href = u.href;
            });
        }
    }, [router.isReady])

    return queryValue;
}


const TableContent: FC<{}> = ({ }) => {
    function copyRoom() {
        const u = new URL(globalThis.location.href)
        u.searchParams.delete('i');
        navigator.clipboard.writeText(u.href);
        createAlertLog('Copied to clipboard the room link.');
    }

    return <>
        <Button onClick={copyRoom}>Copy Room</Button>
    </>
}


const TablePage: FC = () => {
    const peerId = useQueryString('i')
    const roomId = useQueryString('room-id', () => `${Date.now()}-${randomUUID()}`)

    if (!roomId || !peerId) return <>loading...</>

    return <div className="md:px-20 md:py-5">
        <TableContent />
    </div>

    // return <PeerConnectionListProvider peerId={peerId} roomId={roomId}>
    //     <div className="md:px-20 md:py-5">
    //         <TableContent />
    //     </div>
    // </PeerConnectionListProvider>
}


export default TablePage;

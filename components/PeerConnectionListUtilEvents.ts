import { PeerConnectionUtil } from "./peer-connection-util";

export interface PeerConnectionListUtilEvents {
    peerConnectionAdded: (peerConnectionUtil: PeerConnectionUtil) => void;
    peerConnectionRemoved: (peerConnectionUtil: PeerConnectionUtil) => void;
    changes: () => void;
    error: (error: any) => void;
    close: () => void;
    updateEntry: () => void;
}

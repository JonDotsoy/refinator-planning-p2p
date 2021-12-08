import { doc, DocumentData, DocumentReference, DocumentSnapshot, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { Event } from "./Event";
import { firestore } from "./firebase/firebase";
import { PeerConnectionUtil } from "./peer-connection-util";
import { PeerConnectionListUtilEvents } from "./PeerConnectionListUtilEvents";
import { initCallback, generatorByEvents } from '@jondotsoy/generators-utils/lib/generator-by-events';

async function* onChangesFirestoreEntry(docRef: DocumentReference<DocumentData>) {
    const doc = await getDoc(docRef);

    if (!doc.exists()) {
        await setDoc(docRef, {});
    }

    const init: initCallback<DocumentSnapshot<DocumentData>> = (ctrl) => {
        onSnapshot(
            docRef,
            snap => ctrl.push(snap),
            error => ctrl.error(error),
            () => ctrl.done(),
        );
    }

    for await (const entry of generatorByEvents(init)) {
        yield entry;
    }
}

@CloseHandler()
export class PeerConnectionListUtil {
    private events = new Event<PeerConnectionListUtilEvents>();
    public peerConnections: { [k: string]: PeerConnectionUtil; } = {};
    entry: DocumentData | undefined;

    constructor(
        readonly roomId: string,
        readonly peerId: string
    ) {
        this.init().catch((e) => {
            const called = this.events.emit("error", e);
            if (!called) {
                console.error(e);
            }
        });
    }

    async init() {
        const entryChangesGenerator = onChangesFirestoreEntry(doc(firestore, 'rooms', this.roomId));
        this.events.once("close", () => entryChangesGenerator.return());
        for await (const entry of entryChangesGenerator) {
            console.log("entry", entry);
        }
    }

    async close() {
        this.events.emit("close");
    }

    on = this.events.on;
    off = this.events.off;
}


function CloseHandler(): ClassDecorator {
    return (target) => {

    }
}

function InitHandler(): ClassDecorator {
    return (target) => {

    }
}



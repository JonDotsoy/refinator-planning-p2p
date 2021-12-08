import EventEmitter from 'events';
import { deleteDoc, deleteField, doc, DocumentData, DocumentReference, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { createAlertLog } from './alert-logs';
import { createIncrement } from './lib/create-increment';
import { firestore } from './firebase/firebase';
import { times } from './lib/times';

export class SignalingChannelFirestore {
    events = new EventEmitter();
    private messages: any[] = [];
    refEntry: DocumentReference<DocumentData>;
    status: 'connecting' | 'connected' | 'disconnected' = 'connecting';
    private initProcess: Promise<any>;

    constructor(
        readonly localPeerId: string,
        readonly remotePeerId: string,
        readonly requiereCleanEntry: boolean = false,
    ) {
        const hashEntry = [localPeerId, remotePeerId].join('::');

        this.refEntry = doc(firestore, 'signaling-channels', hashEntry);

        this.initProcess = this.init().catch(error => {
            createAlertLog(`Error SignalingChannelFirestore.init: ${error}`);
            console.error(error);
        });
    }

    async wait() {
        await this.initProcess;
    }

    async init() {
        const ref = this.refEntry;
        const doc = await getDoc(ref);

        if (!doc.exists()) {
            await setDoc(ref, {});
        }

        onSnapshot(ref, snapshot => {
            this.events.emit('changes', snapshot.data());
        });
    }

    async waitChangeField(field: string) {
        return await new Promise(resolve => {
            const handler = (event: any) => {
                if (typeof event === 'object' && event !== null && event.hasOwnProperty(field)) {
                    resolve(event[field]);
                    this.events.removeListener('changes', handler);
                }
            }

            this.events.on('changes', handler);
        });
    }

    hashesMap = new Map<string, Set<string>>();

    getHashes(name: string) {
        const hashes = this.hashesMap.get(name);
        if (hashes) return hashes;
        const newHashes = new Set<string>();
        this.hashesMap.set(name, newHashes);
        return newHashes;
    }

    onChangeField(field: string, type: 'increment-map' | 'map', listener: (value: any) => void) {
        const handler = (event: any) => {
            if (typeof event === 'object' && event !== null && event.hasOwnProperty(field)) {
                if (type === 'map') {
                    listener(event[field]);
                    return
                }
                if (type === 'increment-map') {
                    const hashes = this.getHashes(field);
                    for (const [key, entry] of Object.entries(event[field])) {
                        if (entry !== null && !hashes.has(key)) {
                            hashes.add(key);
                            listener(entry);
                            this.update({ [`${field}.${key}`]: null });
                        }
                    }
                    return
                }
            }
        }

        this.events.on('changes', handler);

        return () => this.events.off('changes', handler);
    }

    async update(message: Record<string, any>) {
        await this.wait();
        await updateDoc(this.refEntry, JSON.parse(JSON.stringify(message)));
    }
}

import { DocumentReference, DocumentSnapshot, FirestoreError, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

export const onSnapshotBeforeCreateIfNotExist = <T>(reference: DocumentReference<T>, onNext: (snapshot: DocumentSnapshot<T>) => void, onError?: (error: FirestoreError) => void, onCompletion?: () => void) => {
    let closed = false;
    const unsubscribes: Function[] = [];

    const unsubscribe = () => {
        closed = true;
        unsubscribes.forEach(fn => fn());
    };

    const workload = async () => {
        if (closed)
            return;
        const entry = await getDoc(reference);

        if (!entry.exists()) {
            if (closed)
                return;
            await setDoc(reference, {});
        }

        const unsubscribe = onSnapshot(reference, onNext, onError, onCompletion);

        unsubscribes.push(unsubscribe);
    };

    workload().catch(e => {
        if (onError)
            onError(e);
        else
            console.error(e);
    });

    return unsubscribe;
};

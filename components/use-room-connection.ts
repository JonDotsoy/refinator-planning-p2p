import { arrayRemove, arrayUnion, deleteField, doc, DocumentData, DocumentReference, DocumentSnapshot, FieldPath, FirestoreError, getDoc, onSnapshot, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { firestore } from './firebase/firebase';
import { v4 as uuid } from 'uuid'
import { createAlertLog } from './alert-logs';
import once from 'lodash/once';
import { isIssue } from './is-issue';
import { Issue } from './types/issue';


const localUid = (() => {
    if (globalThis.localStorage) {
        const k = '__uid';
        const uid = localStorage.getItem(k);
        if (uid) return uid;
        const newUid = uuid();
        localStorage.setItem(k, newUid);
        return newUid;
    }
    return uuid();
})();

type ArgsType<T> = T extends (...args: infer U) => any ? U : never;
type FirstItem<T> = T extends any[] ? T[0] : never;
type LastItem<T> = T extends [...a: any, last: infer R] ? R : never;
type RT<T> = T extends (...args: any) => infer R ? R : never;
type FirstArgType<T> = FirstItem<ArgsType<T>>;
const pipe = <F extends (...args: any) => any, Fs extends F[]>(...fns: Fs) => (x: FirstArgType<FirstItem<Fs>>) => fns.reduce((v, f) => f(v), x) as RT<LastItem<Fs>>;
const pipeAsync = <F extends (...args: any) => Promise<any>, Fs extends F[]>(...fns: Fs) => (x: FirstArgType<FirstItem<Fs>>) => fns.reduce((v, f) => v.then(v => f(v)), Promise.resolve(x)) as RT<LastItem<Fs>>;

type A<T> = T extends (a: any, ...args: infer R) => any ? R : never;

const onSnapshotBeforeCreateIfNotExist = <T>(reference: DocumentReference<T>, onNext: (snapshot: DocumentSnapshot<T>) => void, onError?: (error: FirestoreError) => void, onCompletion?: () => void) => {
    let closed = false;
    const unsubscribes: Function[] = [];

    const unsubscribe = () => {
        closed = true;
        unsubscribes.forEach(fn => fn());
    }

    const workload = async () => {
        if (closed) return;
        const entry = await getDoc(reference);

        if (!entry.exists()) {
            if (closed) return;
            await setDoc(reference, {});
        }

        const unsubscribe = onSnapshot(reference, onNext, onError, onCompletion);

        unsubscribes.push(unsubscribe);
    }

    workload().catch(e => {
        if (onError) onError(e);
        else console.error(e);
    });

    return unsubscribe;
}


export const useRoomConnection = (roomId: string) => {
    const [tick, setTick] = useState(0);
    const [loading, setLoading] = useState(true);
    const docRef = doc(firestore, 'rooms', roomId);
    const [room, setRoom] = useState<DocumentData | null>(null);
    const [error, setError] = useState<any>(null);
    const identification = room?.participants?.[localUid];
    const loggedIn = !!identification;
    const identifications = Object
        .entries(room?.participants ?? {})
        .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        .map(([uid, entry]: [string, any]) => {
            const tActived = entry.lastPing ? ((Date.now() / 1000) - entry.lastPing.seconds) : 0;
            return ({
                uid,
                self: uid === localUid,
                activated: tActived < 10,
                observer: !!entry.observer,
                ...entry
            });
        })
        .filter(entry => entry.activated);

    const issueActivated = typeof room?.issue === 'string' ? room.issue : null;
    const issueValue = issueActivated ? room?.issuesValues[issueActivated] : null;
    const issue = isIssue(issueValue) ? issueValue : null;
    const issues = (room?.issues && Array.isArray(room.issues) ? room.issues : [])
        .map(issue => room?.issuesValues[issue])
        .filter((issue): issue is Issue => isIssue(issue))

    const onceTickLastPing = useMemo(() => once(() => tickLastPink()), [tick]);

    const update = (data: DocumentData) => {
        updateDoc(docRef, data)
            .catch(e => {
                console.error(e);
                createAlertLog(`Error updating room ${roomId}`);
            });
    }

    const updateField = (field: string | FieldPath, value: unknown) => {
        updateDoc(docRef, field, value)
            .catch(e => {
                console.error(e);
                createAlertLog(`Error updating room ${roomId}`);
            });
    }

    useEffect(() => {
        setLoading(true)
        const unsubscribe = onSnapshotBeforeCreateIfNotExist(
            docRef,
            (snapshot) => {
                onceTickLastPing();
                setLoading(false);
                setRoom(snapshot.data()!);
            },
            (error) => {
                setError(error);
            },
        );

        return () => {
            unsubscribe();
        }
    }, [roomId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(tick => tick + 1);
            if (loggedIn) {
                tickLastPink()
            }
        }, 5_000);

        return () => {
            clearInterval(interval);
        }
    }, [loggedIn])

    const tickLastPink = () => update({
        [`participants.${localUid}.lastPing`]: Timestamp.now(),
    });

    const logIn = (name: string) => {
        update({
            [`participants.${localUid}.name`]: name,
            [`participants.${localUid}.loggedAt`]: Timestamp.now(),
        });
    }

    const logOut = () => {
        update({
            [`participants.${localUid}`]: deleteField(),
        });
    }

    const toggleParticipating = () => {
        update({
            [`participants.${localUid}.observer`]: !identification?.observer,
        });
    }

    const createNewIssue = () => {
        const id = uuid();
        return update({
            [`issues`]: arrayUnion(id),
            [`issuesValues.${id}`]: {
                id,
                description: '',
            },
        });
    };

    const removeIssue = (item: any) => update({
        [`issues`]: arrayRemove(item),
    });

    const updateDescriptionIssue = (issue: Issue, description: string) => {
        update({
            [`issuesValues.${issue.id}.description`]: description,
        })
    }

    const selectIssue = (issue: Issue) => {
        update({
            [`issue`]: issue.id,
        });
    }

    const cleanSelectIssue = () => {
        update({
            [`issue`]: deleteField(),
        });
    }

    return {
        localUid,
        selectIssue,
        cleanSelectIssue,
        createNewIssue,
        removeIssue,
        updateDescriptionIssue,
        issueActivated,
        issue,
        issues,
        loggedIn: loggedIn,
        identification,
        identifications,
        loading,
        logIn: logIn,
        logOut,
        toggleParticipating,
        room,
        update,
    } as const;
}

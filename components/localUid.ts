import { setUserId } from 'firebase/analytics';
import { v4 as uuid } from 'uuid';
import { analytics } from './firebase/firebase';

export const getLocalUid = () => {
    if (globalThis.localStorage) {
        const k = '__uid';
        const uid = localStorage.getItem(k);
        if (uid)
            return uid;
        const newUid = uuid();
        localStorage.setItem(k, newUid);
        return newUid;
    }
    return uuid();
}

export const localUid = getLocalUid();

setUserId(analytics, localUid, { global: true });

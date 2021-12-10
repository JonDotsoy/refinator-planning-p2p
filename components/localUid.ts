import { v4 as uuid } from 'uuid';

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

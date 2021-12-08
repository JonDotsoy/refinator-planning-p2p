import { v4 } from 'uuid'

export function createIncrement() {
    let n = 0;
    return () => n++;
}

export function createIncrementHashes() {
    return () => v4();
}

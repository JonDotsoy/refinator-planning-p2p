import { StatusVoting } from './StatusVoting';

export const isStatusVoting = (val: any): val is StatusVoting => {
    if (typeof val !== 'object' || val === null) return false;
    if (typeof val.status !== 'string') return false;
    if (!['none', 'inVoting', 'done'].includes(val.status)) return false;
    return true;
};

import { Issue } from "./types/issue";

export const isIssue = (value: any): value is Issue => {
    if (typeof value !== 'object') return false;
    if (value === null) return false;
    if (typeof value.id !== 'string') return false;
    if (typeof value.description !== 'string') return false;
    if (value.level !== undefined && typeof value.level !== 'string') return false;
    if (value.voting !== undefined && typeof value.voting !== 'object') return false;
    return true
}

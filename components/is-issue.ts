import { Issue } from "./types/issue";

export const isIssue = (value: any): value is Issue => {
    if (typeof value !== 'object') return false;
    if (value === null) return false;
    if (typeof value.id !== 'string') return false;
    if (typeof value.description !== 'string') return false;
    return true
}

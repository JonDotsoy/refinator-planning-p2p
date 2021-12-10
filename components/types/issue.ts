export interface Issue {
    id: number;
    description: string;
    level?: string;
    voting?: {
        [k: string]: {
            value: string;
        };
    }
}

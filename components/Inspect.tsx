import { inspect } from "util";
import Ansi from 'ansi-to-react';
import { FC, useMemo } from "react";

export const Inspect: FC<{ src: any }> = ({ src }) => {
    const cmp = useMemo(() => <Ansi>{inspect(src, { colors: true, depth: null })}</Ansi>, [src]);

    return cmp;
}

export const InspectPre: FC<{ src: any }> = ({ src }) => {
    const cmp = useMemo(() => <Ansi>{inspect(src, { colors: true, depth: null })}</Ansi>, [src]);

    return <pre style={{
        padding: 10,
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        borderRadius: 5,
    }}><code>{cmp}</code></pre>;
}

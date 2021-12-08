import EventEmitter from "events";
import { FC, useEffect, useState } from "react";
import { asLog } from "./as";
import { Log } from "./Log";
import { v4 as randomUUID } from 'uuid'

const eventsLogs = new EventEmitter()

export const AlertLogs: FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const handler = (event: any) => {
            if (event['create-alert-log']) {
                const log = asLog(event['create-alert-log'])
                setLogs(logs => [...logs, log])
                setTimeout(()=> {
                    setLogs(logs => logs.filter(l => l.id !== log.id))
                }, log.timeout ?? 4_000)
            }
        }

        eventsLogs.on("create-alert-log", handler);

        return () => {
            eventsLogs.removeListener("create-alert-log", handler);
        }
    })

    return <div className="fixed right-0 space-y-2 bottom-0 pr-2 pb-2">
        {logs.map(log =>
            <div key={log.id} className="bg-gray-200 px-4 py-2 border-1 rounded min-w-min shadow-md border-gray-300 border">
                {log.text}
            </div >
        )}
    </div>
}

export const createAlertLog = (text: string, timeout: number = 5_500) => {
    const alertLog: Log = {
        id: randomUUID(),
        text: text,
        timeout,
    }
    eventsLogs.emit("create-alert-log", {
        'create-alert-log': alertLog
    })
}

// @ts-ignore
globalThis.createAlertLog = createAlertLog;

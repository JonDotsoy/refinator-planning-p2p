import { useRouter } from "next/dist/client/router";
import React, { FC, useEffect, useMemo, useState } from "react"
import { v4 as randomUUID } from "uuid";
import Link from 'next/link';
import EventEmitter from "events";
import { asLog, asRTCIceCandidateInit, assertRTCSessionDescriptionInit } from "../components/as";
import { Log } from "../components/Log";

const logsStore = new EventEmitter()

const LogComponent: FC = () => {
    const [logs, setLogs] = useState<Log[]>([])

    useEffect(() => {
        const handler = (entryLog: any) => {
            const log = asLog(entryLog)
            setLogs(logs => [...logs, log])
            setTimeout(log => setLogs(logs => logs.filter(entryLog => entryLog !== log)), 4_000, log);
        }
        logsStore.on('log', handler)
        return () => { logsStore.off('log', handler) }
    }, [])

    return <div style={{ position: 'absolute', right: 0, bottom: 0, padding: 10 }}>
        {logs.map(log => <div key={log.id} style={{ padding: '5px 8px', borderRadius: 5, border: 'solid 1px black', marginBottom: 4, minWidth: 600 }}>{log.text}</div>)}
    </div>
}

const pushLog = (log: Log) => {
    logsStore.emit('log', log)
}

class SignalingClipboard {
    private clipboard?: Clipboard;
    private events = new EventEmitter();
    private messages: any[] = [];

    constructor() {
        if (globalThis.navigator?.clipboard) {
            this.clipboard = globalThis.navigator.clipboard;
        }

        this.events.on('send-message', (message) => {
            this.messages.push(message);
        });
    }

    on = this.events.on.bind(this.events);
    emit = this.events.emit.bind(this.events);
    off = this.events.off.bind(this.events);
    addEventListener = this.events.addListener.bind(this.events);
    removeEventListener = this.events.removeListener.bind(this.events);

    send(payload: Record<string, any>) {
        this.emit('send-message', payload);
    }

    pasteMessage = async () => {
        if (this.clipboard) {
            const buf = await this.clipboard.readText();
            const payload = JSON.parse(buf);
            for (const message of payload) {
                this.events.emit('message', message);
                console.log('message', message);
            }
            pushLog({ id: randomUUID(), text: `Pasted ${payload.length} messages` })
        } else {
            pushLog({ id: randomUUID(), text: 'Clipboard is not supported' })
        }
    }

    copyMessages = async () => {
        if (this.clipboard) {
            const messages = this.messages;
            this.messages = [];
            await this.clipboard.writeText(JSON.stringify(messages));
            pushLog({ id: randomUUID(), text: `Copied ${messages.length} messages, and clean messages.` })
        } else {
            pushLog({ id: randomUUID(), text: 'Clipboard is not available' })
        }
    }
}


function useConnection(channelId?: string, queryOffer?: RTCSessionDescriptionInit, queryRemoteOffer?: RTCSessionDescriptionInit) {
    const signalingClipboard = useMemo(() => new SignalingClipboard(), [])

    const [state, setState] = useState<{
        peerConnection?: RTCPeerConnection;
        senderChannel?: RTCDataChannel;
        receiverChannel?: RTCDataChannel;
        offer?: RTCSessionDescriptionInit;
        remoteOffer?: RTCSessionDescriptionInit;
        candidates?: RTCIceCandidateInit[];
        calls: {
            peerConnection?: RTCPeerConnection;
            senderChannel?: RTCDataChannel;
            receiverChannel?: RTCDataChannel;
            offer?: RTCSessionDescriptionInit;
            remoteOffer?: RTCSessionDescriptionInit;
            candidates?: RTCIceCandidateInit[];
        }[];
    }>({
        calls: [],
    });

    useEffect(() => {
        if (globalThis.RTCPeerConnection) {
            const peerConnection = new RTCPeerConnection(servers);
            pushLog({ id: randomUUID(), text: 'Local Created peer connection' });
            const senderChannel = peerConnection.createDataChannel('sender');
            const receiverChannel = peerConnection.createDataChannel('receiver');
            setState(state => ({ ...state, peerConnection, senderChannel, receiverChannel }));
            signalingClipboard.on('message', async (message) => {
                if (message.offer) {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(assertRTCSessionDescriptionInit(message.offer)));
                    pushLog({ id: randomUUID(), text: 'Local Set remote description' });
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    pushLog({ id: randomUUID(), text: 'Local Set local description' });
                    signalingClipboard.send({ answer });
                }
            });
            peerConnection.addEventListener('icecandidate', event => {
                if (event.candidate) {
                    signalingClipboard.send({ 'new-ice-candidate': event.candidate });
                    pushLog({ id: randomUUID(), text: 'Local Send new ice candidate' });
                }
            });
            peerConnection.addEventListener('connectionstatechange', event => {
                pushLog({ id: randomUUID(), text: `Local peer connection state changed to ${peerConnection.connectionState}` });
            });

        }
    }, [])

    if (!channelId || !globalThis.RTCPeerConnection) {
        return [
            new Error('Not supported'),
        ] as const;
    }

    const servers: RTCConfiguration = {
        'iceServers': [{
            urls: [
                'stun:stun.l.google.com:19302',
            ]
        }]
    };

    const createPeerConnection = async () => {
        const peerConnection = new RTCPeerConnection(servers);
        pushLog({ id: randomUUID(), text: 'Created peer connection' });

        peerConnection.addEventListener('connectionstatechange', event => {
            pushLog({ id: randomUUID(), text: `Local peer connection state changed to ${peerConnection.connectionState}` });
        });

        const senderChannel = peerConnection.createDataChannel('sender');
        const receiverChannel = peerConnection.createDataChannel('receiver');

        signalingClipboard.addEventListener('message', async (event) => {
            console.log('message', event);
            if (event.answer) {
                await peerConnection.setRemoteDescription(assertRTCSessionDescriptionInit(event.answer));
            }
            if (event['new-ice-candidate']) {
                await peerConnection.addIceCandidate(asRTCIceCandidateInit(event['new-ice-candidate']));
            }
        });

        const offer = await peerConnection.createOffer();
        pushLog({ id: randomUUID(), text: 'Created offer' });
        await peerConnection.setLocalDescription(offer);
        pushLog({ id: randomUUID(), text: 'Set local description' });

        signalingClipboard.send({ offer });

        setState(state => ({
            ...state,
            calls: [
                ...state.calls,
                {
                    peerConnection,
                    offer,
                    senderChannel,
                    receiverChannel,
                },
            ]
        }))
    }

    const attachRemoteOffer = async () => {
    }

    const attachCandidates = async () => {
    }

    return [
        null,
        channelId,
        state,
        {
            signalingClipboard,
            createPeerConnection,
            attachRemoteOffer,
            attachCandidates,
        },
    ] as const;
}

function toURLWithQuery(query: Record<string, string>) {
    const url = new URL('', location.href)

    Object.entries(query).forEach(([key, value]) => {
        url.searchParams.set(key, value)
    })

    return url;
}

function useRTCSessionDescriptionByQuery(queryName: string) {
    const router = useRouter()
    const queryValue = router.query[queryName]
    return useMemo(() => typeof queryValue === 'string' ? new RTCSessionDescription(JSON.parse(queryValue)) : undefined, [queryValue])
}

export const IndexPage: FC = () => {
    const router = useRouter()
    const connId = typeof router.query.connid === 'string' ? router.query.connid : undefined

    const [err, uuid, state, conn] = useConnection(connId);

    // @ts-ignore
    globalThis.conn = state;

    useEffect(() => {
        if (router.isReady && typeof router.query.connid !== 'string') {
            router.push(`?connid=refinator-planning-${randomUUID()}`)
        }
    }, [router])

    useEffect(() => {
    }, [conn])

    return <div>
        <div>UUID {">"} {uuid}</div>

        <div>
            <h3>Form</h3>
            <button onClick={conn?.createPeerConnection}>Create Peer Connection</button>
            <button onClick={conn?.signalingClipboard.pasteMessage}>Paste message</button>
            <button onClick={conn?.signalingClipboard.copyMessages}>Copy messages</button>
        </div>

        <div>
            {err && <pre><code>{JSON.stringify(err, null, 2)}</code></pre>}

            {state?.candidates && <>
                <h3>Candidates</h3>
                {state.candidates.map((candidate, index) => <pre key={index}><code>{JSON.stringify(candidate, null, 2)}</code></pre>)}
            </>}

            {state && <>
                <h3>State</h3>
                <pre><code>{JSON.stringify(state, null, 2)}</code></pre>
            </>}

            {state?.offer && <>
                <h3>Offer</h3>
                <pre><code>{state.offer.sdp}</code></pre>
            </>}

            {uuid && state?.remoteOffer && <>
                <h3>Remote Offer</h3>
                <pre><code>{state.remoteOffer.sdp}</code></pre>
            </>}
        </div>
        <LogComponent />
    </div>
}

const $IndexPage = () => null;

export default $IndexPage

import { createAlertLog } from './alert-logs';
import { assertRTCSessionDescriptionInit } from './as';
import { Event } from './Event'
import { createIncrement, createIncrementHashes } from './lib/create-increment';
import { SignalingChannelFirestore } from './signaling-channel-firestore';


function isRTCSessionDescriptionInit(value: any): value is Required<RTCSessionDescriptionInit> {
    if (typeof value !== 'object' || value === null) return false;
    if (typeof value.type !== 'string') return false;
    if (typeof value.sdp !== 'string') return false;
    return true;
}

function isRTCIceCandidateInit(value: any): value is Required<RTCIceCandidateInit> {
    if (typeof value !== 'object' || value === null) return false;
    if (typeof value.candidate !== 'string') return false;
    if (typeof value.sdpMid !== 'string') return false;
    if (typeof value.sdpMLineIndex !== 'number') return false;
    return true;
}


const configuration = {
    'iceServers': [
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
}

interface PeerConnectionUtilEvents {

}

export class PeerConnectionUtil {
    private events = new Event<PeerConnectionUtilEvents>();

    private localSignalingChannelFirestore: SignalingChannelFirestore;
    private remoteSignalingChannelFirestore: SignalingChannelFirestore;

    readonly peerConnections: RTCPeerConnection[] = [];
    dataChannels: RTCDataChannel[] = [];

    constructor(
        readonly localPeerId: string,
        readonly remotePeerId: string,
    ) {
        this.localSignalingChannelFirestore = new SignalingChannelFirestore(remotePeerId, localPeerId, true);
        this.remoteSignalingChannelFirestore = new SignalingChannelFirestore(localPeerId, remotePeerId);

        this.init().catch(error => {
            createAlertLog(`Error PeerConnectionUtil.init: ${error}`);
            console.error(error);
        });
    }

    message(message: string) {
        const increment = createIncrement()
        this.dataChannels.forEach(dataChannel => {
            if (dataChannel.readyState === 'open') {
                increment()
                dataChannel.send(Buffer.from(message));
            }
        });
        return increment()
    }

    async init() {
        // this.localSignalingChannelFirestore.onChangeField('offers', 'increment-map', (remoteOffers) => {
        //     if (isRTCSessionDescriptionInit(remoteOffers)) {
        //         console.log('remoteOffers', remoteOffers);
        //         this.createRemotePeerConnection(remoteOffers);
        //     }
        // });
        const pc = await this.createLocalPeerConnection();

        pc.addEventListener('connectionstatechange', event => {
            console.log('pc.connectionState event: connectionstatechange', event);
        })

        pc.addEventListener('iceconnectionstatechange', event => {
            console.log('pc.connectionState event: iceconnectionstatechange', event);
        })
    }

    async createDataChannel(peerConnection: RTCPeerConnection) {
        const dataChannel = peerConnection.createDataChannel('data-channel', {});

        dataChannel.onopen = () => {
            this.dataChannels.push(dataChannel);
            console.log('dataChannel.open');
        }

        dataChannel.onclose = () => {
            this.dataChannels = this.dataChannels.filter(dataChannel => dataChannel !== dataChannel);
            console.log('dataChannel.close');
        }

        dataChannel.onerror = (error) => {
            console.error(error);
        }

        dataChannel.onmessage = (event) => {
            console.log('💬 dataChannel.message:', event.data);
            createAlertLog(`dataChannel.message: ${event.data}`);
        }

        return dataChannel;
    }

    async createPeerConnection() {
        const peerConnection = new RTCPeerConnection(configuration);

        this.peerConnections.push(peerConnection);

        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                console.log('PeerConnectionUtil.init: connected');
            }
        });

        peerConnection.addEventListener('icecandidate', async event => {
            if (event.candidate) {
                try {
                    await this.remoteSignalingChannelFirestore.update({ [`ice-candidates.${this.incrementIceCandidates()}`]: event.candidate });
                } catch (error) {
                    console.error(error);
                }
            }
        });

        this.localSignalingChannelFirestore.onChangeField('ice-candidates', 'increment-map', async (iceCandidate) => {
            if (isRTCIceCandidateInit(iceCandidate)) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
                } catch (ex) {
                    console.error(ex);
                }
            }
        });

        this.localSignalingChannelFirestore.onChangeField('offers', 'increment-map', (remoteOffers) => {
            if (isRTCSessionDescriptionInit(remoteOffers)) {
                console.log('remoteOffers', remoteOffers);
                this.createRemotePeerConnection(remoteOffers);
            }
        });

        return peerConnection
    }

    async createRemotePeerConnection(offer: RTCSessionDescriptionInit) {
        const peerConnection = await this.createPeerConnection()
        const dataChannel = this.createDataChannel(peerConnection);

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer);
            await this.remoteSignalingChannelFirestore.update({ [`answers.${this.incrementAnswers()}`]: answer });
        } catch (error) {
            console.error(error);
            createAlertLog(`Error PeerConnectionUtil.createRemotePeerConnection: ${error}`);
        }
    }

    async createLocalPeerConnection() {
        const peerConnection = await this.createPeerConnection()
        const dataChannel = await this.createDataChannel(peerConnection);

        // @ts-ignore
        globalThis.peerConnection = peerConnection
        // @ts-ignore
        globalThis.dataChannel = dataChannel

        this.localSignalingChannelFirestore.onChangeField('answers', 'increment-map', (remoteAnswer) => {
            if (isRTCSessionDescriptionInit(remoteAnswer)) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(remoteAnswer));
            }
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await this.remoteSignalingChannelFirestore.update({ [`offers.${this.incrementOffers()}`]: offer });

        return peerConnection;
    }

    incrementOffers = createIncrementHashes();
    incrementAnswers = createIncrementHashes();
    incrementIceCandidates = createIncrementHashes();

    on = this.events.on;
    off = this.events.off;
}

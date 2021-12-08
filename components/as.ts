import { Log } from "./Log";
import ow from 'ow';

export const asPeerConnections = (value:any) => {
    ow(value, ow.object);
    return value;
}

export const asNotUndefined = <T>(value: T) => {
    function assertNotUndefined<T>(value: T): asserts value is NonNullable<T> {
        if (value === undefined) {
            throw new Error("Value is undefined");
        }
        if (value === null) {
            throw new Error("Value is null");
        }
    }

    assertNotUndefined(value);
    return value;
}

export const asString = (value: any) => {
    function assertString(value: any): asserts value is string {
        if (typeof value !== "string") {
            throw new TypeError("Expected a string");
        }
    }
    assertString(value);
    return value;
}

export const asLog = (value: any) => {
    function evalAssertLog(value: any): asserts value is Log {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Expected object');
        }
        if (typeof value.id !== 'string') {
            throw new Error('Expected "id"');
        }
        if (typeof value.text !== 'string') {
            throw new Error('Expected "text"');
        }
        if ('timeout' in value && typeof value.timeout !== 'number') {
            throw new Error('Expected "timeout"');
        }
    }

    evalAssertLog(value);
    return value;
};


export const asArray = (value: any) => {
    if (!Array.isArray(value)) {
        throw new Error('Expected array');
    }
    return value;
}



export const asRTCIceCandidateInit = (value: any) => {
    function evalAssertRTCIceCandidateInit(value: any): asserts value is RTCIceCandidateInit {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Expected object');
        }
        if ('candidate' in value && typeof value.candidate !== 'string') {
            throw new Error('Expected "candidate"');
        }
        if ('sdpMid' in value && typeof value.sdpMid !== 'string') {
            throw new Error('Expected "sdpMid"');
        }
        if ('sdpMLineIndex' in value && typeof value.sdpMLineIndex !== 'number') {
            throw new Error('Expected "sdpMLineIndex"');
        }
        if ('usernameFragment' in value && typeof value.usernameFragment !== 'string') {
            throw new Error('Expected "usernameFragment"');
        }
    }
    evalAssertRTCIceCandidateInit(value);
    return value;
}



export const assertRTCSessionDescriptionInit = (value: any) => {
    function evalAssertRTCSessionDescriptionInit(value: any): asserts value is RTCSessionDescriptionInit {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Expected object');
        }
        if ('type' in value && typeof value.type !== 'string') {
            throw new Error('Expected "type"');
        }
        if ('sdp' in value && typeof value.sdp !== 'string') {
            throw new Error('Expected "sdp"');
        }
    }
    evalAssertRTCSessionDescriptionInit(value);
    return value;
}
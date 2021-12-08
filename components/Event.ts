import EventEmitter from "events";
import { ArgsType } from "./ArgsType";

export class Event<T> {
    private events = new EventEmitter();

    on = <K extends keyof T>(eventName: K, listener: (...args: ArgsType<T[K]>) => void) => {
        // @ts-ignore
        return this.events.on(eventName, listener);
    };
    once = <K extends keyof T>(eventName: K, listener: (...args: ArgsType<T[K]>) => void) => {
        // @ts-ignore
        return this.events.on(eventName, listener);
    };
    off = <K extends keyof T>(eventName: K, listener: (...args: ArgsType<T[K]>) => void) => {
        // @ts-ignore
        return this.events.off(eventName, listener);
    };
    emit = <K extends keyof T>(eventName: K, ...args: ArgsType<T[K]>) => {
        // @ts-ignore
        return this.events.emit(eventName, ...args);
    };
    emitWithChange = <K extends keyof T>(eventName: K, ...args: ArgsType<T[K]>) => {
        // @ts-ignore
        const called = this.events.emit(eventName, ...args);
        this.events.emit('changes');
        return called;
    };

}

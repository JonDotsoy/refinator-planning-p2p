import { createIncrement } from "./create-increment";

export async function* times() {
    const increment = createIncrement()
    while (true) {
        yield increment();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

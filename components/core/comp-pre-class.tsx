import { createElement } from "react";

type ArgsType<T> = T extends (...args: infer U) => any ? U : never;

export const compPreClassNames = (...args: ArgsType<typeof createElement>) => {
    const [input, props, ...more] = args;
    return createElement(input, props, ...more);
};

import { FC } from "react";
import { createAlertLog } from "./alert-logs";

interface IconCopyProps {
    value?: () => string
}

export const IconCopy: FC<IconCopyProps> = ({ value }) => {
    const copyHandler = () => {
        if (value && globalThis.navigator?.clipboard) {
            globalThis.navigator.clipboard.writeText(value());
            createAlertLog("Copied to clipboard");
        }
    }

    return <span className="cursor-pointer" onClick={copyHandler}>📋</span>
}

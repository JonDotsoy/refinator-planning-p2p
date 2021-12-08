import React, { DetailedHTMLProps, FC, HTMLAttributes, InputHTMLAttributes, RefObject } from "react"
import classNames from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    inputRef?: RefObject<HTMLInputElement>
}

export const Input: FC<InputProps> = ({ inputRef: tref, className, children, ...props }) => {
    return <input
        ref={tref}
        className={classNames(
            "border px-4 py-2 rounded ",
            className,
        )}
        {...props}
    />
}

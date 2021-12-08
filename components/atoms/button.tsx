import { ButtonHTMLAttributes, FC } from "react";
import classnames from 'classnames';

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...args }) => {
    return <button
        className={classnames(
            className,
            'border px-4 py-2 rounded',
            {
                "hover:bg-gray-100": !args.disabled,
                "cursor-default text-gray-300": args.disabled,
            }
        )}
        {...args}
    ></button>;
};

export const ButtonLg: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...args }) => {
    return <button
        className={classnames(
            className,
            'text-lg',
            'border px-4 py-2 rounded',
            'hover:bg-gray-100',
        )}
        {...args}
    ></button>;
};

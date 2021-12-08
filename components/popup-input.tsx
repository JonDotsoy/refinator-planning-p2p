import { ButtonHTMLAttributes, FC, MouseEvent, ReactElement, ReactNode, useRef, useState } from "react";
import { Button } from "./atoms/button";
import { Input } from "./atoms/input";

interface PopupInputProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    onValueChange?: (value: string) => void;
    buttonLogged?: (opts: { handlerOpen: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void }) => ReactNode;
}

export const PopupInput: FC<PopupInputProps> = ({ onValueChange, buttonLogged, onClick, ...props }) => {
    const inputValueRef = useRef<HTMLInputElement>(null);
    const [actived, setActived] = useState(false);

    const handlerOpen = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        setActived(true);
        onClick?.(e);
    }

    const handlerClick = () => {
        setActived(false)
        if (!inputValueRef.current) {
            console.warn("inputValueRef is null");
            return;
        };
        onValueChange?.(inputValueRef.current.value);
    }

    return (
        <>
            {actived &&
                <div className="top-0 left-0 fixed w-screen h-screen bg-gray-800 bg-opacity-20 justify-center items-center flex">
                    <div className="p-4 bg-white rounded shadow-md">
                        <div className="text-md">Ingresa tu nick:</div>
                        <Input inputRef={inputValueRef} ></Input>
                        <Button onClick={handlerClick}>Continuar</Button>
                    </div>
                </div>
            }
            {buttonLogged && buttonLogged({ handlerOpen })}
            {!buttonLogged && <Button {...props} onClick={handlerOpen}></Button>}
        </>
    );
}

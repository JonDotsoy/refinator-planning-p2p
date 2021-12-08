import { createContext, FC, useContext } from "react";
import { asString } from "./as";

export const PeerIdContext = createContext<string | undefined>(undefined);

export const PeerIdProvider: FC<{ peerId: string }> = ({ peerId, children }) => <PeerIdContext.Provider value={peerId}>{children}</PeerIdContext.Provider>;
export const usePeerId = () => asString(useContext(PeerIdContext));


import { useRouter } from "next/dist/client/router";
import React, { FC } from "react";
import { Button, ButtonLg } from "../components/atoms/button";
import { useQueryParams } from "../components/use-query-params";
import { v4 as uuid } from 'uuid'
import { RoomConnection } from "../components/room-connection";
import { useRoomId } from "../components/use-room-id";


const TablePage: FC = () => {
    const router = useRouter()
    const [roomId, setRoomId] = useRoomId();

    if (!router.isReady) return <>Loading...</>

    if (!roomId) return <div className="flex justify-center items-center h-screen">
        <div>
            <ButtonLg onClick={() => setRoomId(uuid())}>Crea nueva sala</ButtonLg>
        </div>
    </div>

    return <RoomConnection roomId={roomId} />
}

export default TablePage;

import { useQueryParams } from "./use-query-params"

export const useRoomId = () => {
    const [queryRoomId, setQueryRoomId] = useQueryParams('room-id')
    const roomId = typeof queryRoomId === 'string' ? queryRoomId : null

    return [roomId, setQueryRoomId] as const;
}
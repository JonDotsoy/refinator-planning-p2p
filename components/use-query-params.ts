import { useRouter } from "next/dist/client/router";

export const useQueryParams = (queryName: string) => {
    const router = useRouter()
    const queryRoomId = router.query[queryName];

    const setQueryParams = (queryValue: any) => {
        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
                [queryName]: queryValue
            },
        });
    }

    return [queryRoomId, setQueryParams] as const;
}
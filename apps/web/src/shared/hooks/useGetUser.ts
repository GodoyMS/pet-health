import { authApi } from "@modules/auth/api/authApi";
import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
    const {data: user, isLoading, isError} = useQuery({
        queryKey: ["user"],
        queryFn: () => authApi.me(),
    });
    return {data: user, isLoading, isError};
};
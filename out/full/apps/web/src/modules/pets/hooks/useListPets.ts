import { useQuery } from "@tanstack/react-query";
import { petsApi } from "../api/petsApi";

export const useListPets = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["pets"],
        queryFn: async () => {
            const response = await petsApi.list();
            return response.data;
        }
    });
    return { data, isLoading, isError };
};
import { useQuery } from "@tanstack/react-query";
import { speciesApi } from "../api/speciesApi";

export const useListSpecies = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["species"],
        queryFn: async () => {
            const response = await speciesApi.list();
            return response.data;
        }
    });
    return { data, isLoading, isError };
};
import { authApi } from "@modules/auth/api/authApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useDeleteAccount = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const deleteAccountMutation = useMutation({
        mutationFn: () => authApi.deleteAccount(),
        onSuccess: () => {
            queryClient.clear();
            navigate("/login");
        },
    });
    return deleteAccountMutation;
};

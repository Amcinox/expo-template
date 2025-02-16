import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import React from 'react';

// Centralized function to show error toasts with consistent styling
export const showErrorToast = (toast: ReturnType<typeof useToast>, title: string, description: string) => {
    toast.show({
        placement: 'top',
        duration: 3000,
        render: ({ id }) => (
            <Toast action="error" variant="outline" className="p-4 gap-6 border-error-500 w-full shadow-hard-5 max-w-[443px] flex-row justify-between" >
                <ToastTitle className="font-semibold text-error-500"> {title} </ToastTitle>
                < ToastDescription size="sm" >
                    {description}
                </ToastDescription>
            </Toast>
        ),
    });
};
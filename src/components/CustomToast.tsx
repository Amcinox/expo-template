import React from "react";

import {
    CheckCircleIcon,
    CloseIcon,
    InfoIcon,
    AlertCircleIcon,
    Icon
} from "@/components/ui/icon";
import { Toast, ToastDescription, ToastTitle, useToast } from "./ui/toast";
import { Divider } from "./ui/divider";
import { Pressable } from "react-native";
import { VStack } from "./ui/vstack";

// Define toast types and their properties
export type ToastType = "success" | "warning" | "error" | "info" | "custom";

interface ToastConfig {
    icon: React.ComponentType;
    bgColor: string;
    borderColor: string;
    titleColor: string;
    descriptionColor: string;
    title: string;
}

const toastConfigs: Record<Exclude<ToastType, "custom">, ToastConfig> = {
    success: {
        icon: CheckCircleIcon,
        bgColor: "bg-success-50",
        borderColor: "border-success-700",
        titleColor: "text-success-700",
        descriptionColor: "text-success-600",
        title: "Success"
    },
    warning: {
        icon: AlertCircleIcon,
        bgColor: "bg-warning-50",
        borderColor: "border-warning-700",
        titleColor: "text-warning-700",
        descriptionColor: "text-warning-600",
        title: "Warning"
    },
    error: {
        icon: AlertCircleIcon,
        bgColor: "bg-error-50",
        borderColor: "border-error-700",
        titleColor: "text-error-700",
        descriptionColor: "text-error-600",
        title: "Error"
    },
    info: {
        icon: InfoIcon,
        bgColor: "bg-info-50",
        borderColor: "border-info-700",
        titleColor: "text-info-700",
        descriptionColor: "text-info-600",
        title: "Information"
    }
};

export interface CustomToastProps {
    type?: ToastType;
    message?: string;
    title?: string;
    duration?: number;
    placement?: "top" | "bottom";
    variant?: "solid" | "outline";
    showIcon?: boolean;
    customIcon?: React.ComponentType;
    showDivider?: boolean;
    onClose?: () => void;
    action?: string;
    className?: string;
    descriptionClassName?: string;
    titleClassName?: string;
    iconClassName?: string;
    id?: string;
}

export const useCustomToast = () => {
    const toast = useToast();
    const [activeToasts, setActiveToasts] = React.useState<string[]>([]);

    const showToast = ({
        type = "info",
        message,
        title,
        duration = 3000,
        placement = "top",
        variant = "outline",
        showIcon = true,
        customIcon,
        showDivider = false,
        onClose,
        className = "",
        descriptionClassName = "",
        titleClassName = "",
        iconClassName = "",
        id
    }: CustomToastProps) => {
        const newId = id ? id : Math.random().toString(36)

        // Add to active toasts
        setActiveToasts(prev => [...prev, newId]);
        const config = type !== "custom" ? toastConfigs[type] : {
            icon: customIcon || InfoIcon,
            bgColor: "bg-primary-50",
            borderColor: "border-primary-500",
            titleColor: "text-primary-700",
            descriptionColor: "text-primary-500",
            title: title || "Notification"
        };

        toast.show({
            id: newId,
            placement,

            duration,
            render: ({ id }) => {
                const uniqueToastId = "toast-" + id;

                return (
                    <Toast
                        variant={variant}
                        nativeID={uniqueToastId}
                        className={`mx-8 p-3 ${variant === 'outline' ? config.borderColor : ''} shadow-soft-1 
            ${variant === 'solid' ? '' : config.bgColor} items-center flex-row ${className}`}
                    >
                        {showIcon && (
                            <>
                                <Icon
                                    as={customIcon || config.icon}
                                    size="md"
                                    className={`${iconClassName || (variant === 'solid' ? 'stroke-white' : `stroke-${type}-600`)}`}
                                />

                                {showDivider && (
                                    <Divider
                                        orientation="vertical"
                                        className="h-[30px] bg-outline-200 mx-3"
                                    />
                                )}
                            </>
                        )}

                        <VStack space="xs" className="mx-8" >
                            <ToastTitle
                                className={`font-bold ${titleClassName || (variant === 'solid' ? 'text-white' : config.titleColor)}`}
                                size="sm"
                            >
                                {title || config.title}
                            </ToastTitle>

                            {message && (
                                <ToastDescription
                                    size="sm"
                                    className={descriptionClassName || (variant === 'solid' ? 'text-white' : config.descriptionColor)}
                                >
                                    {message}
                                </ToastDescription>
                            )}
                        </VStack>


                        <Pressable
                            onPress={() => {
                                toast.close(id);
                                setActiveToasts(prev => prev.filter(toastId => toastId !== id));
                                onClose && onClose();
                            }}
                            className="ml-2 absolute right-2 top-2"
                        >
                            <Icon as={CloseIcon}
                                size="md"
                                className={variant === 'solid' ? 'stroke-white' : ''}
                                color="gray"
                            />
                        </Pressable>
                    </Toast>
                );
            },
            onCloseComplete: () => {
                setActiveToasts(prev => prev.filter(toastId => toastId !== newId));
                onClose && onClose();
            }
        });

        return newId;
    };

    const closeToast = (id: string) => {
        toast.close(id);
        setActiveToasts(prev => prev.filter(toastId => toastId !== id));
    };

    const closeAllToasts = () => {
        toast.closeAll();
        setActiveToasts([]);
    };

    return {
        showToast,
        closeToast,
        closeAllToasts,
        activeToasts
    };
};
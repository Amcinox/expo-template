"use client"

import { View, Text } from "react-native"
import type React from "react"
import { useEffect } from "react"
import { useCustomToast } from "@/components/CustomToast"
import { useCustomerStore } from "@/stores/customerStore"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import Intercom from "@intercom/intercom-react-native"
import _ from "lodash"

interface MainMiddlewareProps {
    children: React.ReactNode
}




export default function MainMiddleware({ children }: MainMiddlewareProps) {
    const { user, logout } = useAuth()
    const { customer, getCustomer, clearCustomer, isLoading } = useCustomerStore()

    const { showToast } = useCustomToast()
    const { toggleSplashLoading, updateTheme, updateLogos } = useSettings()



    const fetchData = async () => {
        toggleSplashLoading(true)
        try {
            await getCustomer(user?.["custom:user_id"]!)

        } catch (e: any) {
            showToast({
                title: "Error",
                message: e.message,
                type: "error",
            })
            clearCustomer()
            await logout()
        } finally {
            toggleSplashLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


    useEffect(() => {
        const openHelpCenter = async () => {
            if (!customer) {
                return
            }
            try {
                await Intercom.logout()
                if (customer) {
                    await Intercom.loginUserWithUserAttributes({
                        userId: customer.id,
                        email: customer.email,
                        name: _.startCase(`${customer.firstName} ${customer.lastName}`),
                        phone: customer.phoneNumber,
                        customAttributes: {
                            status: customer.status
                        },
                    });
                } else {
                    await Intercom.loginUnidentifiedUser()
                }
            } catch (error) {
                console.log(error)
            }
        };
        openHelpCenter()

    }, [customer])



    if (!customer) {
        return (
            <View className="flex-1 bg-background-500" />
        )
    }

    return children
}


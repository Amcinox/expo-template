import { ScrollView } from "react-native";
import React from "react";
import { ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import ReadOnlyTextField from "@/components/ReadOnlyTextField";
import { VStack } from "@/components/ui/vstack";
import { useCustomerStore } from "@/stores/customerStore";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import moment from "moment";
export default function BasicInformationScreen() {

    const { customer, getCustomer } = useCustomerStore()
    const { user } = useAuth()
    const { toggleSplashLoading } = useSettings()

    const refreshCustomerDetails = async () => {
        try {
            toggleSplashLoading(true)
            await getCustomer(user?.["custom:user_id"]!)
        } catch (e) {
            console.log(e)
        } finally {
            toggleSplashLoading(false)
        }
    }

    return (
        <ScrollView >
            <VStack
                className='flex-1 items-center justify-start p-6 '
                space="2xl"
            >
                <VStack className='w-full space-y-6' space="md">
                    <HStack className='w-full space-x-4' space="md">
                        <ReadOnlyTextField value={customer?.firstName!} label="First Name" className="flex-1 " />
                        <ReadOnlyTextField value={customer?.lastName!} label="First Name" className="flex-1 " />
                    </HStack>
                    <VStack space="md">
                        <ReadOnlyTextField value={moment(customer?.dateOfBirth).format("DD/MM/YYYY")} label="Date of Birth" />
                        <ReadOnlyTextField value={customer?.email!} label="Email" />
                        <ReadOnlyTextField value={customer?.phoneNumber!} label="Phone" />
                    </VStack>
                </VStack>

                <Button
                    className='w-full rounded-full h-12 mt-6'
                    variant="outline"
                    onPress={refreshCustomerDetails}
                >
                    <ButtonText>Refresh Details</ButtonText>
                </Button>
            </VStack>
        </ScrollView>

    );
}

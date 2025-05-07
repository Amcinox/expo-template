import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiHandler } from '@/api/apiHandler'
import { endpoints } from '@/api/endpoints'
import { CustomerVerificationPayload } from '@/schemas/auth/customerVerification.schema'
import { Customer } from '@/types/customer'
import { CreateAccountPayload } from '@/schemas/auth/createAccount.schema'



interface CustomerState {
    // State
    customer: Customer | null
    isLoading: boolean
    error: string | null

    // General Actions
    setCustomer: (Customer: Partial<Customer>) => void
    clearCustomer: () => void
    verifyCustomer: (body: CustomerVerificationPayload) => Promise<string>
    verifyOTP: ({
        verificationCode,
        Customer
    }: {
        verificationCode: string
        Customer: Customer
    }) => Promise<{ status: "INITIALIZED" }>
    resentOTP: (phoneNumber: string) => Promise<{ status: "INITIALIZED" }>
    createCustomer: (data: CreateAccountPayload & {
        phoneNumber: string
        verificationCode: string

    }) => Promise<Customer>
    getCustomer: (CustomerId: string) => Promise<Customer>
    updateCustomer: (Customer: Partial<Customer>) => void

    reset: () => void



}

export const useCustomerStore = create<CustomerState>()(
    devtools(
        (set, get) => ({
            // Initial state
            customer: null,
            isLoading: false,
            error: null,
            isVerified: false,

            // Actions
            setCustomer: (customer: Partial<Customer>) => {
                set(state => ({
                    customer: {
                        ...state.customer,
                        ...customer
                    } as Customer
                }))
            },

            clearCustomer: () => {
                set({ customer: null, error: null })
            },

            verifyCustomer: async (body): Promise<any> => {
                try {
                    set({ isLoading: true, error: null })
                    const { path, method } = endpoints.customer.verify_customer
                    // const { data } = await apiHandler.fetch<Customer>({
                    //     endpoint: path({}),
                    //     method,
                    //     body: {
                    //         firstName: body.first_name,
                    //         lastName: body.last_name,
                    //         phoneNumber: body.mobile_number
                    //     }
                    // })

                    // set(state => ({
                    //     customer: data
                    // }))

                    // return data
                } catch (error) {
                    set({ error: 'Failed to send OTP' })
                    throw error

                } finally {
                    set({ isLoading: false })
                }
            },

            verifyOTP: async ({ verificationCode, Customer }) => {
                try {
                    set({ isLoading: true, error: null })
                    const { path, method } = endpoints.customer.verify_otp
                    const { data } = await apiHandler.fetch<{ status: "INITIALIZED" }>({
                        endpoint: path({}),
                        method: method,
                        body: {
                            verificationCode
                        }
                    })

                    return data
                } catch (error) {
                    set({ error: 'Failed to verify OTP' })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },
            resentOTP: async (phoneNumber) => {
                try {
                    set({ isLoading: true, error: null })
                    const { path, method } = endpoints.customer.verify_customer
                    const { data } = await apiHandler.fetch<{ status: "INITIALIZED" }>({
                        endpoint: path({}),
                        method: method,
                        body: {
                            phoneNumber
                        }

                    })
                    return data
                } catch (error) {
                    set({ error: 'Failed to resend OTP' })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },


            createCustomer: async (payload) => {
                try {
                    console.log({
                        email: payload.username,
                        password: payload.password,
                        phoneNumber: payload.phoneNumber,
                        verificationCode: payload.verificationCode
                    })
                    set({ isLoading: true, error: null })
                    const { path, method } = endpoints.customer.create_customer
                    const { data } = await apiHandler.fetch<Customer>({
                        endpoint: path({}),
                        method: method,
                        body: {
                            email: payload.username,
                            password: payload.password,
                            phoneNumber: payload.phoneNumber,
                            verificationCode: payload.verificationCode
                        }
                    })
                    set(state => ({
                        customer: data
                    }))
                    return data
                } catch (error) {
                    set({ error: 'Failed to register Customer' })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },



            updateCustomer: async (payload) => {
                try {
                    set({ isLoading: true, error: null })
                    const { path, method } = endpoints.customer.update_customer
                    const { data } = await apiHandler.fetch<Customer>({
                        endpoint: path({}),
                        method: method,
                        body: payload
                    })
                    set(state => ({
                        customer: data
                    }))
                    return data
                } catch (error) {
                    set({ error: 'Failed to register Customer' })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },






            getCustomer: async (CustomerId) => {
                try {
                    set({ isLoading: true, error: null })
                    const { path, method } = endpoints.customer.get_customer
                    // const { data } = await apiHandler.fetch<Customer>({
                    //     endpoint: path({
                    //         Customer_id: CustomerId
                    //     }),

                    //     method: method,
                    // })
                    const data = {
                        id: "1",
                        firstName: "John",
                        lastName: "Doe",
                        email: "contact@remirage.com",
                        phoneNumber: "08012345678",
                        status: "ACTIVE",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    } as unknown as Customer

                    set(state => ({
                        customer: data
                    }))
                    return data
                } catch (error) {
                    set({ error: 'Failed to get Customer' })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },




            reset: () => {
                set({
                    customer: null,
                    error: null,
                })
            },

        }),
        { name: 'customer-store' }
    )
)
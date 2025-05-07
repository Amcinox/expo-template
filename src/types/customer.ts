export enum Status {
    OPEN = "OPEN",
    PENDING = "PENDING"
}
export interface Customer {
    status: Status
    firstName: string
    lastName: string
    dateOfBirth: string
    email: string
    phoneNumber: string
    created_at: Date
    updated_at: Date
    id: string
}



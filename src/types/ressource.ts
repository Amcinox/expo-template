export enum RessourcesScreenName {
    HOME = 'HOME',
    WELLBEING = 'WELLBEING',
}

export interface Article {
    isPublished: boolean
    isDeleted: boolean
    title: string
    link: string

    created_at: Date
    updated_at: Date
    deletedAt: Date
    id: string
    image: string
}

export interface Category {
    isDeleted: boolean
    name: string
    description: string
    icon: string
    created_at: Date
    updated_at: Date
    id: string
    screenName: RessourcesScreenName
    order: number
}

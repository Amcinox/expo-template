import { Languages } from "@/types/settings";

export interface Language {
    title: string;
    value: Languages;
    flag: string
}
export const languagesList: Language[] = [
    {
        title: 'English',
        value: Languages.EN,
        flag: '🇺🇸'
    },
    {
        title: 'French',
        value: Languages.FR,
        flag: '🇫🇷'
    },
    {
        title: 'Japanese',
        value: Languages.JA,
        flag: '🇯🇵'
    },
    {
        title: 'Spanish',
        value: Languages.ES,
        flag: '🇪🇸'
    },
];
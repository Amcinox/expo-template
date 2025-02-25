import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, type TextInputProps, type ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './ui/text';

type SearchFn<T> = (query: string) => Promise<T[]>;

interface AsyncSearchAutocompleteProps<T> {
    onSearch: SearchFn<T>;
    renderItem: (item: T, onSelect: (item: T) => void) => React.ReactNode;
    onSelect?: (item: T) => void;
    inputProps?: Partial<TextInputProps>;
    containerProps?: Partial<ViewProps>;
    placeholder?: string;
    minChars?: number;
    debounceTime?: number;
    className?: string;
    inputClassName?: string;
}

function AsyncSearchAutocomplete<T>({
    onSearch,
    renderItem,
    onSelect,
    placeholder = "Search...",
    minChars = 2,
    debounceTime = 300,
    inputProps = {},
    containerProps = {},
    className = "",
    inputClassName = "",
}: AsyncSearchAutocompleteProps<T>) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<T[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<TextInput>(null);
    const isMounted = useRef(true);
    const currentQueryRef = useRef<string>('');

    const clearSearchTimeout = useCallback(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = undefined;
        }
    }, []);

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < minChars) {
            setResults([]);
            return;
        }

        currentQueryRef.current = searchQuery;
        setIsLoading(true);

        try {
            const searchResults = await onSearch(searchQuery);
            if (isMounted.current && currentQueryRef.current === searchQuery) {
                setResults(searchResults);
            }
        } catch (error) {
            console.error('Search error:', error);
            if (isMounted.current && currentQueryRef.current === searchQuery) {
                setResults([]);
            }
        } finally {
            if (isMounted.current && currentQueryRef.current === searchQuery) {
                setIsLoading(false);
            }
        }
    }, [onSearch, minChars]);

    const handleTextChange = useCallback((text: string) => {
        setQuery(text);
        setShowResults(true);
        clearSearchTimeout();

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(text);
        }, debounceTime);
    }, [debounceTime, handleSearch, clearSearchTimeout]);

    const handleItemSelect = useCallback((item: T) => {
        setQuery('');
        setShowResults(false);
        setResults([]);
        onSelect?.(item);
        inputRef.current?.blur();
    }, [onSelect]);

    const handleClear = useCallback(() => {
        setQuery('');
        setResults([]);
        setShowResults(false);
        clearSearchTimeout();
        inputRef.current?.focus();
    }, [clearSearchTimeout]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            clearSearchTimeout();
        };
    }, [clearSearchTimeout]);

    return (
        <View className="w-full relative">
            <View
                {...containerProps}
                className={`flex-row items-center border border-gray-200 rounded-lg bg-white ${className}`}
            >
                {query.length > 0 && (
                    <View className="p-2">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                    </View>
                )}

                <TextInput
                    ref={inputRef}
                    value={query}
                    onChangeText={handleTextChange}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"

                    autoCorrect={false}
                    {...inputProps}
                    className={`flex-1 p-2 h-12 text-base ${query.length === 0 ? 'pr-10' : ''} ${inputClassName}`}
                />

                <View className="absolute right-2 flex-row items-center">
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : (
                        <>
                            {query.length === 0 ? (
                                <Ionicons name="search" size={20} color="#9CA3AF" />
                            ) : (
                                <TouchableOpacity
                                    onPress={handleClear}
                                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                >
                                    <Ionicons name="close" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>

            {showResults && query.length >= minChars && (
                <View className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white max-h-64 z-50 shadow-sm">
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {results.length > 0 ? (
                            results.map((item) => renderItem(item, handleItemSelect))
                        ) : (
                            <View className="p-3">
                                <Text className="text-gray-500 text-center">
                                    {isLoading ? 'Searching...' : 'No results found'}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

export default AsyncSearchAutocomplete;
import { ButtonText, ButtonIcon } from "../ui/button";
import { Divider } from "../ui/divider";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { ChevronRightIcon } from "../ui/icon";
import { VStack } from "../ui/vstack";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import React from "react";

export enum MenuItemType {
    ACTION = 'action',
    GROUP = 'group',
    TOGGLE = 'toggle'
}

interface BaseMenuItem {
    id: string;
    label: string;
    type: MenuItemType;
    className?: string;
}

interface ActionMenuItem extends BaseMenuItem {
    type: MenuItemType.ACTION;
    showIcon?: boolean;
    primary?: boolean;
    disabled?: boolean;
    testID?: string;
    onPress?: () => void;
}

interface ToggleMenuItem extends BaseMenuItem {
    type: MenuItemType.TOGGLE;
    defaultValue?: boolean;
    testID?: string;
    onToggle?: (value: boolean) => void;
}

interface GroupMenuItem extends BaseMenuItem {
    type: MenuItemType.GROUP;
    testID?: string;
    children: (ActionMenuItem | ToggleMenuItem)[];
}

export type MenuItem = ActionMenuItem | ToggleMenuItem | GroupMenuItem;

interface MenuItemProps {
    item: MenuItem;
    level?: number;
}

interface MenuProps {
    items: MenuItem[];
}

const MenuItem: React.FC<MenuItemProps> = ({ item, level = 0 }) => {
    switch (item.type) {
        case MenuItemType.ACTION: {
            const actionItem = item as ActionMenuItem;
            return (
                <Button
                    size="md"
                    testID={item.testID}
                    variant="link"
                    action={actionItem.primary ? "primary" : "secondary"}
                    isDisabled={actionItem.disabled}
                    onPress={actionItem.onPress}
                    className={`flex-1 justify-between max-h-11 p-0 ${actionItem.className || ''}`}
                >
                    <ButtonText className={actionItem.className || ''}>{actionItem.label}</ButtonText>
                    {actionItem.showIcon !== false && (
                        <ButtonIcon as={ChevronRightIcon} size="lg" />
                    )}
                </Button>
            );
        }

        case MenuItemType.TOGGLE: {
            const toggleItem = item as ToggleMenuItem;
            return (
                <HStack className={`flex-1 justify-between items-center py-0  ${toggleItem.className || ''}`}>
                    <Button
                        size="md"
                        variant="link"

                        action="secondary"
                        className={`flex-1 justify-between max-h-11 p-0  `}
                    >
                        <ButtonText className={toggleItem.className || ''}>{toggleItem.label}</ButtonText>
                    </Button>
                    <Switch
                        defaultValue={toggleItem.defaultValue}
                        onValueChange={toggleItem.onToggle}
                    />
                </HStack>
            );
        }

        case MenuItemType.GROUP: {
            const groupItem = item as GroupMenuItem;
            return (
                <VStack space="xs" className={groupItem.className || ''}>
                    <Heading size="md" className="text-typography-600">
                        {groupItem.label}
                    </Heading>
                    <Divider className="-mx-4 w-screen bg-background-50" />

                    {groupItem.children.map((child, childIndex) => (
                        <React.Fragment key={`${groupItem.id}-child-${childIndex}`}>
                            <MenuItem item={child} level={level + 1} />
                            {childIndex < groupItem.children.length - 1 && (
                                <Divider className="-mx-4 w-screen bg-background-50" />
                            )}
                        </React.Fragment>
                    ))}
                </VStack>
            );
        }

        default:
            return null;
    }
};

export const Menu: React.FC<MenuProps> = ({ items }) => {
    return (
        <VStack space="md" className="flex-1 h-1/2">
            {items.map((item, index) => (
                <React.Fragment key={`menu-item-${index}`}>
                    <MenuItem item={item} />
                    {index < items.length - 1 && (
                        <Divider className="-mx-4 w-screen bg-background-50" />
                    )}
                </React.Fragment>
            ))}
        </VStack>
    );
};
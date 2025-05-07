import React from "react";
import { Button, ButtonText } from "../ui/button";
import Intercom from '@intercom/intercom-react-native';
import _ from "lodash"

export default function HelpButton() {
    return (
        <Button
            variant="link"
            onPress={async () => {
                await Intercom.present()
            }}>
            <ButtonText className='text-white'>
                Help
            </ButtonText>
        </Button>
    );
}
import React from "react";
import { Button, ButtonText } from "../ui/button";
import _ from "lodash"

export default function HelpButton() {
    return (
        <Button
            variant="link"
            onPress={async () => {
                console.log('Help button pressed')
            }}>
            <ButtonText className='text-white'>
                Help
            </ButtonText>
        </Button>
    );
}
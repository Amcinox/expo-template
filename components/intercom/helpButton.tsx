import React from "react";
import { Button, ButtonText } from "../ui/button";

export default function HelpButton() {
    // we will add intercom logic here
    return (
        <Button
            variant="link"
            onPress={() => { }}
        >
            <ButtonText className='text-white'>
                Help
            </ButtonText>
        </Button>
    );
}

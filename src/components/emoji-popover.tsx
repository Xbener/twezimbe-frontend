import React, { Children } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from './ui/popover'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'


interface Props {
    children: React.ReactNode
    onEmojiSelector: (emoji: any) => void

}

export const EmojiPopover = ({ children, onEmojiSelector }: Props) => {

    const [popoverOpen, setPopoverOpen] = React.useState(false)
    const onSelect = (emoji: any) => {
        onEmojiSelector(emoji)
        setPopoverOpen(false)
    }
    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full border-none shadow-none">
                <Picker data={data} onEmojiSelect={onSelect} />
            </PopoverContent>
        </Popover>
    )
}
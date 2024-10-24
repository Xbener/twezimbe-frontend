import React, { useState, useRef } from "react";
import { Bold, Italic, Strikethrough, Link2, List, ListOrdered, Plus, Smile, AtSign, File } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChannelTypes, User } from "@/types";

const ChatInput = ({
    currentUser,
    channel,
    sending,
    setIsTyping,
    handleKeyPress,
    setAttachments,
    setMessage,
    message
}: {
    currentUser?: User
    channel?: ChannelTypes
    sending: boolean
    setIsTyping: (vl: any) => void
    handleKeyPress: (e: any) => void
    setAttachments: (vl: any) => void
    setMessage: (vl: any) => void
    message: string
}) => {

    const messagingInputRef = useRef<HTMLTextAreaElement>(null);
    const emojiContainerRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);

    // Function to format text based on the selected type
    const formatText = (type: string) => {
        const input = messagingInputRef.current;

        if (input) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const selectedText = input.value.substring(start, end);
            let formattedText = '';

            // Check if some text is selected
            if (!selectedText) {
                alert("Please select some text to format");
                return;
            }

            // Apply formatting based on the type
            switch (type) {
                case 'bold':
                    formattedText = `**${selectedText}**`;
                    break;
                case 'italic':
                    formattedText = `*${selectedText}*`;
                    break;
                case 'strikeThrough':
                    formattedText = `~~${selectedText}~~`;
                    break;
                case 'link':
                    const url = prompt("Enter the URL");
                    if (url) {
                        formattedText = `[${selectedText}](${url})`;
                    }
                    break;
                case 'bulletList':
                    formattedText = `- ${selectedText}`;
                    break;
                case 'orderedList':
                    formattedText = `1. ${selectedText}`;
                    break;
                default:
                    break;
            }

            // Replace the selected text with formatted text
            const newText = input.value.substring(0, start) + formattedText + input.value.substring(end);
            setMessage(newText);

            // Re-set the caret position to the end of the formatted text
            setTimeout(() => {
                input.setSelectionRange(start + formattedText.length, start + formattedText.length);
                input.focus();
            }, 0);
        }
    };

    return (
        <div className="w-full flex flex-col border-gray-700 border focus-within:border-white rounded-md">
            {/* Toolbar for text formatting */}
            <div className="flex gap-2 p-2 border-b border-b-gray-500">
                <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => formatText('bold')}>
                    <Bold className="size-5" />
                </span>
                <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => formatText('italic')}>
                    <Italic className="size-5" />
                </span>
                <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => formatText('strikeThrough')}>
                    <Strikethrough className="size-5" />
                </span>
                <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => formatText('link')}>
                    <Link2 className="size-5" />
                </span>
                <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => formatText('bulletList')}>
                    <List className="size-5" />
                </span>
                <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => formatText('orderedList')}>
                    <ListOrdered className="size-5" />
                </span>
            </div>

            {/* Input for typing the message */}
            <div className="flex-grow">
                <textarea
                    ref={messagingInputRef}
                    disabled={sending}
                    onBlur={() => setIsTyping((prev: any) => ({ message: "" }))}
                    onFocus={() => setIsTyping((prev: any) => ({ ...prev, message: `${currentUser?.firstName} is typing ...` }))}
                    className="w-full bg-transparent p-3 rounded-md text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
                    placeholder={`Message ${channel?.name}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>

            {/* Emoji picker and file upload options */}
            <div className="flex justify-between items-center p-2">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger className="p-1 hover:bg-gray-50 rounded-full cursor-pointer">
                            <Plus className="size-5" />
                        </PopoverTrigger>
                        <PopoverContent className="bg-[#013a6f] shadow-2xl z-50 flex flex-col gap-1">
                            <label htmlFor="fileUpload" className="flex items-center gap-2 hover:bg-gray-800 p-2 cursor-pointer">
                                <File className="size-5" />
                                Upload a file
                            </label>
                            <input
                                type="file"
                                id="fileUpload"
                                hidden
                                multiple
                                onChange={(e) => setAttachments(e.target.files)}
                            />
                        </PopoverContent>
                    </Popover>
                    <span className="p-1 hover:bg-gray-50 rounded-full cursor-pointer" onClick={() => setShowPicker(prev => !prev)}>
                        <Smile className="size-5" />
                    </span>
                    {showPicker && (
                        <div ref={emojiContainerRef} className="absolute z-50 bottom-9 right-0">
                            <EmojiPicker onEmojiClick={(emoji) => setMessage((prev: any) => prev + emoji.emoji)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatInput;

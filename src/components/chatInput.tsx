import React from 'react'
import dynamic from 'next/dynamic'
import Quill from 'quill'
import { User } from '@/types';

const Editor = dynamic(() => import('./Editor'), { ssr: false })

interface Props {
    placeholder: string;
    sendMessage: (content: string) => void
    setAttachments: (vl: FileList) => void
    disabled: boolean
    filesAttached: boolean
    chatMembers: User[]
}

function chatInput({ placeholder, disabled, sendMessage, setAttachments, filesAttached, chatMembers }: Props) {

    const editorRef = React.useRef<Quill | null>(null)
    return (
        <div className="px-5 w-full bg-[#001d38]">
            <Editor
                chatMembers={chatMembers}
                placeholder={placeholder}
                onSubmit={(content) => sendMessage(content)}
                disabled={disabled}
                innerRef={editorRef}
                setAttachments={setAttachments}
                filesAttached={filesAttached}
            />
        </div>
    )
}

export default chatInput
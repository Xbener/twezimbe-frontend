import React from 'react'
import dynamic from 'next/dynamic'
import Quill from 'quill'

const Editor = dynamic(() => import('./Editor'), { ssr: false })

interface Props {
    placeholder: string;
    sendMessage: (content: string) => void
    setAttachments: (vl: FileList) => void
    disabled: boolean
    filesAttached: boolean
}

function chatInput({ placeholder, disabled, sendMessage, setAttachments, filesAttached }: Props) {

    const editorRef = React.useRef<Quill | null>(null)
    return (
        <div className="px-5 w-full">
            <Editor
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
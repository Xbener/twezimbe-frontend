import React, { useEffect } from 'react'
import Quill, { QuillOptions } from 'quill'
import { Button } from './ui/button'
import { SendHorizonal, Smile, PlusIcon } from 'lucide-react'
import { Delta, Op } from 'quill/core'
import { cn } from '@/lib/utils'
import { EmojiPopover } from './emoji-popover'

interface Props {
    variant?: "create" | 'update'
    onSubmit: (body: string) => void
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[]
    disabled?: boolean;
    innerRef?: React.MutableRefObject<Quill | null>
    setAttachments: (vl: FileList) => void
    filesAttached?: boolean
}

function Editor({
    variant = 'create',
    onSubmit,
    defaultValue = [],
    disabled = false,
    innerRef,
    onCancel,
    placeholder = "Send a message ...",
    setAttachments,
    filesAttached,
}: Props) {

    const [text, setText] = React.useState("")
    const [isToolbarVisible, setIsToolbarVisible] = React.useState(true)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const submitRef = React.useRef(onSubmit)
    const placeholderRef = React.useRef(placeholder)
    const quillRef = React.useRef<Quill | null>(null)
    const defaultValueRef = React.useRef(defaultValue)
    const disabledRef = React.useRef(disabled)

    React.useLayoutEffect(() => {
        submitRef.current = onSubmit
        placeholderRef.current = placeholder
        defaultValueRef.current = defaultValue
        disabledRef.current = disabled
    })

    React.useEffect(() => {
        if (!containerRef.current) return
        const container = containerRef.current
        const editorContainer = container.appendChild(container.ownerDocument.createElement('div'))
        const options: QuillOptions = {
            readOnly: disabledRef.current || filesAttached,
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ['bold', 'italic', 'strike'],
                    ['link'],
                    [{ list: "ordered" }, { list: 'bullet' }]

                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                console.log(quillRef.current?.getSemanticHTML())
                                submitRef.current(quillRef.current?.getSemanticHTML() || text)
                                if (quillRef) {
                                    quillRef.current?.setText("")
                                    quillRef.current?.focus()
                                }
                            }
                        },
                        ctrl_enter: {
                            key: "Enter",
                            ctrlKey: true,
                            handler: () => quill.insertText(quill.getSelection()?.index || 0, "\n")
                        }
                    }
                }
            }
        }

        const quill = new Quill(editorContainer, options)
        quillRef.current = quill
        quillRef.current.focus()

        if (innerRef) {
            innerRef.current = quill
        }

        quill.setContents(defaultValueRef.current)
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText())
        })
        return () => {
            quill.off(Quill.events.TEXT_CHANGE)
            if (container) {
                container.innerHTML = ""
            }

            if (quillRef.current) {
                quillRef.current = null
            }
            if (innerRef) {
                innerRef.current = null
            }
        };
    }, [innerRef])

    const toggleToolbar = () => {
        setIsToolbarVisible(prev => !prev)
        const toolbarElement = containerRef.current?.querySelector('.ql-toolbar')
        if (toolbarElement) {
            toolbarElement.classList.toggle('hidden')
        }
    }

    const onEmojiSelector = (emoji: any) => {
        const quill = quillRef.current
        quill?.insertText(quill?.getSelection()?.index || 0, emoji.native)
    }
    const isEmpty = text.replace(/<(.|\n)*?>/g, '').trim().length === 0

    return (
        <div className="flex bg-[#001d38] flex-col w-full ">
            <div className="flex w-full flex-col rounded-md overflow-hidden  focus-within:shadow-sm transition bg-[#001d38]">
                <div ref={containerRef} className="h-[100px] bg-[#001d38] border-none w-[100%] ql-custom placeholder:text-white" />
                <div className="flex px-2 pb-2 z-[5] text-black bg-[#001d38] justify-between">
                    <div className="flex px-2 pb-2 z-[5] text-black ">
                        {
                            variant === 'create' && (
                                <>
                                    <input
                                        type="file"
                                        hidden
                                        name="attachment"
                                        id="attachment"
                                        multiple
                                        onChange={(e) => {
                                            setAttachments(e.target.files as FileList)
                                        }}
                                    />
                                    <button disabled={disabled} className="p-1 font-bold rounded-full cursor-pointer">
                                        <label className="flex items-center gap-2 cursor-pointer" htmlFor="attachment">
                                            <PlusIcon className="size-5 text-white" />
                                        </label>
                                    </button>
                                </>
                            )
                        }
                        <Button
                            className="text-white"
                            onClick={toggleToolbar}
                        >

                            Aa
                        </Button>
                        <EmojiPopover
                            onEmojiSelector={onEmojiSelector}
                        >
                            <Button
                                className="text-white"

                            >
                                <Smile />
                            </Button>
                        </EmojiPopover>

                    </div>
                    <div className="justify-self-end">
                        {
                            variant === 'update' && (
                                <>
                                    <Button
                                        className="text-white"
                                        disabled={disabled}
                                    >

                                        Cancel
                                    </Button>
                                    <Button
                                        className="text-white"

                                        disabled={disabled || isEmpty}
                                    >

                                        Save
                                    </Button>
                                </>
                            )
                        }
                        {
                            variant === 'create' && (
                                <Button
                                    className="text-white"
                                    onClick={() => {
                                        submitRef.current(quillRef.current?.getText() || text)
                                        if (quillRef) {
                                            quillRef.current?.setText("")
                                            quillRef.current?.focus()
                                        }
                                    }}
                                    disabled={isEmpty || disabled}
                                >

                                    <SendHorizonal />
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>

            {
                variant === 'create' && (
                    <div className={cn(
                        "p-2 text-[10px] text-muted-foreground justify-end w-full flex opacity-0",
                        !isEmpty && 'opacity-100'
                    )}>
                        <p className="text-[.7rem]"><code className='text-[.6rem]'>ctrl+enter</code> to add a new line</p>
                    </div>
                )
            }
        </div>
    )
}

export default Editor
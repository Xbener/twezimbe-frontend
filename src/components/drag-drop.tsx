import { PlusSquareIcon } from "lucide-react";
import { DragEvent, DragEventHandler, useState } from "react";

interface Props {
    setAttachments: (vl: any) => void
    children: React.ReactNode
}
export const DragDrop = ({ setAttachments, children }: Props) => {
    const [dragging,setDragging] = useState(false)
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        setDragging(true)
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const droppedFiles = Array.from(event.dataTransfer.files);
        setAttachments((prevFiles: any) => [...prevFiles, ...droppedFiles]);
        setDragging(false)
    };


    return <div
        className="drag-drop relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        {
            dragging && (
                <div className="absolute w-full h-full bg-[rgba(0,0,0,0.51)] z-50 grid place-content-center text-white">
                    <PlusSquareIcon className="size-28" />
                </div>
            )
        }
        {children}
    </div>
}
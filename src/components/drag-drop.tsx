import { DragEvent, DragEventHandler } from "react";

interface Props {
    setAttachments: (vl: any) => void
    children: React.ReactNode
}
export const DragDrop = ({ setAttachments, children }: Props) => {
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const droppedFiles = Array.from(event.dataTransfer.files);
        setAttachments((prevFiles: any) => [...prevFiles, ...droppedFiles]);
    };


    return <div
        className="drag-dropv"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        {children}
    </div>
}
export const mimeTypeToSvg: Record<string, string> = {
    'application/pdf': '/filetypes/pdf.svg',
    'application/msword': '/filetypes/docx.svg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '/filetypes/docx.svg',
    'application/vnd.ms-powerpoint': '/filetypes/ppt.svg',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '/filetypes/ppt.svg',
    'application/vnd.ms-excel': '/filetypes/sheet.svg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '/filetypes/sheet.svg',
    'text/plain': '/filetypes/txt.svg',
    'text/html': '/filetypes/html.svg',
    'audio/mpeg': '/filetypes/audio.svg',
    'audio/wav': '/filetypes/audio.svg',
    'audio/ogg': '/filetypes/audio.svg',
    'audio/mp3': '/filetypes/audio.svg',
    // Fallback for unknown types
    'default': '/filetypes/any.svg'
};

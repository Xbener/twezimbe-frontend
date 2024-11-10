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


export const countryCodes = [
    { code: '+256', value: "256", label: 'Uganda' },
    { code: '+234', value: "234", label: 'Nigeria' },
    { code: '+254', value: "254", label: 'Kenya' },
    { code: '+27', value: "27", label: 'South Africa' },
    { code: '+233', value: "233", label: 'Ghana' },
    { code: '+250', value: "250", label: 'Rwanda' },
    // Add more as needed
];
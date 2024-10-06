import { ChangeEvent } from 'react'

interface HeaderProps {
  onImageSelect: (image: string) => void
  pickedColorValue: string | null
}

const ALLOWED_MIME_TYPE_PREFIX = 'image/'
const FALLBACK_COLOR_HEX = '#000000'
const FALLBACK_COLOR_LABEL = 'None'

export default function Header({
  onImageSelect,
  pickedColorValue,
}: Readonly<HeaderProps>) {
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file?.type.startsWith(ALLOWED_MIME_TYPE_PREFIX)) {
      console.warn('Unsupported file type. Please upload an image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelect(reader.result)
      }
    }
    reader.onerror = () => {
      console.error('There was an error reading the file.')
    }
    reader.readAsDataURL(file)
  }

  return (
    <header className="bg-white p-4 shadow-md">
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <p className="text-sm">
        Selected Color:{' '}
        <span
          className="font-semibold"
          style={{ color: pickedColorValue ?? FALLBACK_COLOR_HEX }}
        >
          {pickedColorValue ?? FALLBACK_COLOR_LABEL}
        </span>
      </p>
    </header>
  )
}

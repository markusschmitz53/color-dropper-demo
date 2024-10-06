import { ChangeEvent } from 'react'
import ActivateDropperIcon from '../assets/IconColorPicker.svg?react'

interface HeaderProps {
  onImageSelect: (image: string) => void
  pickedColorValue: string | null
  isDropperActive: boolean
  toggleDropper: () => void
  isContained: boolean
  toggleContain: () => void
}

const ALLOWED_MIME_TYPE_PREFIX = 'image/'
const FALLBACK_COLOR_HEX = '#000000'
const FALLBACK_COLOR_LABEL = 'None'

export default function Header({
  onImageSelect,
  pickedColorValue,
  isDropperActive,
  toggleDropper,
  isContained,
  toggleContain,
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
    <header className="fixed z-50 w-full h-[75px] bg-white p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="p-2 rounded-full border border-gray-100 bg-gray-50 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400  hover:border-purple-300 hover:border transition-all duration-200 transform cursor-pointer text-sm font-semibold"
        >
          Choose File
        </label>
        <button
          onClick={toggleDropper}
          className="p-2 rounded-full border-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-purple-300 transition-all duration-200 transform "
        >
          <ActivateDropperIcon className="h-6 w-6" />
        </button>
        <div className="flex-grow">
          <p className="text-sm" hidden={!isDropperActive}>
            Selected Color:{' '}
            <span className="font-semibold">
              {pickedColorValue ?? FALLBACK_COLOR_LABEL}
            </span>
          </p>
        </div>
        <button
          onClick={toggleContain}
          className="p-2 rounded-full border-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-purple-300 transition-all duration-200 transform"
        >
          {!isContained
            ? 'Displaying Original Image'
            : 'Displaying Contained Image'}
        </button>
      </div>
    </header>
  )
}

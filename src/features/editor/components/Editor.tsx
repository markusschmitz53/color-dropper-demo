import Header from '../../../components/Header.tsx'
import ImageCanvas from './ImageCanvas.tsx'
import { useState } from 'react'

export default function Editor() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [isContained, setIsContained] = useState<boolean>(true)

  return (
    <main className="bg-gray-200 min-h-screen flex flex-col">
      <Header
        onImageSelect={(image) => setImageData(image)}
        isContained={isContained}
        toggleContain={() => setIsContained((prev) => !prev)}
        pickedColorValue={selectedColor}
      />
      <ImageCanvas
        imageData={imageData}
        isContained={isContained}
        onColorPick={(color) => setSelectedColor(color)}
      />
    </main>
  )
}

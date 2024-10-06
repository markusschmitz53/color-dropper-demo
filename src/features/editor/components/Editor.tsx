import Header from '../../../components/Header.tsx'
import ImageCanvas from './ImageCanvas.tsx'
import { useState } from 'react'

export default function Editor() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [isContained, setIsContained] = useState<boolean>(true)
  const [isDropperActive, setIsDropperActive] = useState<boolean>(false)

  return (
    <main className="bg-gray-200 min-h-screen flex flex-col">
      <Header
        onImageSelect={(image) => {
          setIsDropperActive(false)
          setSelectedColor(null)
          setImageData(image)
        }}
        isDropperActive={isDropperActive}
        toggleDropper={() => setIsDropperActive((prev) => !prev)}
        isContained={isContained}
        toggleContain={() => setIsContained((prev) => !prev)}
        pickedColorValue={selectedColor}
      />
      <ImageCanvas
        imageData={imageData}
        isContained={isContained}
        isDropperActive={isDropperActive}
        onColorPick={(color) => setSelectedColor(color)}
      />
    </main>
  )
}

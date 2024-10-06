import Header from '../../../components/Header.tsx'
import ImageCanvas from './ImageCanvas.tsx'
import { useState } from 'react'

export default function Editor() {
  const [imageData, setImageData] = useState<string | null>(null)

  return (
    <main className="bg-gray-200 min-h-screen flex flex-col">
      <Header
        onImageSelect={(image) => setImageData(image)}
        pickedColorValue="#fff"
      />
      <ImageCanvas imageData={imageData} />
    </main>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Image as KonvaImage, Layer, Stage } from 'react-konva'
import { debounce } from 'lodash'
import Konva from 'konva'

interface ImageCanvasProps {
  imageData: string | null
}

const DEBOUNCE_DELAY = 200
const CONTAINER_PADDING = 20

export default function ImageCanvas({ imageData }: Readonly<ImageCanvasProps>) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null
  )
  const [canvasSize, setCanvasSize] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<Konva.Stage | null>(null)

  const calculateCanvasSize = useCallback(() => {
    if (!imageElement || !containerRef.current) return
    if (imageElement.width === 0 || imageElement.height === 0) {
      throw new Error('Image dimension assertion failed.')
    }

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const aspectRatio = imageElement.width / imageElement.height

    let newWidth = containerWidth
    let newHeight = newWidth / aspectRatio

    // Adjust if height exceeds containerHeight
    if (newHeight > containerHeight) {
      newHeight = containerHeight
      newWidth = newHeight * aspectRatio
    }

    // Adjust if width exceeds containerWidth (after previous adjustment)
    if (newWidth > containerWidth) {
      newWidth = containerWidth
      newHeight = newWidth / aspectRatio
    }

    setCanvasSize({
      width: newWidth - CONTAINER_PADDING,
      height: newHeight - CONTAINER_PADDING,
    })
  }, [imageElement])

  useEffect(() => {
    if (!imageData) return

    // Load image and set canvas size
    const img = new window.Image()
    img.src = imageData
    img.onload = () => {
      if (img.width === 0 || img.height === 0) {
        console.warn('Cannot load image: unable to determine image dimensions.')
        return
      }

      setImageElement(img)
      calculateCanvasSize()
    }

    return () => {
      img.onload = null
    }
  }, [calculateCanvasSize, imageData])

  useEffect(() => {
    if (!imageElement) return

    // Update canvas size on resize
    const handleResize = debounce(calculateCanvasSize, DEBOUNCE_DELAY)

    window.addEventListener('resize', handleResize)

    // Initial resize to set the correct size when mounting
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      handleResize.cancel()
    }
  }, [calculateCanvasSize, imageElement])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center w-screen h-screen"
    >
      {imageElement ? (
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          ref={stageRef}
        >
          <Layer>
            <KonvaImage
              image={imageElement}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </Layer>
        </Stage>
      ) : (
        <p className="font-semibold text-gray-400 select-none">
          Please select a file
        </p>
      )}
    </div>
  )
}

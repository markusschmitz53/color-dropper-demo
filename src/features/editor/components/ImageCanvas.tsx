import { useCallback, useEffect, useRef, useState } from 'react'
import { Image as KonvaImage, Layer, Stage } from 'react-konva'
import { debounce, throttle } from 'lodash'
import Konva from 'konva'
import { calculateAspectRatioFit, rgbToHex } from '../../../utils/ImageUtils.ts'

interface ImageCanvasProps {
  imageData: string | null
  onColorPick: (color: string) => void
}

const THROTTLE_DELAY = 200
const DEBOUNCE_DELAY = 200
const CONTAINER_PADDING = 20

export default function ImageCanvas({
  imageData,
  onColorPick,
}: Readonly<ImageCanvasProps>) {
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
  const imageNodeRef = useRef<Konva.Image | null>(null)

  const calculateCanvasSize = useCallback(() => {
    if (!imageElement || !containerRef.current) return
    if (imageElement.width === 0 || imageElement.height === 0) {
      throw new Error('Image dimension assertion failed.')
    }

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    const { width, height } = calculateAspectRatioFit(
      imageElement.width,
      imageElement.height,
      containerWidth,
      containerHeight,
      CONTAINER_PADDING
    )

    setCanvasSize({
      width,
      height,
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

  const handleMouseMove = throttle(() => {
    if (!imageElement || !stageRef.current || !imageNodeRef.current) return

    const stage = stageRef.current.getStage()
    const pointerPosition = stage.getPointerPosition()

    if (!pointerPosition) {
      console.warn('Failed to retrieve pointer position vector.')
      return
    }

    const { x, y } = pointerPosition

    // check if the pointer is within the canvas
    if (x < 0 || y < 0 || x > canvasSize.width || y > canvasSize.height) {
      return
    }

    const context = imageNodeRef?.current.getLayer()?.getContext()
    if (!context) {
      console.warn('Failed to retrieve context.')
      return
    }
    const pixel = context.getImageData(x, y, 1, 1).data
    const hexColor = rgbToHex(pixel)
    onColorPick(hexColor)
  }, THROTTLE_DELAY)

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
          onMouseMove={handleMouseMove}
        >
          <Layer>
            <KonvaImage
              image={imageElement}
              width={canvasSize.width}
              height={canvasSize.height}
              ref={imageNodeRef}
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

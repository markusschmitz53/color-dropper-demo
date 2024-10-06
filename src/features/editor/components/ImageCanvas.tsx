import { useCallback, useEffect, useRef, useState } from 'react'
import { Image as KonvaImage, Layer, Stage } from 'react-konva'
import { throttle } from 'lodash'
import Konva from 'konva'
import {
  calculateAspectRatioFit,
  extractMatrixColors,
  rgbToHex,
} from '../../../utils/ImageUtils.ts'
import MagnifierOverlay from './MagnifierOverlay.tsx'

interface ImageCanvasProps {
  imageData: string | null
  onColorPick: (color: string) => void
  isContained: boolean
  isDropperActive: boolean
}

const THROTTLE_DELAY = 200
const CONTAINER_PADDING = 20
const MATRIX_SIZE = 17
const MATRIX_SIDE = 8

export default function ImageCanvas({
  imageData,
  onColorPick,
  isContained,
  isDropperActive,
}: Readonly<ImageCanvasProps>) {
  const [matrixColors, setMatrixColors] = useState<string[][]>([])
  const [currentHexColor, setCurrentHexColor] = useState<string | null>(null)
  const [magnifierPosition, setMagnifierPosition] = useState<{
    x: number
    y: number
  } | null>(null)
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

    if (isContained) {
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
    } else {
      setCanvasSize({
        width: imageElement.width,
        height: imageElement.height,
      })
    }
  }, [isContained, imageElement])

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

  const handleMouseClick = () => {
    if (currentHexColor) {
      onColorPick(currentHexColor) // Emit the selected color on click
    }
  }

  const handleMouseMove = throttle(() => {
    if (
      !isDropperActive ||
      !imageElement ||
      !stageRef.current ||
      !imageNodeRef.current
    )
      return

    const stage = stageRef.current.getStage()
    const pointerPosition = stage.getPointerPosition()

    if (!pointerPosition) {
      console.warn('Failed to retrieve pointer position vector.')
      return
    }

    const { x, y } = pointerPosition

    // Check if the pointer is within the canvas
    if (x < 0 || y < 0 || x > canvasSize.width || y > canvasSize.height) {
      return
    }

    const context = imageNodeRef?.current.getLayer()?.getContext()
    if (!context) {
      console.warn('Failed to retrieve context.')
      return
    }

    // Define the region to be extracted
    const regionX = x - MATRIX_SIDE
    const regionY = y - MATRIX_SIDE
    const regionWidth = MATRIX_SIZE
    const regionHeight = MATRIX_SIZE

    const imageData = context.getImageData(
      Math.max(regionX, 0),
      Math.max(regionY, 0),
      Math.min(regionWidth, canvasSize.width - regionX),
      Math.min(regionHeight, canvasSize.height - regionY)
    )

    const colors = extractMatrixColors(
      imageData.data,
      regionWidth,
      regionHeight,
      canvasSize.width,
      canvasSize.height,
      regionX,
      regionY
    )
    setMatrixColors(colors)

    // Set the current hex color for the central pixel
    const centerIndex = (MATRIX_SIDE * regionWidth + MATRIX_SIDE) * 4
    const centerColor = rgbToHex(
      imageData.data[centerIndex],
      imageData.data[centerIndex + 1],
      imageData.data[centerIndex + 2]
    )
    setCurrentHexColor(centerColor)

    setMagnifierPosition({ x: x - window.scrollX, y: y - window.scrollY })
  }, THROTTLE_DELAY)

  return (
    <div ref={containerRef} className="flex-1 w-screen h-screen relative">
      {imageElement ? (
        <>
          <Stage
            width={canvasSize.width}
            height={canvasSize.height}
            ref={stageRef}
            onMouseMove={handleMouseMove}
            onClick={handleMouseClick}
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
          {isDropperActive && magnifierPosition && (
            <MagnifierOverlay
              matrixColors={matrixColors}
              position={magnifierPosition}
            />
          )}
        </>
      ) : (
        <p className="font-semibold text-gray-400 select-none">
          Please select a file
        </p>
      )}
    </div>
  )
}

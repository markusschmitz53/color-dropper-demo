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

    let { x, y } = pointerPosition

    // Check if the pointer is within the canvas
    if (x < 0 || y < 0 || x > canvasSize.width || y > canvasSize.height) {
      return
    }

    const context = imageNodeRef?.current.getLayer()?.getContext()
    if (!context) {
      console.warn('Failed to retrieve context.')
      return
    }

    // retrieve the pixel data for magnified region
    const regionX = Math.max(x - MATRIX_SIDE, 0)
    const regionY = Math.max(y - MATRIX_SIDE, 0)
    const regionWidth = Math.min(MATRIX_SIZE, canvasSize.width - regionX)
    const regionHeight = Math.min(MATRIX_SIZE, canvasSize.height - regionY)

    const imageData = context.getImageData(
      regionX,
      regionY,
      regionWidth,
      regionHeight
    )
    const data = imageData.data

    const colors = extractMatrixColors(data, regionWidth, regionHeight)
    setMatrixColors(colors)

    const centerIndex =
      (MATRIX_SIDE * regionWidth + MATRIX_SIDE) * (MATRIX_SIDE / 2)
    const centerColor = rgbToHex(
      data[centerIndex],
      data[centerIndex + 1],
      data[centerIndex + 2]
    )
    onColorPick(centerColor)

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

export const rgbClampedToHex = (pixel: Uint8ClampedArray): string => {
  // @see https://stackoverflow.com/a/5624139
  return `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
    .toString(16)
    .slice(1)}`
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  // @see https://stackoverflow.com/a/5624139
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export const extractMatrixColors = (
  data: Uint8ClampedArray,
  regionWidth: number,
  regionHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  startX: number,
  startY: number
): string[][] => {
  return Array.from({ length: regionHeight }, (_, i) =>
    Array.from({ length: regionWidth }, (_, j) => {
      const currentX = startX + j
      const currentY = startY + i

      // Check if current pixel is out of bounds
      if (
        currentX < 0 ||
        currentY < 0 ||
        currentX >= canvasWidth ||
        currentY >= canvasHeight
      ) {
        return '#ffffff' // Out-of-bounds pixels are white
      }

      const index = (i * regionWidth + j) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      return rgbToHex(r, g, b)
    })
  )
}

interface Dimensions {
  width: number
  height: number
}

export const calculateAspectRatioFit = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number = 0
): Dimensions => {
  const aspectRatio = imageWidth / imageHeight

  let newWidth = containerWidth
  let newHeight = newWidth / aspectRatio

  if (newHeight > containerHeight) {
    newHeight = containerHeight
    newWidth = newHeight * aspectRatio
  }

  if (newWidth > containerWidth) {
    newWidth = containerWidth
    newHeight = newWidth / aspectRatio
  }

  return {
    width: newWidth - padding,
    height: newHeight - padding,
  }
}

import '../styles/MagnifierOverlay.css'

interface MagnifierOverlayProps {
  matrixColors: string[][]
  position: { x: number; y: number } | null
}

export default function MagnifierOverlay({
  matrixColors,
  position,
}: Readonly<MagnifierOverlayProps>) {
  if (!position) return null
  const centerColor = matrixColors[8][8]

  // set picker position and make up for the size of the picker
  const pickerDynamicStyle = {
    transform: `translate(${position.x - 90}px, ${position.y - 90}px)`, // todo: calculate adjusted position in service
    borderColor: centerColor, // Dynamic border color set to the center pixel color
  }

  return (
    <div className="dropper-wrap">
      <div className="dropper-picker" style={pickerDynamicStyle}>
        <div className="dropper-matrix">
          <div className="eye-dropper-tooltip bg-gray-700 text-white px-2 py-1 rounded-md text-sm absolute top-[calc(50%+20px)] left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
            {matrixColors[8][8]}
          </div>
          {matrixColors.map((row, rowIndex) =>
            row.map((color, colIndex) => {
              const pixelDynamicStyle = {
                backgroundColor: color,
              }
              const pixelClassName = `dropper-matrix-pixel${rowIndex === 8 && colIndex === 8 ? ' center' : ''}`
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={pixelClassName}
                  style={pixelDynamicStyle}
                  data-testid="cube"
                ></div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

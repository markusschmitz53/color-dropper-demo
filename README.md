# color-dropper-demo

This is a demo project for a color dropper tool that allows users to pick a color from an image. 
The project is built with React, TypeScript, and Konva.js.

## How to run
1. Clone the repository
2. Install pnpm if you haven't already: https://pnpm.io/installation
3. Run `pnpm install`
4. Run `pnpm dev`
5. Open `http://localhost:5173/` in your browser

## Task

The goal was to create a color dropper as part of an online photo editor tool, featuring:
1) Image selection from the local machine.
2) Display of the selected image on a canvas.
3) Color picking from the displayed image.

## Requirements
- The app should support a canvas of at least 16 MB (4000 x 4000 pixels).
- Built with TypeScript and canvas.
- Functionality and performance are prioritized over UI aesthetics.
- The color dropper displays the hex code of the color in a circle on hover.
- The circle's border changes to match the hovered color and zooms into the area.
- The circle acts as a magnifying glass.
- Dropper functionality is activated by clicking an icon in the header.
- On color pick, the hex code is displayed in the header.


## Prerequisites and Considerations
- Built with React and Vite for speed and flexibility, aligning with the job requirements.
- The task description mentions 'hovering over an area,' implying a focus on mouse interactions. Therefore, touch and mobile support are currently out of scope.
- I will mimic the behaviour of the color dropper within the Picsart editor which displays a 17x17 pixel matrix around the current mouse position.
- The task suggested to 'Imagine you’re a part of Picsart’s Software Engineering team,' which inspired the choice of Konva.js due to its relevance and efficiency, as it is used by Picsart.
- As this is only a demo project, changes will be committed to main instead of applying any branching model.
- Routing is not required as well as i18n.

## Existing libraries / References
https://github.com/motorlatitude/Drop
https://github.com/konvajs/react-konva
https://github.com/casesandberg/react-color

## Browser Support
Currently only tested in Chrome.
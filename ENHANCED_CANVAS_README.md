# Enhanced Text Canvas Editor

A React component that provides an enhanced canvas editor for text and images with advanced manipulation features.

## Features

### Image Manipulation
- **Hover Borders**: Images show blue borders when hovered or selected
- **Resize Handles**: 4 corner handles (3 dots each) for resizing images
- **Rotation Control**: 
  - Top rotation icon for 90° right rotation
  - Toolbar controls for left/right rotation
- **Drag & Drop**: Click and drag images to reposition them
- **Aspect Ratio**: Maintains image aspect ratio during resizing

### Text Features
- **Add Text**: Click "Add Text" button to add editable text
- **Text Editing**: Double-click text or use edit button to modify content
- **Text Rotation**: Rotate text in 10° increments
- **Font Size**: Increase/decrease font size
- **Drag & Drop**: Click and drag text to reposition

### Canvas Features
- **Zoom Control**: Slider to zoom canvas from 0.1x to 3x
- **Download**: Export canvas as PNG image
- **White Background**: Clean white background for better visibility

## Usage

1. Navigate to `/EnhancedTextCanvasEditor` route
2. Upload images using the "Upload Image" button
3. Add text using the "Add Text" button
4. Hover over images to see borders and controls
5. Use resize handles to resize images
6. Use rotation controls to rotate images and text
7. Drag elements to reposition them
8. Use zoom slider to adjust canvas view
9. Download your creation as an image

## Controls

### Image Controls (appear on hover/selection)
- **Blue Border**: Shows when image is hovered or selected
- **Resize Handles**: 4 corner dots for resizing
- **Rotation Icon**: Top blue circle for 90° right rotation
- **Toolbar**: Full control panel with rotate, resize, reupload, and delete options

### Text Controls (appear on selection)
- **Edit**: Modify text content
- **Rotate Left/Right**: Rotate text in 10° increments
- **Size**: Increase/decrease font size
- **Delete**: Remove text from canvas

## Technical Details

- Built with React hooks (useState, useRef, useEffect)
- Canvas-based rendering for smooth performance
- Responsive design with CSS classes
- Mouse event handling for drag, resize, and hover
- Image aspect ratio preservation during resizing
- 360-degree rotation support for images

## File Structure

- `src/EnhancedTextCanvasEditor.js` - Main component
- `src/EnhancedTextCanvasEditor.css` - Styling
- `src/Router.js` - Route configuration

## Dependencies

- React
- react-icons (for UI icons)
- Standard browser APIs (Canvas, File API)

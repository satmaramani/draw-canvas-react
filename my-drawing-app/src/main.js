import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import CanvasDrawingApp from "./canvas.js";

document.querySelector('#app').innerHTML = `
  <div>
    <CanvasDrawingApp />
    
`

setupCounter(document.querySelector('#counter'))

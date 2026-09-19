import { createCanvasWeather } from './courtyard-canvas';
// One visual implementation, including animal and leaf motion, on all devices.
export function createCourtyardWeather(canvas,image,onFailure,plates={}) {
  return createCanvasWeather(canvas,image,onFailure,plates);
}

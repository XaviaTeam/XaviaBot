import canvas from 'canvas';

//function to circle an image and return it
function circle(image, x, y, radius) {
    const tempCanvas = new canvas(image.width, image.height);
    const ctx = tempCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, 0, 0);
    return canvas;
}

export default circle;
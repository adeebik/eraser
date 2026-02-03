export default function initDraw(canvasRef: HTMLCanvasElement) {
  const canvas = canvasRef;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let clicked = false;
  let startx = 0;
  let starty = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startx = e.clientX;
    starty = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.clientX - startx;
      const height = e.clientY - starty;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "white";
      ctx.strokeRect(startx, starty, width, height);
    }
  });
}

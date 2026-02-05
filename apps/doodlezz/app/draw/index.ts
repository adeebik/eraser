// import { Shape, ShapeType } from "@/types/types";
// import { BE_URL } from "../../config/config";
// import axios from "axios";
// import { getExistingShapes } from "./http";

// export async function initDraw(
//   canvasRef: HTMLCanvasElement,
//   roomId: string,
//   socket: WebSocket,
//   selectedTool: ShapeType,
// ) {
//   let existingShapes: Shape[] = await getExistingShapes(roomId);

//   const canvas = canvasRef;
//   const ctx = canvas.getContext("2d");

//   if (!ctx) {
//     return;
//   }

//   socket.onmessage = (ev) => {
//     const receivedMsg = JSON.parse(ev.data);
//     console.log(receivedMsg);

//     if (receivedMsg.type === "chat") {
//       const parsedShape = JSON.parse(receivedMsg.payload.text);
//       existingShapes.push(parsedShape);
//       clearCanvas(existingShapes, canvas, ctx);
//     }
//   };

//   clearCanvas(existingShapes, canvas, ctx);

//   let clicked = false;
//   let startX = 0;
//   let startY = 0;

//   canvas.addEventListener("mousedown", (e) => {
//     clicked = true;
//     startX = e.clientX;
//     startY = e.clientY;
//   });

//   canvas.addEventListener("mouseup", (e) => {
//     clicked = false;
//     const width = e.clientX - startX;
//     const height = e.clientY - startY;

//     let shape : Shape | null = null
//     if (selectedTool === ShapeType.RECT) {
//       shape = {
//         type: selectedTool,
//         x: startX,
//         y: startY,
//         height: height,
//         width: width,
//       };
      
//     } else if (selectedTool === ShapeType.CIRCLE) {
//       shape = {
//         type: ShapeType.CIRCLE,
//         x: startX,
//         y: startY,
//         height: height,
//         width: width,
//       };

//     } else if (selectedTool === ShapeType.PENCIL) {
//       shape = {
//         type: ShapeType.PENCIL,
//         startX: startX,
//         startY: startY,
//         endX: height,
//         endY: width,
//       };
//     } else if (selectedTool === ShapeType.Eraser) {
//       shape = {
//         type: ShapeType.Eraser,
//         startX: startX,
//         startY: startY,
//         endX: height,
//         endY: width,
//       };
//     }

//     if (!shape){
//       return
//     }

//     existingShapes.push(shape);

//     socket.send(
//       JSON.stringify({
//         type: "chat",
//         payload: {
//           message: JSON.stringify(shape),
//           roomId: roomId,
//         },
//       }),
//     );
//   });

//   canvas.addEventListener("mousemove", (e) => {
//     if (clicked) {
//       const width = e.clientX - startX;
//       const height = e.clientY - startY;

//       clearCanvas(existingShapes, canvas, ctx);

//       ctx.strokeStyle = "white";
//       if(selectedTool === ShapeType.RECT){
//         ctx.strokeRect(startX, startY, width, height);
//       }else if (selectedTool === ShapeType.CIRCLE){
//         drawCircle(ctx, startX, startY, width, height)
//       }
      

//     }
//   });
// }

// function clearCanvas(
//   existingShapes: Shape[],
//   canvas: HTMLCanvasElement,
//   ctx: CanvasRenderingContext2D,
// ) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "black";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   existingShapes.map((s)=>{
//     if (s.type === ShapeType.RECT) {
//       ctx.strokeStyle = "white";
//       ctx.strokeRect(s.x, s.y, s.width, s.height);
//     } else if (s.type === ShapeType.CIRCLE){
//       ctx.strokeStyle = "white";
//       drawCircle(ctx, s.x, s.y, s.width, s.height)
//     }
//   })
// }


// function drawCircle( ctx : CanvasRenderingContext2D, startX:number, startY:number, width:number, height:number ) {
//   var kappa = 0.5522848,
//   ox = (width / 2) * kappa, // control point offset horizontal
//   oy = (height / 2) * kappa, // control point offset vertical
//   xe = startX + width, // x-end
//   ye = startY + height, // y-end
//   xm = startX + width / 2, // x-middle
//   ym = startY + height / 2; // y-middle

//   ctx.beginPath();
//   ctx.moveTo(startX, ym);
//   ctx.bezierCurveTo(startX, ym - oy, xm - ox, startY, xm, startY);
//   ctx.bezierCurveTo(xm + ox, startY, xe, ym - oy, xe, ym);
//   ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
//   ctx.bezierCurveTo(xm - ox, ye, startX, ym + oy, startX, ym);
//   // ctx.closePath(); // not used correctly, see comments (use to close off open path)
//   ctx.stroke();
// }
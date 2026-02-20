import { CanvasPage } from "@/app/components/CanvasPage";
import { BE_URL } from "@/config/config";
import axios from "axios";
import { redirect } from "next/navigation";

export default async function Canvas({ params} :{ params: Promise<{ slug: string }> }) {
  const {slug} =  await params;
  let roomId: string | null = null;
 
  // local storage is only accesible on the client side, 
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`${BE_URL}/room/roomId/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    roomId = res.data.roomId;
  } catch (error: any) {
    console.error("Failed to fetch roomId:", error.response?.data || error.message);
  }

  if (!roomId) {
    redirect("/dashboard");
  }

  return <CanvasPage slug={slug} roomId={roomId} />;
}

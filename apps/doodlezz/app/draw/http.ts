import { BE_URL } from "@/config/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BE_URL}/content/chats/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = res.data.response;
    console.log(data);

    const shapes = data.map((x: { message: any }) => {
      const messageData = JSON.parse(x.message);
      return messageData;
    });

    return shapes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

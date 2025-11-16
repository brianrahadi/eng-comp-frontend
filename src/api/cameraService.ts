import axios from "axios";
import type { Camera } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function getCameras(): Promise<Camera[]> {
  const { data } = await axios.get<Camera[]>(`${API_URL}/api/cameras`);
  return data;
}


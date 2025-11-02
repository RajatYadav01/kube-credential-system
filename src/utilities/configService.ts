import axios from "axios";

export async function getConfig() {
  try {
    const response = await axios.get("/config/config.json");
    return response.data;
  } catch (error) {
    console.error("Error loading config:", error);
    return {};
  }
}

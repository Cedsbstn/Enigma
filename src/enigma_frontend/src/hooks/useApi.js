import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { addMessageToConversation } from "../utils/chat";
import { decryptData } from "../utils/encryptData";
import Together from "together-ai";

const useApi = () => {
  const [data, setData] = useState("");
  const [chatMessage, setChatMessage] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Function to get and decrypt the API key
  const OPEN_AI_API_KEY = () => {
    const encryptedApiKey = localStorage.getItem("icp-dai-open-ai");
    if (!encryptedApiKey) {
      throw new Error("API key not found in localStorage.");
    }
    const apiKey = decryptData(encryptedApiKey);
    if (!apiKey) {
      throw new Error("Failed to decrypt API key.");
    }
    return apiKey;
  };

  let together;
  try {
    const apiKey = OPEN_AI_API_KEY();
    together = new Together({ apiKey });
  } catch (err) {
    setError(err.message);
    console.error(err);
    toast.error(err.message);
    return {
      data,
      error,
      loading,
      chatCompletion: () => {},
      uploading,
      setData,
      chatMessage,
      setChatMessage
    };
  }

  const chatCompletion = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await addMessageToConversation(payload.at(-1));
      const response = await together.chat.completions.create({
        messages: payload.map((message) => ({
          content: message.content,
          role: message.role || "user"
        })),
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        max_tokens: 8192,
        temperature: 0.2,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ["\n"],
        stream: false // Set to false for simplicity, handle streaming if needed
      });

      if (!response.ok) {
        const result = await response.json();
        const message = result.error?.message || "An error occurred";
        toast.error(message);
        throw new Error(message);
      }

      const result = await response.json();
      setData(result.choices[0].message.content);
      setChatMessage((prevMessages) => [...prevMessages, result.choices[0].message]);
    } catch (error) {
      setLoading(false);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debugging: Log the contents of localStorage
  console.log("localStorage contents:", localStorage.getItem("icp-dai-open-ai"));

  return {
    data,
    error,
    loading,
    chatCompletion,
    uploading,
    setData,
    chatMessage,
    setChatMessage
  };
};

export default useApi;

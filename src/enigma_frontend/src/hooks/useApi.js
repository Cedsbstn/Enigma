import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { addMessageToConversation } from "../utils/chat";
import { decryptData } from "../utils/encryptData";
import Together from "together-ai";

const useApi = () => {
  const [data, setData] = useState("");
  const [chatMessage, setChatMessage] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const together = new Together({ apiKey: decryptData(localStorage.getItem("icp-dai-open-ai")) });
  
  const chatCompletion = useCallback(async (payload) => {
    const url = "https://api.together.xyz/v1/chat/completions";
    setLoading(true);
    try {
      await addMessageToConversation(payload.at(-1));
      const response = await together.chat.completions.create({
          messages: payload.map((message) => ({
            role: message.role || "user",
            content: message.content,
          })),
          model: "Qwen/Qwen2.5-Coder-32B-Instruct",
          max_tokens: 8192,
          temperature: 0.2,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1,
          stop: ["<|im_end|>"],
          stream: true
      });

      const result = await response.json();

      if (response.status !== 200) {
        const message = result.error.message;
        toast.error(message);
        throw new Error(message);
      }
    }
    catch (error) {
      setLoading(false);
      setError(error);
    }
  }, [])

  return {
    data,
    error,
    loading,
    chatCompletion,
    uploading,
    setData,
    chatMessage,
    setChatMessage
  }
};

export default useApi;

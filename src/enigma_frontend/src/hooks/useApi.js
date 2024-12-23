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

  const TOGETHER_API_KEY = () =>
    decryptData(localStorage.getItem("icp-dai-open-ai"));

  const chatCompletion = useCallback(async (payload) => {
    let together;
    try {
      const apiKey = TOGETHER_API_KEY();
      together = new Together({ apiKey });
      setLoading(true);
      await addMessageToConversation(payload.at(-1));
      const result = await together.chat.completions.create({
        messages: payload.map((message) => ({
          content: message.content,
          role: message.role,
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

      if (!result.ok) {
        const message = result.error.message;
        toast.error(message);
        throw new Error(message);
      }

      const assistantContent = result.choices[0].message.content;
      const messageToSaveFromAssistant = {
        content: assistantContent,
        role: "assistant",
      };
      setChatMessage((prev) => [...prev, messageToSaveFromAssistant]);
      await addMessageToConversation(messageToSaveFromAssistant);
      setData(assistantContent);
      setError(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }, []);

  return {
    data,
    error,
    loading,
    chatCompletion,
    setData,
    chatMessage,
    setChatMessage,
  };
};

export default useApi;

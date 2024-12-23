import React, { useState } from "react";
import useApi from "../hooks/useApi";
import Loading from "./Loading";
import { useEffect } from "react";
import { login, logout } from "../utils/auth";
import toast from "react-hot-toast";
import { getConversation } from "../utils/chat";
import TextInput from "./TextInput";
import { encryptData } from "../utils/encryptData";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [togetherKey, settogetherKey] = useState("");
  const { loading, chatCompletion, chatMessage, setChatMessage } = useApi();

  const updateChatMessage = async () => {
    if (window.auth.principalText && window.auth.isAuthenticated) {
      const conversation = await getConversation(window.auth.principalText);
      console.log(conversation);
      if (conversation) {
        setChatMessage(conversation.conversation);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.auth.isAuthenticated) {
      toast.error("You are not authenticated");
      return;
    }

    const togetherKey = localStorage.getItem("icp-dai-open-ai");
    if (!togetherKey) {
      toast.error("No together key found");
      return;
    }

    if (question) {
      const history = [...chatMessage, { content: question, role: "user" }];
      setChatMessage(() => [...history]);
      await chatCompletion(history);
      setQuestion("");
    }
  };

  useEffect(() => {
    updateChatMessage();
  }, []);

  const onValidatetogetherAPI = (e) => {
    if (e.target.value.match(/^[a-zA-Z0-9]+$/)) {
      settogetherKey(e.target.value);
    } else {
      settogetherKey("");
    }
  };

  const onSavetogetherKey = () => {
    if (!togetherKey) return toast.error("Invalid together key");
    const encryptedApiKey = encryptData(togetherKey);
    localStorage.setItem("icp-dai-open-ai", encryptedApiKey);
    toast.success("together key successfully saved and crypted");
    settogetherKey("");
  };

  return (
    <div className="wrapper">
      <div className="wrapper-header">
        <h1>Dai</h1>
        <button
          className="auth-button auth-button__hover"
          onClick={() => (window.auth.isAuthenticated ? logout() : login())}
        >
          {window.auth.isAuthenticated ? "Log out" : "Login"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <TextInput
          onChange={onValidatetogetherAPI}
          placeholder="Pass your together API key here..."
        />
        <button
          className="auth-button auth-button__hover"
          onClick={onSavetogetherKey}
        >
          Save
        </button>
      </div>
      <div className="container">
        <div className="right">
          <div className="chat active-chat">
            <div className="conversation-start"></div>
            {chatMessage.map((message, index) => (
              <div
                key={index}
                className={`bubble ${
                  message.role === "user" ? "me" : "assistant"
                } ${
                  chatMessage.length - 1 === index && !loading
                    ? "last-message"
                    : ""
                }
                `}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className={`bubble assistant`}>
                <Loading />
              </div>
            )}
          </div>
          <div className="write">
            <input
              placeholder="Ask me..."
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
            />
            {loading && <Loading />}
            {!loading && (
              <a
                onClick={(e) => {
                  handleSubmit(e);
                }}
                className="write-link send"
              ></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

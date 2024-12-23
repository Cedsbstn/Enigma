import { localStorageController } from "./localStorageController";

const baseUrl = "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943";
const endpoints = {
  createConversation: "conversation",
  addMessageToConversation: "add/conversation",
  getConversation: (userIdentity) => `conversation/${userIdentity}`,
  deleteConversation: (userIdentity) => `conversation/${userIdentity}`,
};

// Function to create headers without Authorization
function createHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

// Function to handle fetch requests
async function fetchData(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Re-throw the error for further handling if needed
  }
}

export async function createConversation(userIdentity) {
  const headers = createHeaders();

  const response = await fetchData(`${baseUrl}/${endpoints.createConversation}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ userIdentity }),
  });

  return response;
}

export async function getConversation(userIdentity) {
  const headers = createHeaders();

  const response = await fetchData(`${baseUrl}/${endpoints.getConversation(userIdentity)}`, {
    headers,
  });

  return response;
}

export async function addMessageToConversation(message) {
  const headers = createHeaders();

  const userIdentity = window.auth.principalText;
  const conversationId = localStorageController("conversation")?.id;

  const response = await fetchData(`${baseUrl}/${endpoints.addMessageToConversation}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userIdentity,
      conversationId,
      message,
    }),
  });

  return response;
}

export async function deleteConversation(userIdentity) {
  const headers = createHeaders();

  const response = await fetchData(`${baseUrl}/${endpoints.deleteConversation(userIdentity)}`, {
    method: "DELETE",
    headers,
  });

  return response;
}

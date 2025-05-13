import React, { useState, useRef, useEffect } from "react";
import AI_incon from './images/ai_image.jpg';
import { getLangchainResponse } from "./langchain.jsx";

const ChatWidget = () => {
  const [userMessage, setUserMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const predefinedResponses = {
    "How do I sell my license?": "To sell your license, upload it to SoftSell and we'll give you a quote.",
    "How fast is the process?": "You'll get paid within a few days.",
    "What types of licenses can I sell?": "We accept software licenses including productivity tools, antivirus, design software, and more.",
    "Is there any fee involved?": "There are no upfront fees. We only deduct a small commission after the sale.",
    "How do I get paid?": "Payments are made via bank transfer or PayPal, whichever you prefer.",
    "Is it legal to resell software licenses?": "Yes, reselling licenses is legal as long as they are original and transferable.",
    "Can I track my license status?": "Yes, once submitted, you can track the status on your dashboard in real-time.",
  };

  const handleSendMessage = async () => {
    if (userMessage.trim()) {
      setResponses((prev) => [...prev, { type: "user", message: userMessage }]);

      if (predefinedResponses[userMessage]) {
        setResponses((prev) => [
          ...prev,
          { type: "bot", message: predefinedResponses[userMessage] },
        ]);
      } else {
        await getAIResponse(userMessage);
      }

      setUserMessage("");
    }
  };

  const getAIResponse = async (message) => {
    try {
      setLoading(true);
      const aiMessage = await getLangchainResponse(message);
      setResponses((prev) => [...prev, { type: "bot", message: aiMessage }]);
    } catch (error) {
      console.error("Langchain error:", error);
      setResponses((prev) => [
        ...prev,
        { type: "bot", message: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses]);

  return (
    <>
      {!isOpen && (
        <button
          className="fixed bottom-5 right-5 bg-[#1A73E8] p-4 rounded-full shadow-lg hover:bg-[#155ACF] transition z-50 animate-bounce-slow"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={AI_incon}
            alt="AI Icon"
            className="w-14 h-14 rounded-full shadow-md transition-transform duration-500 hover:scale-110"
          />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-xl w-full max-w-sm h-[500px] flex flex-col p-3 border">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Ask SoftSell AI</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-xl"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mb-2">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring"
                rows="2"
                placeholder="Type your question..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-3 py-2 mt-1 rounded-md w-full text-sm hover:bg-blue-700"
              >
                Send
              </button>
            </div>

            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              {Object.keys(predefinedResponses).map((q, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    setResponses((prev) => [...prev, { type: "user", message: q }]);

                    if (predefinedResponses[q]) {
                      setResponses((prev) => [
                        ...prev,
                        { type: "bot", message: predefinedResponses[q] },
                      ]);
                    } else {
                      await getAIResponse(q);
                    }
                  }}
                  className="bg-gray-200 hover:bg-blue-100 text-gray-700 px-2 py-1 rounded-md transition"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-2 border rounded mb-2">
              {responses.map((res, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${res.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {res.type === "bot" && (
                    <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-2">
                      🤖
                    </div>
                  )}
                  <div
                    className={`p-2 rounded-md text-sm max-w-[75%] ${
                      res.type === "user" ? "bg-gray-200 text-right" : "bg-blue-100 text-left"
                    }`}
                  >
                    {res.message}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-2">
                    🤖
                  </div>
                  <div className="bg-blue-100 text-left p-2 rounded-md text-sm">
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
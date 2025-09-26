import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { MessageCircle, Send, Bot, User, X } from "lucide-react";

export const HealthChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi! I can help with medical questions and symptoms. Please describe what you're experiencing.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const analyzeSymptoms = async (symptoms) => {
    const medicalKeywords = [
      "pain",
      "ache",
      "fever",
      "headache",
      "cough",
      "cold",
      "flu",
      "sick",
      "hurt",
      "symptom",
      "medicine",
      "drug",
      "treatment",
      "doctor",
      "hospital",
      "health",
      "disease",
      "infection",
      "allergy",
      "nausea",
      "vomit",
      "diarrhea",
      "constipation",
      "fatigue",
      "tired",
      "dizzy",
      "rash",
      "swelling",
      "bleeding",
      "chest",
      "stomach",
      "back",
      "joint",
      "muscle",
      "throat",
      "nose",
      "ear",
      "eye",
      "skin",
      "breath",
      "heart",
      "blood",
      "pressure",
      "diabetes",
      "asthma",
    ];

    const isMedical = medicalKeywords.some((keyword) =>
      symptoms.toLowerCase().includes(keyword)
    );

    if (!isMedical) {
      return "Please ask medical questions only. I can help with symptoms, health concerns, and basic medical information.";
    }

    try {
      console.log("🔍 API Key present:", !!import.meta.env.VITE_GEMINI_API_KEY);
      console.log("📤 Sending request for symptoms:", symptoms);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful health assistant. Provide medical advice for: "${symptoms}". Include: 1) Possible causes 2) Self-care tips 3) When to see a doctor. Keep under 150 words and always recommend consulting a healthcare professional for proper diagnosis.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      console.log("📥 Response status:", response.status);
      console.log("✅ Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Full API response:", data);

        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("📝 Extracted result:", result);

        if (result && result.trim()) {
          console.log("✅ Returning API result");
          return result;
        } else {
          console.log("❌ No valid result found in response");
        }
      } else {
        console.log("❌ Response not ok, status:", response.status);
        const errorData = await response.text();
        console.log("❌ Error response:", errorData);
      }
    } catch (error) {
      console.error("❌ API Error:", error);
    }

    console.log("⚠️ API failed, using static responses");

    // Static fallback responses
    const lowerSymptoms = symptoms.toLowerCase();

    if (lowerSymptoms.includes("fever")) {
      if (lowerSymptoms.includes("100") || lowerSymptoms.includes("high")) {
        return "A 100°F fever indicates your body is fighting infection. Rest, drink plenty of fluids, and take fever reducers like acetaminophen. See a doctor if fever exceeds 101°F, lasts more than 3 days, or you have difficulty breathing, severe headache, or persistent vomiting.";
      }
      return "Fever is your body's natural response to infection. Rest, stay hydrated, and monitor your temperature. Consult a doctor if fever is high (above 101°F), persists more than 3 days, or you have concerning symptoms.";
    }

    if (lowerSymptoms.includes("cough")) {
      return "Cough can be due to cold, allergies, or respiratory irritation. Stay hydrated, use honey for throat relief, avoid smoke and irritants. See a doctor if cough persists over 2 weeks, produces blood, or causes breathing difficulties.";
    }

    if (lowerSymptoms.includes("headache")) {
      return "Headaches can result from stress, dehydration, or tension. Rest in a quiet, dark room, stay hydrated, apply cold or warm compress. Consult a doctor for severe, sudden, or frequent headaches.";
    }

    if (lowerSymptoms.includes("pain")) {
      return "Pain management depends on the cause and location. Rest the affected area, apply ice or heat as appropriate, and consider over-the-counter pain relievers. See a doctor for severe, persistent, or worsening pain.";
    }

    return "For your symptoms, ensure adequate rest, stay hydrated, and monitor your condition closely. Please consult a healthcare professional for proper diagnosis and personalized treatment advice.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const response = await analyzeSymptoms(userMessage);
    setMessages((prev) => [...prev, { type: "bot", text: response }]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="flex flex-col bg-white"
        style={{ width: "57.14vw", height: "460px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-white">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Health Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 bg-white">
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-64 bg-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    msg.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    {msg.type === "user" ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-muted p-2 rounded-lg text-sm">
                  Analyzing...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            For emergencies, call 108. This is not a substitute for professional
            medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

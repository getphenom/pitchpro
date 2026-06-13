import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles, Zap, Brain, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const projection = toolCall.display_projection || {};
  const isFinished = ["completed", "success", "failed", "error"].includes(
    toolCall.status
  );
  const isError =
    toolCall.status === "failed" ||
    toolCall.status === "error" ||
    (typeof toolCall.results === "string" &&
      /error|failed/i.test(toolCall.results));

  let statusIcon;
  if (isFinished) {
    statusIcon = isError ? "❌" : "✅";
  } else {
    statusIcon = "⏳";
  }

  const hideDetails = projection.hide_details && projection.details_redacted;
  let label;
  if (projection.label || projection.active_label || projection.error_label) {
    if (isError) {
      label = projection.error_label || projection.label;
    } else if (isFinished) {
      label = projection.label;
    } else {
      label = projection.active_label || projection.label;
    }
  } else {
    label = toolCall.name || "Working...";
  }

  return (
    <div className="mt-1 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{statusIcon}</span>
        <span>{label}</span>
      </button>
      {expanded && !hideDetails && (
        <div className="mt-1.5 p-2 rounded-lg bg-secondary/50 text-[11px] space-y-1">
          {toolCall.arguments_string && (
            <div>
              <span className="font-medium text-muted-foreground">Parameters:</span>
              <pre className="whitespace-pre-wrap break-all mt-0.5">
                {(() => {
                  try {
                    return JSON.stringify(
                      JSON.parse(toolCall.arguments_string),
                      null,
                      2
                    );
                  } catch {
                    return toolCall.arguments_string;
                  }
                })()}
              </pre>
            </div>
          )}
          {toolCall.results && (
            <div>
              <span className="font-medium text-muted-foreground">Result:</span>
              <pre className="whitespace-pre-wrap break-all mt-0.5">
                {(() => {
                  try {
                    const parsed =
                      typeof toolCall.results === "string"
                        ? JSON.parse(toolCall.results)
                        : toolCall.results;
                    return JSON.stringify(parsed, null, 2);
                  } catch {
                    return typeof toolCall.results === "string"
                      ? toolCall.results
                      : JSON.stringify(toolCall.results);
                  }
                })()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] font-semibold text-orange-400">Tactical Coach</span>
          </div>
        )}
        {message.content && (
          isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none text-sm [&_h2]:text-base [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-orange-400 [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:pl-4 [&_li]:text-xs [&_p]:text-xs [&_strong]:text-foreground">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )
        )}
        {message.tool_calls?.map((tc, idx) => (
          <ToolCallDisplay key={idx} toolCall={tc} />
        ))}
      </div>
    </div>
  );
}

export default function TacticalCoachChat({ profile }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef(null);

  // Load existing conversations
  const { data: conversations = [], refetch: refetchConvs } = useQuery({
    queryKey: ["tactical-coach-convs"],
    queryFn: () =>
      base44.agents.listConversations({ agent_name: "tactical_coach" }),
  });

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(
      conversationId,
      (data) => {
        setMessages(data.messages || []);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const startNewChat = async () => {
    setCreating(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "tactical_coach",
        metadata: {
          name: `Tactical Analysis — ${new Date().toLocaleDateString()}`,
          description: "Personalized tactical coaching session",
        },
      });
      setConversationId(conv.id);
      setMessages([]);
      refetchConvs();
    } catch (e) {
      // ignore
    }
    setCreating(false);
  };

  const selectConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setConversationId(full.id);
    setMessages(full.messages || []);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || loading) return;
    const conv = await base44.agents.getConversation(conversationId);
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conv, {
      role: "user",
      content: input.trim(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show conversation list or chat
  if (!conversationId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            🧠 Tactical Coach Agent
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">
          An AI coach that reviews your stats and recommends personalized drills and tactical strategies for your position.
        </p>

        {conversations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Previous Sessions
            </p>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium">
                      {conv.metadata?.name || "Tactical Session"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {conv.metadata?.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <Button
          onClick={startNewChat}
          disabled={creating}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Start Tactical Analysis
        </Button>
      </div>
    );
  }

  // Chat view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          🧠 Tactical Coach
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setConversationId(null)}
        >
          ← Back
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto space-y-3 pr-1 rounded-xl bg-background/50 border border-border p-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <Brain className="w-8 h-8 text-orange-400/50" />
            <p className="text-xs text-muted-foreground">
              Ask me to analyze your stats and recommend tactical drills!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span className="text-xs text-muted-foreground">Analyzing your stats...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Analyze my stats and recommend drills..."
          className="bg-secondary border-border text-sm"
          disabled={loading}
        />
        <Button
          size="icon"
          disabled={!input.trim() || loading}
          onClick={handleSend}
          className="bg-orange-600 hover:bg-orange-700 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
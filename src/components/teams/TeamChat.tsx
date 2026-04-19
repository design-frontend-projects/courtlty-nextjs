"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessage = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
};

export function TeamChat({
  teamId,
  currentUserId,
}: {
  teamId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, sender_id, content, created_at, profiles(first_name, last_name, avatar_url, email)")
        .eq("team_id", teamId)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data as ChatMessage[]);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`team_chat:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          const fetchNewMessageProfile = async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url, email")
              .eq("id", payload.new.sender_id)
              .single();

            setMessages((current) => [
              ...current,
              {
                ...(payload.new as Omit<ChatMessage, "profiles">),
                profiles: profile,
              },
            ]);
          };

          fetchNewMessageProfile();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, supabase]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      (viewport as HTMLElement).scrollTop = (viewport as HTMLElement).scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from("chat_messages").insert({
      team_id: teamId,
      sender_id: currentUserId,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="surface-panel rounded-[1.8rem] px-0 py-0">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <p className="section-kicker text-[0.68rem]">Team chat</p>
          <p className="text-sm text-muted-foreground">{messages.length} messages in this thread</p>
        </div>
      </div>

      <ScrollArea className="h-[28rem] px-5 py-5" ref={scrollRef}>
        <div className="grid gap-4 pr-3">
          {messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={`flex gap-3 ${mine ? "justify-end" : ""}`}>
                {!mine ? (
                  <Avatar className="mt-1 size-9 border border-border/70">
                    <AvatarImage src={message.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{message.profiles?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                ) : null}
                <div
                  className={`max-w-[80%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                    mine ? "bg-primary text-primary-foreground" : "bg-accent/30 text-foreground"
                  }`}
                >
                  <p className={`mb-1 text-xs ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {message.profiles?.first_name || message.profiles?.email?.split("@")[0] || "Player"}
                  </p>
                  <p>{message.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-3 border-t border-border/70 px-5 py-4">
        <Input
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          placeholder="Send a quick update to the squad"
          className="h-12 rounded-full"
        />
        <Button onClick={sendMessage} className="rounded-full px-5">
          Send
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Conversation } from "@/lib/types";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search } from "lucide-react";

export default function Messages() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  // Fetch messages for the selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/messages/${selectedConversation}`],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) return;
      return apiRequest("POST", "/api/messages", {
        receiverId: selectedConversation,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedConversation}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageText("");
    },
  });

  // Filter conversations based on search query
  const filteredConversations = conversations?.filter(conversation => 
    conversation.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageText);
    }
  };

  // Auto-scroll to bottom of messages when new message arrives
  useEffect(() => {
    if (messages) {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }
  }, [messages]);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Messages</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <Separator />
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {conversationsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedConversation === conversation.user.id ? "bg-slate-100" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conversation.user.profileImage} alt={conversation.user.fullName} />
                        <AvatarFallback>{conversation.user.fullName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">{conversation.user.fullName}</h3>
                          <span className="text-xs text-slate-500">
                            {format(new Date(conversation.lastMessage.createdAt), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {conversation.lastMessage.senderId === user.id ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-slate-500">No conversations found</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

        {/* Messages */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <CardHeader className="p-4 flex-shrink-0">
                  {filteredConversations?.find(c => c.user.id === selectedConversation) && (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={filteredConversations.find(c => c.user.id === selectedConversation)?.user.profileImage} 
                          alt={filteredConversations.find(c => c.user.id === selectedConversation)?.user.fullName} 
                        />
                        <AvatarFallback>
                          {filteredConversations.find(c => c.user.id === selectedConversation)?.user.fullName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {filteredConversations.find(c => c.user.id === selectedConversation)?.user.fullName}
                        </CardTitle>
                        <p className="text-sm text-slate-500">
                          {filteredConversations.find(c => c.user.id === selectedConversation)?.user.isHost ? "Host" : "Guest"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <Separator />

                {/* Messages Container */}
                <ScrollArea className="flex-1 p-4" id="message-container">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.senderId === user.id
                                ? "bg-primary text-white rounded-br-none"
                                : "bg-slate-100 text-slate-800 rounded-bl-none"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user.id ? "text-primary-foreground/70" : "text-slate-500"
                              }`}
                            >
                              {format(new Date(message.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-slate-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim() || sendMessageMutation.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <div className="bg-slate-100 rounded-full p-6 inline-block mb-4">
                    <Send className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                  <p className="text-slate-500 mb-4 max-w-md">
                    Select a conversation from the sidebar to view your messages or start a new conversation.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

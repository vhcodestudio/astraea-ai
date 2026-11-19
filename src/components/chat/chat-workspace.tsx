"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  AlertCircle,
  ArrowUp,
  LoaderCircle,
  Menu,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatSidebar } from "./chat-sidebar";
import { MessageContent } from "./message-content";
import { createClient } from "@/lib/supabase/client";
import {
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  renameConversation,
  saveMessage,
} from "@/lib/chat/repository";
import { createDemoResponse } from "@/lib/chat/demo-response";
import { shouldSubmitMessage } from "@/lib/chat/keyboard";
import type { Conversation, Message } from "@/lib/chat/types";
import { LangSwitch, useLang } from "@/lib/i18n";

const previewConversation = (title: string): Conversation => ({
  id: "preview",
  title,
  updated_at: new Date().toISOString(),
});
const previewMessages = (content: string): Message[] => [
  {
    id: "welcome",
    conversation_id: "preview",
    role: "assistant",
    created_at: new Date().toISOString(),
    content,
  },
];

function localMessage(
  conversationId: string,
  role: Message["role"],
  content: string,
): Message {
  return {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date().toISOString(),
  };
}

export function ChatWorkspace({
  email,
  isPreview,
}: {
  email: string | null;
  isPreview: boolean;
}) {
  const { t: d, lang } = useLang();
  const t = d.chat;
  const [conversations, setConversations] = useState<Conversation[]>(
    isPreview ? [previewConversation(t.welcomeTitle)] : [],
  );
  const [activeId, setActiveId] = useState<string | null>(
    isPreview ? "preview" : null,
  );
  const [messages, setMessages] = useState<Message[]>(
    isPreview ? previewMessages(t.welcome) : [],
  );
  // The preview welcome follows the chosen language.
  useEffect(() => {
    if (!isPreview) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- swap demo copy when the language changes
    setConversations((items) => items.map((c) => (c.id === "preview" ? { ...c, title: t.welcomeTitle } : c)));
    setMessages((items) => items.map((m) => (m.id === "welcome" ? { ...m, content: t.welcome } : m)));
  }, [isPreview, t.welcomeTitle, t.welcome]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!isPreview);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(
    async (id: string) => {
      setActiveId(id);
      setError(null);
      if (isPreview) {
        setMessages(previewMessages(t.welcome));
        return;
      }
      setLoading(true);
      try {
        setMessages(await listMessages(createClient(), id));
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : t.errors.load,
        );
      } finally {
        setLoading(false);
      }
    },
    [isPreview, t.welcome, t.errors.load],
  );

  useEffect(() => {
    if (isPreview) return;
    let active = true;
    void listConversations(createClient())
      .then((items) => {
        if (!active) return;
        setConversations(items);
        if (items[0]) void loadConversation(items[0].id);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : t.errors.list,
        ),
      )
      .finally(() => setInitializing(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per mode, not on language change
  }, [isPreview, loadConversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [messages, loading]);
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }, [value]);

  async function newConversation() {
    setError(null);
    setMessages([]);
    setValue("");
    if (isPreview) {
      setActiveId("preview");
      textareaRef.current?.focus();
      return;
    }
    try {
      const conversation = await createConversation(
        createClient(),
        t.newTitle,
      );
      setConversations((current) => [conversation, ...current]);
      setActiveId(conversation.id);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t.errors.create,
      );
    }
    textareaRef.current?.focus();
  }

  async function rename(id: string, title: string) {
    if (isPreview) {
      setConversations((items) =>
        items.map((item) => (item.id === id ? { ...item, title } : item)),
      );
      return;
    }
    try {
      const updated = await renameConversation(createClient(), id, title);
      setConversations((items) =>
        items.map((item) => (item.id === id ? updated : item)),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t.errors.rename,
      );
    }
  }

  async function remove(id: string) {
    try {
      if (!isPreview) await deleteConversation(createClient(), id);
      const remaining = conversations.filter((item) => item.id !== id);
      setConversations(remaining);
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
        if (remaining[0]) void loadConversation(remaining[0].id);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t.errors.del,
      );
    }
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const content = value.trim();
    if (!content || loading) return;
    setValue("");
    setError(null);
    setLoading(true);
    let conversationId = activeId;
    let activeConversation = conversations.find(
      (item) => item.id === conversationId,
    );
    let pendingAssistantId: string | null = null;
    try {
      if (!conversationId) {
        if (isPreview) conversationId = "preview";
        else {
          const conversation = await createConversation(
            createClient(),
            content.slice(0, 54),
          );
          conversationId = conversation.id;
          activeConversation = conversation;
          setActiveId(conversation.id);
          setConversations((current) => [conversation, ...current]);
        }
      }
      const optimistic = localMessage(conversationId, "user", content);
      setMessages((current) => [...current, optimistic]);
      const workspaceId = activeConversation?.workspace_id;
      if (!isPreview)
        await saveMessage(createClient(), {
          conversation_id: conversationId,
          workspace_id: workspaceId,
          role: "user",
          content,
        });

      const assistant = localMessage(conversationId, "assistant", "");
      pendingAssistantId = assistant.id;
      setMessages((current) => [...current, assistant]);
      await new Promise((resolve) => setTimeout(resolve, 450));
      const answer = createDemoResponse(content, lang);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistant.id
            ? { ...message, content: answer }
            : message,
        ),
      );
      if (!isPreview)
        await saveMessage(createClient(), {
          conversation_id: conversationId,
          workspace_id: workspaceId,
          role: "assistant",
          content: answer,
        });
    } catch (reason) {
      if (pendingAssistantId)
        setMessages((current) =>
          current.filter((message) => message.id !== pendingAssistantId),
        );
      setError(
        reason instanceof Error
          ? reason.message
          : t.errors.save,
      );
      setValue(content);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (shouldSubmitMessage(event.nativeEvent)) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-background">
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        email={email}
        isPreview={isPreview}
        onSelect={(id) => {
          setSidebarOpen(false);
          void loadConversation(id);
        }}
        onNew={() => {
          setSidebarOpen(false);
          void newConversation();
        }}
        onRename={(id, title) => void rename(id, title)}
        onDelete={(id) => void remove(id)}
      />
      <section
        className="relative flex min-w-0 flex-1 flex-col"
        aria-label={t.area}
      >
        <a className="astraea-skip" href="#astraea-composer">
          {t.skip}
        </a>
        <header className="flex h-16 shrink-0 items-center border-b border-white/[0.07] bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            aria-label={t.openSidebar}
          >
            <Menu />
          </Button>
          <div>
            <p className="text-sm font-semibold">{t.core}</p>
            <p className="text-[10px] text-muted-foreground">
              {t.sub}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitch className="hidden sm:flex" />
            {isPreview && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {t.localPreview}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <i className="size-1.5 rounded-full bg-primary" />
              {t.demo}
            </span>
          </div>
        </header>
        <p className="astraea-demo-notice">
          {isPreview
            ? t.noticePreview
            : t.notice}
        </p>
        <ScrollArea className="astraea-grid min-h-0 flex-1">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-8 sm:py-12">
            {initializing ? (
              <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="size-5 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <span className="mb-5 grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </span>
                <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                  {t.emptyTitle}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  {t.emptyText}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {messages.map((message) => (
                  <article key={message.id} className="flex gap-3 sm:gap-4">
                    <Avatar className="mt-0.5 size-7 shrink-0">
                      <AvatarFallback
                        className={
                          message.role === "assistant"
                            ? "bg-primary/15 text-[10px] text-primary"
                            : "bg-secondary text-[10px]"
                        }
                      >
                        {message.role === "assistant" ? "A" : t.youShort}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">
                        {message.role === "assistant" ? "Astraea" : t.you}
                      </p>
                      <MessageContent content={message.content} />
                    </div>
                  </article>
                ))}
                {loading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex gap-1">
                      <i className="size-1.5 animate-pulse rounded-full bg-primary" />
                      <i className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                      <i className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
                    </span>
                    {t.thinking}
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-6 sm:px-8 sm:pb-6">
          <div className="mx-auto max-w-3xl">
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form
              onSubmit={(event) => void submit(event)}
              className="relative rounded-2xl border border-white/[0.11] bg-card/95 p-2 shadow-[0_18px_60px_-24px_rgba(0,0,0,.8)] ring-1 ring-white/[0.025] focus-within:border-primary/35 focus-within:ring-primary/10"
            >
              <Textarea
                id="astraea-composer"
                ref={textareaRef}
                rows={1}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading}
                placeholder={t.placeholder}
                aria-label={t.placeholder.replace("...", "")}
                className="max-h-[180px] min-h-12 resize-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center gap-1 px-3 pb-1">
                <span className="hidden text-[11px] text-muted-foreground sm:block">
                  <kbd>{t.hint[0]}</kbd> {t.hint[1]} <kbd>{t.hint[2]}</kbd> {t.hint[3]}
                </span>
                <Button
                  type="submit"
                  size="icon"
                  className="ml-auto rounded-xl"
                  disabled={!value.trim() || loading}
                  aria-label={t.send}
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <ArrowUp />
                  )}
                </Button>
              </div>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
              {t.footer}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, FileText, Library, LogOut, MessageSquare, MoreHorizontal, Pencil, Plus, Search, Settings2, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/components/brand-mark";
import type { Conversation } from "@/lib/chat/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LangSwitch, useLang } from "@/lib/i18n";

type Props = {
  conversations: Conversation[]; activeId: string | null; email: string | null; isPreview: boolean;
  open: boolean; onClose: () => void; onSelect: (id: string) => void; onNew: () => void;
  onRename: (id: string, title: string) => void; onDelete: (id: string) => void;
};

export function ChatSidebar({ conversations, activeId, email, isPreview, open, onClose, onSelect, onNew, onRename, onDelete }: Props) {
  const router = useRouter();
  const t = useLang().t.sidebar;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleConversations = query.trim() ? conversations.filter((item) => item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) : conversations;

  async function signOut() {
    if (isPreview) return;
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function requestRename(item: Conversation) {
    const title = window.prompt(t.renamePrompt, item.title)?.trim();
    if (title && title !== item.title) onRename(item.id, title);
  }

  function requestDelete(item: Conversation) {
    if (window.confirm(t.deleteConfirm(item.title))) onDelete(item.id);
  }

  return <>
    {open && <button aria-label={t.close} onClick={onClose} className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden" />}
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,88vw)] shrink-0 -translate-x-full flex-col border-r border-white/[0.07] bg-sidebar/95 shadow-2xl backdrop-blur-xl transition-transform lg:static lg:h-screen lg:w-72 lg:translate-x-0 lg:bg-sidebar lg:shadow-none", open && "translate-x-0")}>
      <div className="flex h-16 items-center gap-3 px-4"><BrandMark className="size-8" /><div className="flex-1"><p className="text-sm font-semibold tracking-tight">Astraea</p><p className="text-[11px] text-muted-foreground">{t.tagline}</p></div><Button onClick={onClose} size="icon-sm" variant="ghost" className="lg:hidden" aria-label={t.close}><X /></Button></div>
      <div className="space-y-2 px-3"><Button onClick={onNew} className="w-full justify-start shadow-lg shadow-primary/10"><Plus />{t.newChat}</Button>{searchOpen ? <div className="relative"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { setSearchOpen(false); setQuery(""); } }} placeholder={t.search} className="h-9 pl-9" /></div> : <Button onClick={() => setSearchOpen(true)} variant="ghost" className="w-full justify-start text-muted-foreground"><Search />{t.search}</Button>}</div>
      <nav className="mt-5 space-y-1 px-3 text-sm"><p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">{t.workspace}</p><button className="flex w-full items-center gap-3 rounded-lg bg-sidebar-accent px-2.5 py-2 text-left text-foreground"><MessageSquare className="size-4" />{t.chat}</button>{[[Library,t.knowledge],[Bot,t.agents],[FileText,t.projects]].map(([Icon,label]) => <div key={label as string} aria-disabled="true" className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-muted-foreground/50"><Icon className="size-4" /><span>{label as string}</span><span className="ml-auto text-[9px] uppercase tracking-wider">{t.soon}</span></div>)}</nav>
      <Separator className="my-4" />
      <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">{t.recent}</p>
      <ScrollArea className="min-h-0 flex-1 px-3"><div className="space-y-1 pb-4">{visibleConversations.map((item) => <div key={item.id} className={cn("group flex items-center rounded-lg pr-1 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground", activeId === item.id && "bg-sidebar-accent text-foreground")}><button onClick={() => onSelect(item.id)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left"><MessageSquare className="size-3.5 shrink-0 opacity-60" /><span className="truncate">{item.title}</span></button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={t.options(item.title)} className="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-40"><DropdownMenuItem onSelect={() => requestRename(item)}><Pencil />{t.rename}</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => requestDelete(item)}><Trash2 />{t.del}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>)}{visibleConversations.length === 0 && <p className="px-3 py-6 text-center text-xs text-muted-foreground">{t.none}</p>}</div></ScrollArea>
      <div className="border-t border-white/[0.07] p-3"><LangSwitch className="mb-2 w-max" /><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sidebar-accent"><Avatar className="size-8"><AvatarFallback className="bg-primary/15 text-xs text-primary">{email?.slice(0,2).toUpperCase() ?? "AI"}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{email ?? t.preview}</p><p className="text-[10px] text-muted-foreground">{t.plan}</p></div><Settings2 className="size-4 text-muted-foreground" /></button></DropdownMenuTrigger><DropdownMenuContent side="top" align="end" className="w-52"><DropdownMenuItem disabled={isPreview} onSelect={() => void signOut()}><LogOut />{t.signOut}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    </aside>
  </>;
}

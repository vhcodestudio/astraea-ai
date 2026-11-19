"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGS = ["en", "pt", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const langLabel: Record<Lang, string> = { en: "English", pt: "Português", es: "Español" };
const HTML_LANG: Record<Lang, string> = { en: "en", pt: "pt-BR", es: "es" };
const KEY = "astraea:lang";
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** ?lang= wins, then the saved choice, then the browser language. Runs after mount (SSR renders English). */
function detect(): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (isLang(q)) return q;
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch { /* storage blocked */ }
  const nav = navigator.language.toLowerCase();
  return nav.startsWith("pt") ? "pt" : nav.startsWith("es") ? "es" : "en";
}

const en = {
  title: "Astraea AI — Intelligent workspace",
  language: "Language",
  sidebar: {
    tagline: "Intelligence, in orbit", close: "Close sidebar", newChat: "New conversation", search: "Search conversations",
    workspace: "Workspace", chat: "Chat", knowledge: "Knowledge", agents: "Agents", projects: "Projects", soon: "Soon", recent: "Recent",
    options: (t: string) => `Options for ${t}`, rename: "Rename", del: "Delete", none: "No conversations found.",
    preview: "Preview workspace", plan: "Free plan", signOut: "Sign out",
    renamePrompt: "Rename conversation", deleteConfirm: (t: string) => `Delete “${t}”? This cannot be undone.`,
  },
  chat: {
    welcomeTitle: "Welcome to Astraea",
    welcome: '# Welcome to Astraea\n\nA focused AI workspace for thinking, building, and working with your knowledge.\n\nTry asking for a plan, analysis, or code example:\n\n```ts\nconst clarity = await astraea.think({\n  deeply: true,\n  context: "your workspace",\n});\n```',
    newTitle: "New conversation",
    errors: { load: "Could not load this conversation.", list: "Could not load conversations.", create: "Could not create a conversation.", rename: "Could not rename the conversation.", del: "Could not delete the conversation.", save: "Your message could not be saved." },
    area: "Conversation workspace", skip: "Skip to message", openSidebar: "Open sidebar", core: "Astraea Core", sub: "Interactive portfolio experience",
    localPreview: "Local preview", demo: "Demo mode",
    noticePreview: "Public demo: simulated responses, no external AI provider. Changes are temporary.", notice: "Responses are simulated. Verify important information.",
    emptyTitle: "What will we explore?", emptyText: "Start a conversation. Your messages will stay connected to your Astraea workspace.",
    you: "You", youShort: "YOU", thinking: "Astraea is thinking", placeholder: "Message Astraea...",
    hint: ["Enter", "to send ·", "Shift Enter", "for new line"], send: "Send message", footer: "Astraea can make mistakes. Verify important information.",
  },
  auth: {
    noConfig: "Add the Supabase environment variables to enable authentication.", checkInbox: "Check your inbox to confirm your Astraea account.",
    failed: "Authentication failed.", googleFailed: "Google authentication failed.",
    story: "A place to think things through.", storyText: "Bring a question, shape a plan, and keep the conversation together. A focused workspace for your next idea.",
    demoLink: "Explore the interactive demo", demoNote: "No account needed. Simulated responses, no external AI provider.",
    exampleLabel: "Example of a simulated conversation", exampleQ: "How should I approach my next project?", exampleWho: "Astraea · Example",
    exampleA: "Start with the problem. Define one useful outcome, then build a small version you can test.", github: "View the project on GitHub",
    access: "Account access", yourWorkspace: "Your intelligent workspace", welcomeBack: "Welcome back", create: "Create your workspace",
    loginText: "Continue your conversations and knowledge work.", registerText: "Start building with a calmer, more capable AI workspace.",
    google: "Continue with Google", orEmail: "or use email", email: "Email", password: "Password", emailPh: "you@example.com", passwordPh: "At least 8 characters",
    signIn: "Sign in", createAccount: "Create account", toRegister: "Create an account", toLogin: "Already have an account?", tryDemo: "Try demo",
  },
};
export type Dict = typeof en;

const pt: Dict = {
  title: "Astraea AI — Workspace inteligente",
  language: "Idioma",
  sidebar: {
    tagline: "Inteligência em órbita", close: "Fechar barra lateral", newChat: "Nova conversa", search: "Buscar conversas",
    workspace: "Workspace", chat: "Chat", knowledge: "Conhecimento", agents: "Agentes", projects: "Projetos", soon: "Em breve", recent: "Recentes",
    options: (t) => `Opções de ${t}`, rename: "Renomear", del: "Excluir", none: "Nenhuma conversa encontrada.",
    preview: "Workspace de demonstração", plan: "Plano gratuito", signOut: "Sair",
    renamePrompt: "Renomear conversa", deleteConfirm: (t) => `Excluir “${t}”? Isso não pode ser desfeito.`,
  },
  chat: {
    welcomeTitle: "Boas-vindas à Astraea",
    welcome: '# Boas-vindas à Astraea\n\nUm workspace de IA focado para pensar, construir e trabalhar com o seu conhecimento.\n\nPeça um plano, uma análise ou um exemplo de código:\n\n```ts\nconst clareza = await astraea.pensar({\n  profundo: true,\n  contexto: "seu workspace",\n});\n```',
    newTitle: "Nova conversa",
    errors: { load: "Não foi possível carregar esta conversa.", list: "Não foi possível carregar as conversas.", create: "Não foi possível criar uma conversa.", rename: "Não foi possível renomear a conversa.", del: "Não foi possível excluir a conversa.", save: "Não foi possível salvar sua mensagem." },
    area: "Área da conversa", skip: "Pular para a mensagem", openSidebar: "Abrir barra lateral", core: "Astraea Core", sub: "Experiência interativa de portfólio",
    localPreview: "Prévia local", demo: "Modo demo",
    noticePreview: "Demo pública: respostas simuladas, sem provedor de IA externo. As mudanças são temporárias.", notice: "As respostas são simuladas. Confira informações importantes.",
    emptyTitle: "O que vamos explorar?", emptyText: "Comece uma conversa. Suas mensagens ficam ligadas ao seu workspace Astraea.",
    you: "Você", youShort: "VOCÊ", thinking: "Astraea está pensando", placeholder: "Mensagem para a Astraea...",
    hint: ["Enter", "para enviar ·", "Shift Enter", "para nova linha"], send: "Enviar mensagem", footer: "A Astraea pode errar. Confira informações importantes.",
  },
  auth: {
    noConfig: "Adicione as variáveis de ambiente do Supabase para ativar a autenticação.", checkInbox: "Confira sua caixa de entrada para confirmar sua conta Astraea.",
    failed: "A autenticação falhou.", googleFailed: "A autenticação com Google falhou.",
    story: "Um lugar para pensar com calma.", storyText: "Traga uma pergunta, monte um plano e mantenha a conversa num lugar só. Um workspace focado para a sua próxima ideia.",
    demoLink: "Explorar a demo interativa", demoNote: "Não precisa de conta. Respostas simuladas, sem provedor de IA externo.",
    exampleLabel: "Exemplo de conversa simulada", exampleQ: "Como devo começar meu próximo projeto?", exampleWho: "Astraea · Exemplo",
    exampleA: "Comece pelo problema. Defina um resultado útil e construa uma versão pequena que dê para testar.", github: "Ver o projeto no GitHub",
    access: "Acesso à conta", yourWorkspace: "Seu workspace inteligente", welcomeBack: "Que bom te ver de novo", create: "Crie seu workspace",
    loginText: "Continue suas conversas e seu trabalho com conhecimento.", registerText: "Comece com um workspace de IA mais calmo e mais capaz.",
    google: "Continuar com Google", orEmail: "ou use e-mail", email: "E-mail", password: "Senha", emailPh: "voce@exemplo.com", passwordPh: "Pelo menos 8 caracteres",
    signIn: "Entrar", createAccount: "Criar conta", toRegister: "Criar uma conta", toLogin: "Já tem uma conta?", tryDemo: "Testar a demo",
  },
};

const es: Dict = {
  title: "Astraea AI — Workspace inteligente",
  language: "Idioma",
  sidebar: {
    tagline: "Inteligencia en órbita", close: "Cerrar barra lateral", newChat: "Nueva conversación", search: "Buscar conversaciones",
    workspace: "Workspace", chat: "Chat", knowledge: "Conocimiento", agents: "Agentes", projects: "Proyectos", soon: "Pronto", recent: "Recientes",
    options: (t) => `Opciones de ${t}`, rename: "Renombrar", del: "Eliminar", none: "No se encontraron conversaciones.",
    preview: "Workspace de demostración", plan: "Plan gratuito", signOut: "Cerrar sesión",
    renamePrompt: "Renombrar conversación", deleteConfirm: (t) => `¿Eliminar “${t}”? No se puede deshacer.`,
  },
  chat: {
    welcomeTitle: "Bienvenida a Astraea",
    welcome: '# Bienvenida a Astraea\n\nUn workspace de IA enfocado para pensar, construir y trabajar con tu conocimiento.\n\nPide un plan, un análisis o un ejemplo de código:\n\n```ts\nconst claridad = await astraea.pensar({\n  profundo: true,\n  contexto: "tu workspace",\n});\n```',
    newTitle: "Nueva conversación",
    errors: { load: "No se pudo cargar esta conversación.", list: "No se pudieron cargar las conversaciones.", create: "No se pudo crear una conversación.", rename: "No se pudo renombrar la conversación.", del: "No se pudo eliminar la conversación.", save: "No se pudo guardar tu mensaje." },
    area: "Área de la conversación", skip: "Saltar al mensaje", openSidebar: "Abrir barra lateral", core: "Astraea Core", sub: "Experiencia interactiva de portafolio",
    localPreview: "Vista local", demo: "Modo demo",
    noticePreview: "Demo pública: respuestas simuladas, sin proveedor de IA externo. Los cambios son temporales.", notice: "Las respuestas son simuladas. Verifica la información importante.",
    emptyTitle: "¿Qué vamos a explorar?", emptyText: "Empieza una conversación. Tus mensajes quedan conectados a tu workspace Astraea.",
    you: "Tú", youShort: "TÚ", thinking: "Astraea está pensando", placeholder: "Mensaje para Astraea...",
    hint: ["Enter", "para enviar ·", "Shift Enter", "para nueva línea"], send: "Enviar mensaje", footer: "Astraea puede equivocarse. Verifica la información importante.",
  },
  auth: {
    noConfig: "Agrega las variables de entorno de Supabase para activar la autenticación.", checkInbox: "Revisa tu bandeja de entrada para confirmar tu cuenta Astraea.",
    failed: "La autenticación falló.", googleFailed: "La autenticación con Google falló.",
    story: "Un lugar para pensar con calma.", storyText: "Trae una pregunta, arma un plan y mantén la conversación en un solo lugar. Un workspace enfocado para tu próxima idea.",
    demoLink: "Explorar la demo interactiva", demoNote: "No necesitas cuenta. Respuestas simuladas, sin proveedor de IA externo.",
    exampleLabel: "Ejemplo de conversación simulada", exampleQ: "¿Cómo debería encarar mi próximo proyecto?", exampleWho: "Astraea · Ejemplo",
    exampleA: "Empieza por el problema. Define un resultado útil y construye una versión pequeña que puedas probar.", github: "Ver el proyecto en GitHub",
    access: "Acceso a la cuenta", yourWorkspace: "Tu workspace inteligente", welcomeBack: "Qué bueno verte de nuevo", create: "Crea tu workspace",
    loginText: "Continúa tus conversaciones y tu trabajo con conocimiento.", registerText: "Empieza con un workspace de IA más tranquilo y más capaz.",
    google: "Continuar con Google", orEmail: "o usa tu correo", email: "Correo", password: "Contraseña", emailPh: "tu@ejemplo.com", passwordPh: "Al menos 8 caracteres",
    signIn: "Entrar", createAccount: "Crear cuenta", toRegister: "Crear una cuenta", toLogin: "¿Ya tienes una cuenta?", tryDemo: "Probar la demo",
  },
};

export const dicts: Record<Lang, Dict> = { en, pt, es };

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: "en", t: en, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read the browser language after hydration
  useEffect(() => setLang(detect()), []);
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    document.title = document.title.startsWith("Astraea —") ? document.title : dicts[lang].title;
    try { localStorage.setItem(KEY, lang); } catch { /* storage blocked */ }
  }, [lang]);
  return <Ctx.Provider value={{ lang, t: dicts[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Compact EN / PT / ES switcher. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t.language} className={`flex items-center gap-0.5 rounded-full border border-white/10 p-0.5 text-[10px] font-semibold uppercase ${className}`}>
      {LANGS.map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={l === lang} title={langLabel[l]} lang={HTML_LANG[l]}
          className={`min-h-7 min-w-7 rounded-full px-1.5 transition ${l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <span aria-hidden="true">{l}</span><span className="sr-only">{langLabel[l]}</span>
        </button>
      ))}
    </div>
  );
}

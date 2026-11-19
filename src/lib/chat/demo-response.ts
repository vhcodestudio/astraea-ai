type Lang = "en" | "pt" | "es";
type Reply = { matches: string[]; content: Record<Lang, string> };

// Keywords cover all three languages, so a question in any language finds its topic.
const responses: Reply[] = [
  {
    matches: ["code", "código", "codigo", "typescript", "react", "next"],
    content: {
      pt: "## Demo de assistência técnica\n\nEm uma versão conectada a um modelo, a Astraea poderia analisar requisitos e produzir implementações como esta:\n\n```ts\ntype Project = {\n  name: string;\n  status: \"active\" | \"archived\";\n};\n\nconst activeProjects = projects.filter(\n  (project) => project.status === \"active\",\n);\n```\n\nEste conteúdo é demonstrativo e foi gerado localmente, sem enviar sua mensagem para uma IA externa.",
      en: "## Technical assistance demo\n\nIn a version connected to a model, Astraea could analyze requirements and produce implementations like this:\n\n```ts\ntype Project = {\n  name: string;\n  status: \"active\" | \"archived\";\n};\n\nconst activeProjects = projects.filter(\n  (project) => project.status === \"active\",\n);\n```\n\nThis content is a demonstration generated locally, without sending your message to an external AI.",
      es: "## Demo de asistencia técnica\n\nEn una versión conectada a un modelo, Astraea podría analizar requisitos y producir implementaciones como esta:\n\n```ts\ntype Project = {\n  name: string;\n  status: \"active\" | \"archived\";\n};\n\nconst activeProjects = projects.filter(\n  (project) => project.status === \"active\",\n);\n```\n\nEste contenido es una demostración generada localmente, sin enviar tu mensaje a una IA externa.",
    },
  },
  {
    matches: ["plano", "planejar", "plan", "planear", "roadmap", "project", "projeto", "proyecto"],
    content: {
      pt: "## Plano demonstrativo\n\n1. Definir o objetivo e os critérios de sucesso.\n2. Dividir o trabalho em entregas pequenas.\n3. Validar cada etapa com evidências.\n4. Registrar decisões e próximos passos.\n\n> Esta é uma resposta local de demonstração para apresentar a experiência da Astraea no portfólio.",
      en: "## Demo plan\n\n1. Define the goal and the success criteria.\n2. Split the work into small deliveries.\n3. Validate each step with evidence.\n4. Record decisions and next steps.\n\n> This is a local demo reply to show the Astraea experience in the portfolio.",
      es: "## Plan de demostración\n\n1. Definir el objetivo y los criterios de éxito.\n2. Dividir el trabajo en entregas pequeñas.\n3. Validar cada etapa con evidencias.\n4. Registrar decisiones y próximos pasos.\n\n> Esta es una respuesta local de demostración para presentar la experiencia de Astraea en el portafolio.",
    },
  },
  {
    matches: ["resum", "summar", "analis", "analy", "document", "texto", "text"],
    content: {
      pt: "## Análise demonstrativa\n\nA Astraea organizaria o conteúdo em **contexto**, **pontos principais**, **riscos** e **ações recomendadas**. Nesta versão de portfólio, nenhum documento ou mensagem é enviado a um provedor de IA externo.",
      en: "## Demo analysis\n\nAstraea would organize the content into **context**, **key points**, **risks** and **recommended actions**. In this portfolio version, no document or message is sent to an external AI provider.",
      es: "## Análisis de demostración\n\nAstraea organizaría el contenido en **contexto**, **puntos principales**, **riesgos** y **acciones recomendadas**. En esta versión de portafolio, ningún documento ni mensaje se envía a un proveedor de IA externo.",
    },
  },
];

const fallback: Record<Lang, string> = {
  pt: "## Astraea Demo\n\nEsta interface demonstra autenticação, conversas persistentes, Markdown, blocos de código e uma experiência de chat premium.\n\nA integração com modelos de IA está **desativada** nesta versão de portfólio, então sua mensagem não foi enviada a nenhum provedor externo.",
  en: "## Astraea Demo\n\nThis interface shows authentication, persistent conversations, Markdown, code blocks and a premium chat experience.\n\nThe AI model integration is **turned off** in this portfolio version, so your message was not sent to any external provider.",
  es: "## Astraea Demo\n\nEsta interfaz muestra autenticación, conversaciones persistentes, Markdown, bloques de código y una experiencia de chat premium.\n\nLa integración con modelos de IA está **desactivada** en esta versión de portafolio, así que tu mensaje no se envió a ningún proveedor externo.",
};

export function createDemoResponse(message: string, lang: Lang = "pt") {
  const normalized = message.toLocaleLowerCase();
  const selected = responses.find(({ matches }) => matches.some((match) => normalized.includes(match)));
  return selected?.content[lang] ?? fallback[lang];
}

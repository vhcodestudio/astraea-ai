"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/client";
import { Constellation } from "./constellation";
import { LangSwitch, useLang } from "@/lib/i18n";

export function AuthPanel({ isConfigured }: { isConfigured: boolean }) {
  const router = useRouter();
  const { t: all } = useLang();
  const t = all.auth;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      if (!isConfigured)
        throw new Error(t.noConfig);
      const supabase = createClient();
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push("/");
        router.refresh();
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) throw authError;
        setMessage(t.checkInbox);
      }
    } catch (value) {
      setError(
        value instanceof Error ? value.message : t.failed,
      );
    } finally {
      setPending(false);
    }
  }

  async function continueWithGoogle() {
    setError(null);
    setMessage(null);
    setGooglePending(true);
    try {
      if (!isConfigured)
        throw new Error(t.noConfig);
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : t.googleFailed,
      );
      setGooglePending(false);
    }
  }

  return (
    <main className="astraea-entry">
      <section className="astraea-story" aria-labelledby="story-heading">
        <Constellation />
        <Link href="/demo" className="astraea-wordmark">
          <BrandMark />
          <span>Astraea AI</span>
        </Link>
        <div>
          <h2 id="story-heading">{t.story}</h2>
          <p>
            {t.storyText}
          </p>
          <Link href="/demo" className="astraea-demo-link">
            {t.demoLink}{" "}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <small>
            {t.demoNote}
          </small>
        </div>
        <div
          className="astraea-conversation"
          aria-label={t.exampleLabel}
        >
          <p>
            <span>{all.chat.you}</span>{t.exampleQ}
          </p>
          <p>
            <span>{t.exampleWho}</span>{t.exampleA}
          </p>
        </div>
        <a
          className="astraea-repository"
          href="https://github.com/vitorgamer778/astraea-ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.github}
        </a>
      </section>
      <section className="astraea-auth" aria-label={t.access}>
        <LangSwitch className="mb-6 ml-auto w-max" />
        <div className="mb-8 flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="font-semibold tracking-tight">Astraea AI</p>
            <p className="text-xs text-muted-foreground">
              {t.yourWorkspace}
            </p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.035em]">
          {mode === "login" ? t.welcomeBack : t.create}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {mode === "login"
            ? t.loginText
            : t.registerText}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-7 h-11 w-full gap-3 border-white/10 bg-background/45 hover:bg-white/[.06]"
          disabled={pending || googlePending}
          onClick={continueWithGoogle}
        >
          {googlePending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <GoogleMark />
          )}
          {t.google}
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-white/10" />
          <span>{t.orEmail}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">{t.email}</span>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t.emailPh}
              className="h-11 bg-background/50"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">{t.password}</span>
            <Input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t.passwordPh}
              className="h-11 bg-background/50"
            />
          </label>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert>
              <ShieldCheck className="size-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Button className="h-11 w-full" disabled={pending || googlePending}>
            {pending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                {mode === "login" ? t.signIn : t.createAccount}
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setMessage(null);
            }}
            className="transition hover:text-foreground"
          >
            {mode === "login"
              ? t.toRegister
              : t.toLogin}
          </button>
          <Link href="/demo" className="transition hover:text-foreground">
            {t.tryDemo}
          </Link>
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}

"use client";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/common/components/ui/button";
import { Input } from "@/shared/common/components/ui/input";
import { Label } from "@/shared/common/components/ui/label";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export const RegisterForm = () => {
  const t = useTranslations("auth");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Parollar mos emas");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        login: username.trim(),
        password,
        confirmPassword,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.error ?? "Ro'yxatdan o'tib bo'lmadi");
      return;
    }
    await signIn("credentials", { login: username.trim(), password, callbackUrl: "/" });
    toast.success("Ro'yxatdan o'tdingiz");
    router.push("/");
  }

  const title = t("register_title");
  const subtitle = t("register_subtitle");

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="reg-fullname">{t("full_name")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-fullname"
              type="text"
              placeholder={t("full_name")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-9"
              required
              maxLength={128}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-login">Login</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-login"
              type="text"
              placeholder={t("email_placeholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9"
              required
              maxLength={128}
              minLength={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">{t("password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-9"
              required
              maxLength={128}
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-confirm">{t("confirm_password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-confirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 pr-9"
              required
              maxLength={128}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword((p) => !p)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-neutral-100 dark:text-neutral-900"
          disabled={loading}
        >
          {t("get_started")}
        </Button>
      </form>
    </div>
  );
};

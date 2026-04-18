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
import { getDefaultDashboardPath, normalizeRole } from "@/shared/common/lib/rbac";

export const LoginForm = () => {
  const t = useTranslations("auth");
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      login: login.trim(),
      password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (!result || result.error) {
      toast.error(t("login_error") ?? "Login yoki parol noto'g'ri");
      return;
    }
    toast.success("Muvaffaqiyatli kirdingiz");
    // Session roli backenddan aniq bo'lgani uchun /api/me orqali tekshirib olamiz.
    try {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (!meRes.ok) {
        router.push("/");
        return;
      }
      const me = (await meRes.json()) as { role?: string | null };
      const role = normalizeRole(me.role);
      if (role === "user") {
        router.push("/");
        return;
      }
      const dashboardPath = getDefaultDashboardPath(me.role) ?? "/dashboard";
      router.push(dashboardPath);
    } catch {
      router.push("/");
    }
  };

  const title = t("sign_in_with_email") as string;
  const subtitle = t("login_subtitle");

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1 text-center">
        {/* <h1 className="text-xl font-semibold">{title}</h1> */}
        {/* <p className="text-sm text-muted-foreground">{subtitle}</p> */}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          {/* <Label htmlFor="login-email">{t("email_placeholder")}</Label> */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="text"
              // placeholder={t("email_placeholder")}
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="pl-9"
              required
              maxLength={128}
              minLength={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* <Label htmlFor="login-password">{t("password")}</Label> */}
            {/* <button type="button" className="text-xs text-primary hover:underline">
              {t("forgot_password")}
            </button> */}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              // placeholder={t("password")}
              placeholder="Parol"
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

        <Button
          type="submit"
          className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-neutral-100 dark:text-neutral-900"
          disabled={isSubmitting}
        >
          {/* {t("get_started")} */}
          Kirish
        </Button>
      </form>
    </div>
  );
};

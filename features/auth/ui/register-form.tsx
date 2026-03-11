"use client";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/common/components/ui/button";
import { Input } from "@/shared/common/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
        full_name: fullName,
        login: username,
        password,
        confirmPassword,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.error ?? "Ro'yxatdan o'tishda xatolik");
      return;
    }
    toast.success("Ro'yxatdan o'tdingiz");
    router.push("/");
  }

  return (
    <div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Full name"
          required
          maxLength={128}
          minLength={3}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Username"
          required
          maxLength={128}
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="flex gap-1">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            required
            maxLength={128}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            variant="outline"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex gap-1">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirm_password")}
            required
            maxLength={128}
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className=""
            variant="outline"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button type="submit" className="flex-1" disabled={loading}>
          {t("register")}
        </Button>
      </form>
    </div>
  );
};

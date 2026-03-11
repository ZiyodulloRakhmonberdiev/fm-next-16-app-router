"use client";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/common/components/ui/button";
import { Input } from "@/shared/common/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/shared/common/components/ui/field";
import { Checkbox } from "@/shared/common/components/ui/checkbox";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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
      login,
      password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (!result || result.error) {
      toast.error("Login yoki parol noto'g'ri");
      return;
    }
    toast.success("Muvaffaqiyatli kirdingiz");
    router.push("/dashboard");
  };

  return (
    <div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          id="login"
          type="text"
          placeholder="Username"
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          maxLength={128} minLength={3}
        />
        <div className="flex gap-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            required maxLength={128} minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            variant="outline"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <FieldGroup>
          <Field orientation="horizontal" className="w-full gap-2">
            <Checkbox id="remember" name="remember" defaultChecked />
            <FieldLabel htmlFor="remember" className="font-normal">{t("remember_me")}</FieldLabel>
          </Field>
        </FieldGroup>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {t("login")}
          </Button>
      </form>
    </div>
  );
}
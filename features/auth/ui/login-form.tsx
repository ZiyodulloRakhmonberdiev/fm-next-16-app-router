"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/common/components/ui/button";
import { Input } from "@/shared/common/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/shared/common/components/ui/field";
import { Checkbox } from "@/shared/common/components/ui/checkbox";

export const LoginForm = () => {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <form className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          placeholder={t("email")}
          required
          maxLength={128} minLength={3}
        />
        <div className="flex gap-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            required maxLength={128} minLength={8}
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
          <Button type="submit" className="flex-1">
            {t("login")}
          </Button>
      </form>
    </div>
  );
}
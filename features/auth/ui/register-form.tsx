"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/common/components/ui/button";
import { Input } from "@/shared/common/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ButtonGroup } from "@/shared/common/components/ui/button-group";
import { Field } from "@/shared/common/components/ui/field";

export const RegisterForm = () => {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div>
      <form className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder={t("full_name")}
          required
          maxLength={128}
          minLength={3}
        />
        <Input
          type="email"
          placeholder={t("email")}
          required
          maxLength={128}
          minLength={3}
        />
        <div className="flex gap-1">
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={t("phone_number")}
            required
            minLength={9}
            maxLength={9}
            className="flex-1"
          />
        </div>
        <div className="flex gap-1">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            required
            maxLength={128}
            minLength={8}
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
            minLength={8}
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
        <Button type="submit" className="flex-1">
          {t("register")}
        </Button>
      </form>
    </div>
  );
};

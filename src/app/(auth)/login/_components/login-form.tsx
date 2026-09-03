"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const INITIAL_STATE: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="username"
        required
        error={state.fieldErrors?.email}
      />
      <Field
        id="password"
        name="password"
        type="password"
        label="Mot de passe"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={pending} className="mt-2">
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

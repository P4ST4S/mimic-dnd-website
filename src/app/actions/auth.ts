"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { LoginFormSchema } from "@/lib/validation/auth";

export interface LoginFormState {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
}

/**
 * Server Action de connexion, pensée pour `useActionState`. Le message
 * d'erreur est volontairement générique ("identifiants incorrects") pour
 * ne pas révéler si l'e-mail existe — il n'y a pas d'inscription publique
 * sur ce site, les comptes ne sont créés que par le seed (voir prisma/seed.ts).
 */
export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { error: "Identifiants incorrects." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Identifiants incorrects." };
  }

  await createSession(user.id, user.role);
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

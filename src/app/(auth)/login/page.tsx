import type { Metadata } from "next";
import { Fleuron } from "@/components/ui/fleuron";
import { OrnateCard } from "@/components/ui/ornate-card";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <p className="heading-smallcaps mb-1">Mimic</p>
        <h1 className="font-display text-2xl">Bienvenue à la table</h1>
      </div>
      <Fleuron />
      <OrnateCard className="mt-6">
        <LoginForm />
      </OrnateCard>
      <p className="mt-6 text-center text-xs text-text-muted">
        Pas de compte ? Les comptes de la table sont créés par le MJ — demandez
        vos identifiants.
      </p>
    </div>
  );
}

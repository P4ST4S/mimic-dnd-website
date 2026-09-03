import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Adresse e-mail invalide." }).trim(),
  password: z.string().min(1, { error: "Le mot de passe est requis." }),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

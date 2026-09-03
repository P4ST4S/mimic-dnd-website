import { Badge } from "@/components/ui/badge";
import { RulesTable } from "@/components/ui/rules-table";

export interface InventoryItemView {
  id: string;
  name: string;
  quantity: number;
  weightLb: number;
  equipped: boolean;
  attuned: boolean;
  rarity: string | null;
}

const RARITY_TONE: Record<string, "neutral" | "accent" | "ornament" | "success"> = {
  commun: "neutral",
  "peu commun": "success",
  rare: "accent",
  "très rare": "ornament",
  légendaire: "ornament",
  artéfact: "ornament",
};

export function InventoryTable({ items }: { items: readonly InventoryItemView[] }) {
  if (items.length === 0) {
    return (
      <p className="flavor-text">
        L’inventaire est vide pour l’instant — pas même une gourde d’eau croupie.
      </p>
    );
  }

  const totalWeight = items.reduce((sum, i) => sum + i.weightLb * i.quantity, 0);

  return (
    <RulesTable>
      <thead>
        <tr>
          <th scope="col">Objet</th>
          <th scope="col" data-numeric>
            Qté
          </th>
          <th scope="col" data-numeric>
            Poids
          </th>
          <th scope="col">État</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td data-label="Objet">
              <span className="font-medium">{item.name}</span>
              {item.rarity && (
                <Badge tone={RARITY_TONE[item.rarity] ?? "neutral"} className="ml-2">
                  {item.rarity}
                </Badge>
              )}
            </td>
            <td data-label="Quantité" data-numeric>
              {item.quantity}
            </td>
            <td data-label="Poids" data-numeric>
              {(item.weightLb * item.quantity).toFixed(1)} lb
            </td>
            <td data-label="État">
              {item.equipped && <Badge tone="accent">Équipé</Badge>}
              {item.attuned && (
                <Badge tone="ornament" className="ml-1">
                  Harmonisé
                </Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={2}>Poids total</td>
          <td data-numeric>{totalWeight.toFixed(1)} lb</td>
          <td />
        </tr>
      </tfoot>
    </RulesTable>
  );
}

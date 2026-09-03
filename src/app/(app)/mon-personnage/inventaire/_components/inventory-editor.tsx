"use client";

import { useTransition } from "react";
import { changeQuantity, deleteItem, toggleAttuned, toggleEquipped } from "@/app/actions/inventaire";
import { Button } from "@/components/ui/button";
import { RulesTable } from "@/components/ui/rules-table";
import { ITEM_CATEGORY_LABELS_FR } from "@/lib/i18n/item-category";

export interface EditableItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  weightLb: number;
  equipped: boolean;
  attuned: boolean;
  requiresAttunement: boolean;
}

export function InventoryEditor({ slug, items }: { slug: string; items: EditableItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return <p className="flavor-text">L’inventaire est vide.</p>;
  }

  return (
    <RulesTable>
      <thead>
        <tr>
          <th scope="col">Objet</th>
          <th scope="col" data-numeric>
            Qté
          </th>
          <th scope="col">Équipé</th>
          <th scope="col">Harmonisé</th>
          <th scope="col" />
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} aria-busy={isPending}>
            <td data-label="Objet">
              <span className="font-medium">{item.name}</span>{" "}
              <span className="text-2xs text-text-subtle">
                ({ITEM_CATEGORY_LABELS_FR[item.category] ?? item.category})
              </span>
            </td>
            <td data-label="Quantité" data-numeric>
              <input
                type="number"
                min={0}
                defaultValue={item.quantity}
                className="w-16 rounded-sheet border border-border bg-surface-sunken px-2 py-1 text-right"
                onBlur={(e) => {
                  const value = Number(e.currentTarget.value);
                  if (!Number.isNaN(value) && value !== item.quantity) {
                    startTransition(() => {
                      void changeQuantity(item.id, slug, value);
                    });
                  }
                }}
              />
            </td>
            <td data-label="Équipé">
              <input
                type="checkbox"
                defaultChecked={item.equipped}
                className="h-4 w-4"
                onChange={(e) =>
                  startTransition(() => {
                    void toggleEquipped(item.id, slug, e.currentTarget.checked);
                  })
                }
              />
            </td>
            <td data-label="Harmonisé">
              {item.requiresAttunement ? (
                <input
                  type="checkbox"
                  defaultChecked={item.attuned}
                  className="h-4 w-4"
                  onChange={(e) =>
                    startTransition(() => {
                      void toggleAttuned(item.id, slug, e.currentTarget.checked);
                    })
                  }
                />
              ) : (
                <span className="text-text-subtle">—</span>
              )}
            </td>
            <td data-label="">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => startTransition(() => void deleteItem(item.id, slug))}
              >
                Retirer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </RulesTable>
  );
}

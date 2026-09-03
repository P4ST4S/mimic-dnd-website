import type { CSSProperties } from "react";
import { hpRatio, hpState } from "@/lib/rules";

interface HpBarProps {
  current: number;
  max: number;
  temp?: number;
}

export function HpBar({ current, max, temp = 0 }: HpBarProps) {
  const ratio = hpRatio(current, max);
  const tempRatio = max > 0 ? Math.max(0, Math.min(1, temp / max)) : 0;
  const state = hpState(current, max);
  const style = {
    "--hp-ratio": ratio,
    "--temp-ratio": tempRatio,
  } as CSSProperties;

  return (
    <div
      className="hp-bar"
      data-state={state}
      style={style}
      role="meter"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label="Points de vie"
    >
      <div className="hp-bar__fill" />
      {temp > 0 && <div className="hp-bar__temp" />}
      <div className="hp-bar__label">
        {current} / {max}
        {temp > 0 ? ` (+${temp})` : ""}
      </div>
    </div>
  );
}

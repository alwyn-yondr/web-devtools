import { useMemo, useState } from "react";
import CopyPre from "../components/CopyPre";
import {
  GITIGNORE_PRESETS,
  PRESET_LABELS,
} from "../data/gitignorePresets";

const IDS = Object.keys(GITIGNORE_PRESETS);

function mergeLines(selectedIds) {
  const seen = new Set();
  const out = [];
  for (const id of selectedIds) {
    const lines = GITIGNORE_PRESETS[id] || [];
    for (const line of lines) {
      const t = line.trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

export default function GitignoreComposer({ onToast }) {
  const [selected, setSelected] = useState(() => new Set(["node"]));
  const [extra, setExtra] = useState("");

  const toggle = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const content = useMemo(() => {
    const lines = mergeLines([...selected]);
    const extraLines = extra
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const l of extraLines) {
      if (!lines.includes(l)) lines.push(l);
    }
    const body = lines.join("\n");
    return body ? `# DevKit .gitignore\n${body}\n` : "";
  }, [selected, extra]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-[34px] sm:text-[50px] font-normal mb-4 tracking-[-0.055em] leading-[0.9] text-stone-900 dark:text-stone-50">
          .gitignore
        </h2>
        <p className="text-[17px] tracking-[-0.01em] text-stone-500 dark:text-stone-400">
          Combine preset blocks and your own lines; duplicates removed.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-800 p-6 sm:p-8 rounded-3xl space-y-6">
        <div>
          <label className="block text-sm text-stone-500 dark:text-stone-400 mb-3">
            Presets
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {IDS.map((id) => (
              <label
                key={id}
                className="flex items-center gap-2 cursor-pointer font-mono text-sm text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 p-2 hover:bg-stone-50 dark:hover:bg-stone-950"
              >
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => toggle(id)}
                />
                {PRESET_LABELS[id] || id}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-stone-500 dark:text-stone-400 mb-2">
            Extra lines (one per row)
          </label>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={4}
            placeholder="custom-folder/"
            className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <span className="block text-sm text-stone-500 dark:text-stone-400 mb-2">
            Preview
          </span>
          <CopyPre
            text={content || ""}
            onCopySuccess={() => onToast("Copied!")}
            className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 max-h-64 overflow-y-auto"
            preClassName="p-4 font-mono text-xs whitespace-pre-wrap text-stone-800 dark:text-stone-200"
          >
            {content || "—"}
          </CopyPre>
        </div>
      </div>
    </div>
  );
}

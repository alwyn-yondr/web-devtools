import { useState, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { faker } from "@faker-js/faker";

export default function LoremIpsum({ onToast }) {
  const [mode, setMode] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    if (mode === "paragraphs") {
      setOutput(faker.lorem.paragraphs(count, "\n\n"));
    } else if (mode === "sentences") {
      setOutput(faker.lorem.sentences(count));
    } else {
      setOutput(faker.lorem.words(count));
    }
  }, [mode, count]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-[34px] sm:text-[50px] font-normal mb-4 tracking-[-0.055em] leading-[0.9] text-stone-900 dark:text-stone-50">
          Lorem Ipsum
        </h2>
        <p className="text-[17px] tracking-[-0.01em] text-stone-500 dark:text-stone-400">
          Generate placeholder text for your projects.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-800 p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px] flex-wrap">
          {[
            { id: "paragraphs", label: "Paragraphs" },
            { id: "sentences", label: "Sentences" },
            { id: "words", label: "Words" },
          ].map((m) => (
            <button
              key={m.id}
              className={`px-3 py-1.5 transition-colors ${
                mode === m.id
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm text-stone-500 dark:text-stone-400 mb-2">
            Count
          </label>
          <input
            type="number"
            min="1"
            max={mode === "words" ? 100 : 20}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <Button onClick={generate} icon={ArrowsClockwise}>
          Generate
        </Button>

        {output && (
          <>
            <label className="block text-sm text-stone-500 dark:text-stone-400 mb-2">
              Output
            </label>
            <CopyArea
              text={output}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </div>
    </div>
  );
}

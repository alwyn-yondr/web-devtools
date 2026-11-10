import { useState } from "react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";

export default function JsonFormatter({ onToast }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const format = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  const validate = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      JSON.parse(input);
      setOutput("Valid JSON");
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-[34px] sm:text-[50px] font-normal mb-4 tracking-[-0.055em] leading-[0.9] text-stone-900 dark:text-stone-50">
          JSON Formatter
        </h2>
        <p className="text-[17px] tracking-[-0.01em] text-stone-500 dark:text-stone-400">
          Format and validate JSON with pretty-print and error reporting.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-800 p-6 sm:p-8 rounded-3xl space-y-4">
        <label className="block text-sm text-stone-500 dark:text-stone-400 mb-2">
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-40 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
        />

        <div className="flex gap-2">
          <Button onClick={format}>Format</Button>
          <Button onClick={validate} variant="secondary">
            Validate
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

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

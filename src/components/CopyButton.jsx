import { useState } from "react";
import { ClipboardText, Check } from "phosphor-react";
import { copyToClipboard } from "../utils/clipboard";

export default function CopyButton({
  text,
  onCopySuccess,
  title = "Copy to clipboard",
  className = "",
  size = 18,
  disabled,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text || disabled) return;
    copyToClipboard(text, () => {
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      title={title}
      aria-label={title}
      className={`p-2 rounded-full bg-white text-stone-900 hover:bg-mint dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-mint transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? (
        <Check size={size} weight="thin" className="text-mint dark:text-emerald-600" />
      ) : (
        <ClipboardText size={size} weight="thin" />
      )}
    </button>
  );
}

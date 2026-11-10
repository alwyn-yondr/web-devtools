import CopyButton from "./CopyButton";

const CopyArea = ({ text, onCopySuccess }) => {
  return (
    <div className="relative group mt-4">
      <div className="w-full rounded-2xl bg-stone-100 dark:bg-stone-900 p-4 pr-16 text-sm font-mono text-stone-800 dark:text-stone-100 break-words whitespace-pre-wrap min-h-[3.5rem] flex items-start">
        {text || (
          <span className="text-stone-400 italic">
            Waiting for generation...
          </span>
        )}
      </div>
      <CopyButton
        text={text}
        onCopySuccess={onCopySuccess}
        className="absolute right-2 top-2"
      />
    </div>
  );
};

export default CopyArea;

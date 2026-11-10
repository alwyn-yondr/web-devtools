const Button = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled = false,
}) => {
  const baseStyle =
    "flex cursor-pointer items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[15px] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-mint focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-stone-900 text-stone-100 hover:bg-mint hover:text-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-mint",
    secondary:
      "bg-stone-200 text-stone-900 hover:bg-mint dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-mint dark:hover:text-stone-900",
    outline:
      "border border-stone-300 text-stone-900 hover:bg-mint hover:border-mint dark:border-stone-600 dark:text-stone-100 dark:hover:text-stone-900",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} weight="thin" />}
      {children}
    </button>
  );
};

export default Button;

export function Button({
  children,
  onClick,
}: {
  children?: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="transition-all duration-100 shadow rounded-md font-medium text-white h-8 px-4 w-fit bg-gradient-to-t from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200"
    >
      {children}
    </button>
  );
}

export function FloatingBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="absolute top-12 -right-24 h-80 w-80 rounded-full bg-brand-500/18 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-3xl" />
    </div>
  );
}

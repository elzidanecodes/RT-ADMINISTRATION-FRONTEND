export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={`input-dark w-full px-md py-2.5 text-body-sm ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

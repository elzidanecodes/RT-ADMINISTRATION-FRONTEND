export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
          {label}
        </label>
      )}
      <select
        className={`input-dark w-full px-md py-2.5 text-body-sm ${error ? 'border-error' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

const variants = {
  primary:   'bg-primary text-on-primary hover:brightness-110 hover:shadow-[0_0_18px_rgba(0,108,73,0.3)] active:scale-[0.99]',
  secondary: 'border border-primary/20 text-on-surface-variant hover:bg-primary/[0.06] hover:text-primary hover:border-primary/40 active:bg-primary/10',
  danger:    'bg-error/10 text-error border border-error/20 hover:bg-error/20',
};

export default function Button({ children, variant = 'primary', className = '', loading, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-sm px-md py-2 rounded-lg text-body-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

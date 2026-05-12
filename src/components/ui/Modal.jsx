export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg', hideTitle = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />
      <div className={`glass-card glass-card-active rounded-xl w-full ${maxWidth} flex flex-col max-h-[90vh] relative`} onClick={(e) => e.stopPropagation()}>
        {!hideTitle && (
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/20">
            <h2 className="font-headline-md text-body-main font-semibold text-on-surface">{title}</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-lg py-md">{children}</div>
      </div>
    </div>
  );
}

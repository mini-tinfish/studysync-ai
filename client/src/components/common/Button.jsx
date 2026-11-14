const VARIANTS = {
  primary:
    'bg-lavender-600 text-white shadow-soft hover:bg-lavender-700 hover:shadow-lift',
  secondary:
    'bg-white text-lavender-700 ring-1 ring-lavender-200 hover:bg-lavender-50',
}

/** Renders an <a> when `href` is given, otherwise a <button>. */
export default function Button({ href, variant = 'primary', className = '', children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${VARIANTS[variant]} ${className}`
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

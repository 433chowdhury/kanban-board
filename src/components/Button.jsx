function Button({ children, ...rest }) {
  return (
    <button
      {...rest}
      className="px-7 py-1 border border-black text-accent text-base font-medium active:opacity-75"
    >
      {children}
    </button>
  );
}

export default Button;

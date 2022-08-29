function Button({ children, className, ...rest }) {
  return (
    <button
      {...rest}
      className={
        "px-7 py-1 border border-black text-accent text-base font-medium active:opacity-75 disabled:opacity-60 " +
        className
      }
    >
      {children}
    </button>
  );
}

export default Button;

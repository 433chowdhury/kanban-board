function TextButton({ children, className, ...rest }) {
  return (
    <button {...rest} className={"p-0 disabled:opacity-60 " + className}>
      {children}
    </button>
  );
}

export default TextButton;

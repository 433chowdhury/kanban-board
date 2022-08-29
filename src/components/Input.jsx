function Input({ className, ...rest }) {
  return (
    <input
      {...rest}
      className={
        "px-10 py-3 border border-black text-2xl w-[267px] h-[43px] placeholder:text-neutral-500/95 " +
        className
      }
    />
  );
}

export default Input;

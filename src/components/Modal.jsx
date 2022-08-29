import { createPortal } from "react-dom";

function Modal({ children, className, onClose }) {
  return createPortal(
    <div
      className={"fixed inset-0 flex justify-center items-center " + className}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="z-10 py-8 px-12 bg-white">{children}</div>
    </div>,
    document.body
  );
}

export default Modal;

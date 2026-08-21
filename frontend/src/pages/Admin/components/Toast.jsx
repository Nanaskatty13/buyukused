import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    padding: "12px 24px",
    borderRadius: "10px",
    color: "white",
    fontWeight: 600,
    zIndex: 99999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    background: type === "success" ? "#16a34a" : "#dc2626",
  };

  return <div style={styles}>{message}</div>;
}
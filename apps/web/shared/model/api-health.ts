import { useEffect, useState } from "react";
import { health } from "../../lib/api";

export function useApiHealth() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    let active = true;
    health()
      .then(() => active && setStatus("ok"))
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  return status;
}

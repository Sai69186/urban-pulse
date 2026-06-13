/**
 * Calls `refresh()` whenever the user uploads new data.
 * Usage: useUploadRefresh(refresh)
 */
import { useEffect } from "react";
import { useData } from "../context/DataContext";

export function useUploadRefresh(refresh) {
  const { totalUploaded } = useData();
  useEffect(() => {
    if (typeof refresh === "function") refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalUploaded]);
}

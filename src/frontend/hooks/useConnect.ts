
import { useMutation } from "@tanstack/react-query";
import { connectToServer } from "@/frontend/lib/api";

export function useConnect() {
  return useMutation({
    mutationFn: connectToServer,
  });
}


import { useMutation } from "@tanstack/react-query";
import { connectToServer } from "@/app/lib/api";

export function useConnect() {
  return useMutation({
    mutationFn: connectToServer,
  });
}

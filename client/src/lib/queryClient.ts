import { QueryClient } from "@tanstack/react-query";

export async function apiRequest(method: string, url: string, data?: any) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Request failed");
  }
  
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        return res.json();
      },
    },
  },
});

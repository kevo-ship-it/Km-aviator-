import { QueryClient } from "@tanstack/react-query";

export async function apiRequest(method: string, url: string, data?: any) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });
  
  // Get the text response first
  const text = await response.text();
  
  // Handle empty responses
  if (!text) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return { success: true };
  }
  
  // Parse JSON
  let result;
  try {
    result = JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', text);
    throw new Error('Invalid server response');
  }
  
  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }
  
  // Return the parsed data directly, not the response object
  return result;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        const text = await response.text();
        
        if (!text) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return { success: true };
        }
        
        let result;
        try {
          result = JSON.parse(text);
        } catch (error) {
          throw new Error('Invalid server response');
        }
        
        if (!response.ok) {
          throw new Error(result.message || "Request failed");
        }
        
        return result;
      },
    },
  },
});

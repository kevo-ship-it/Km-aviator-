import { QueryClient } from "@tanstack/react-query";

export async function apiRequest(method: string, url: string, data?: any) {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Get response text first to handle empty responses
    const responseText = await res.text();
    
    if (!responseText || responseText.trim() === '') {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return { success: true };
    }
    
    // Parse JSON safely
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON parsing failed. Response:', responseText);
      throw new Error('Server returned invalid JSON format');
    }
    
    if (!res.ok) {
      throw new Error(responseData.message || responseData.error || "Request failed");
    }
    
    return responseData;
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const res = await fetch(queryKey[0] as string, {
            credentials: "include",
          });
          
          // Get response text first
          const responseText = await res.text();
          
          if (!responseText || responseText.trim() === '') {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return { success: true };
          }
          
          // Parse JSON safely
          try {
            const data = JSON.parse(responseText);
            
            if (!res.ok) {
              throw new Error(data.message || data.error || "Request failed");
            }
            
            return data;
          } catch (jsonError) {
            console.error('JSON parsing failed. Response:', responseText);
            throw new Error('Server returned invalid JSON format');
          }
          
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection.');
          }
          throw error;
        }
      },
    },
  },
});

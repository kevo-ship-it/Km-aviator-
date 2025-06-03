import { QueryClient } from "@tanstack/react-query";

export async function apiRequest(method: string, url: string, data?: any) {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Get response as text first to handle all cases
    const responseText = await response.text();
    
    // Handle completely empty responses
    if (!responseText || responseText.trim() === '') {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return { success: true, data: null };
    }
    
    // Parse JSON with error handling
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Server returned invalid JSON');
    }
    
    // Handle error responses
    if (!response.ok) {
      const errorMessage = parsedData?.message || parsedData?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return parsedData;
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed');
    }
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const url = queryKey[0] as string;
          const response = await fetch(url, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          // Get response as text first
          const responseText = await response.text();
          
          // Handle empty responses
          if (!responseText || responseText.trim() === '') {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return { success: true, data: null };
          }
          
          // Parse JSON safely
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Query JSON parse error:', responseText);
            throw new Error('Invalid server response');
          }
          
          // Handle error responses
          if (!response.ok) {
            const errorMessage = data?.message || data?.error || `Request failed`;
            throw new Error(errorMessage);
          }
          
          return data;
          
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network connection failed');
          }
          throw error;
        }
      },
    },
  },
});

// Fetch utility functions with better error handling

/**
 * Safely parse JSON from a response
 * @param response The fetch response
 * @returns The parsed JSON or null if parsing fails
 */
export async function safeJsonParse(response: Response) {
  try {
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        // Try to parse error as JSON
        errorData = errorText ? JSON.parse(errorText) : { error: `HTTP error ${response.status}` };
      } catch (e) {
        // If parsing fails, use the raw text
        errorData = { error: errorText || `HTTP error ${response.status}` };
      }
      
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    // For successful responses, check if there's content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }
      return JSON.parse(text);
    }
    
    // For non-JSON responses
    return null;
  } catch (error) {
    console.error('Error parsing response:', error);
    throw error;
  }
}

/**
 * Enhanced fetch function with better error handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The parsed JSON response
 */
export async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    return await safeJsonParse(response);
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
} 
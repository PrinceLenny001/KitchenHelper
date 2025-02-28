// API utility functions for consistent error handling

/**
 * Safely parse JSON from a request
 * @param request The request object
 * @returns The parsed JSON or null if parsing fails
 */
export async function safeParseJson(request: Request) {
  try {
    const text = await request.text();
    if (!text || text.trim() === '') {
      return null;
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

/**
 * Create a consistent error response
 * @param message Error message
 * @param status HTTP status code
 * @returns Response object with JSON error
 */
export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Create a consistent success response
 * @param data Data to return
 * @param status HTTP status code
 * @returns Response object with JSON data
 */
export function successResponse(data: any, status = 200) {
  return Response.json(data, { status });
}

/**
 * Handle API errors consistently
 * @param error Error object
 * @returns Response object with JSON error
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return errorResponse(message, 500);
} 
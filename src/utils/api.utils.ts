/**
 * Utility functions for sanitizing and formatting API request query parameters
 * before dispatching HTTP REST calls to the backend server.
 */

export const cleanQueryParams = (params?: Record<string, any>): Record<string, any> | undefined => {
  if (!params || typeof params !== 'object') return undefined;

  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    // Ignore empty/default values that break backend SQL WHERE clauses
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'all' ||
      value === 'ALL' ||
      (key === 'minFlags' && Number(value) === 0) ||
      (key === 'min_flags' && Number(value) === 0)
    ) {
      continue;
    }

    // Map camelCase keys to backend API spec snake_case params
    let mappedKey = key;
    if (key === 'personType') mappedKey = 'person_type';
    if (key === 'societyName') mappedKey = 'society';
    if (key === 'minFlags') mappedKey = 'min_flags';

    cleaned[mappedKey] = value;
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

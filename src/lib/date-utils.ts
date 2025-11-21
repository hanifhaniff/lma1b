/**
 * Utility functions for consistent date formatting across the application
 */

/**
 * Format a date string consistently for both server and client
 * @param dateString - The date string to format
 * @returns Formatted date string in MM/DD/YYYY format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    // Use en-US locale to ensure consistent formatting between server and client
    return date.toLocaleDateString('en-US');
  } catch (error) {
    console.error('Error formatting date:', error);
    return "-";
  }
}

/**
 * Format a date string for input fields (YYYY-MM-DD)
 * @param dateString - The date string to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return "";
  }
}
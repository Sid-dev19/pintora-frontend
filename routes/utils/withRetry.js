const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Wrapper function with retry logic for Supabase queries
 * @param {Function} operation - The async function to execute
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Initial delay between retries in milliseconds
 * @returns {Promise<any>} - The result of the operation
 */
async function withRetry(operation, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            // Don't retry for these error codes
            const nonRetryableErrors = [
                '42703', // Column doesn't exist
                '42P01', // Table doesn't exist
                '23505'  // Unique violation
            ];
            
            if (nonRetryableErrors.includes(error.code)) {
                console.warn('Non-retryable error, aborting:', error.code);
                throw error;
            }
            
            if (attempt < maxRetries) {
                const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
                console.warn(`Retrying in ${waitTime}ms... (${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    const error = lastError || new Error('Operation failed after maximum retries');
    error.retriesExhausted = true;
    throw error;
}

module.exports = withRetry;

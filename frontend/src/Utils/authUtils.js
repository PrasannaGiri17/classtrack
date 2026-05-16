/**
 * Safely decodes a JWT token payload without verifying signature.
 * Returns the decoded payload object or null if token is invalid/missing.
 */
export const getDecodedToken = (token) => {
    if (!token || token === "null" || token === "undefined") return null;
    
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token:", e);
        return null;
    }
};

/**
 * Returns the current auth token if valid.
 */
export const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return null;
    return token;
};

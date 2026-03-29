/**
 * Generates a consistent conversation ID for two users.
 * Sorts their IDs to ensure the same ID is returned regardless of who is sender or receiver.
 * @param {string} id1 - The ID of the first user.
 * @param {string} id2 - The ID of the second user.
 * @returns {string} - The unique conversation ID (e.g., "idA_idB").
 */
const generateConversationId = (id1, id2) => {
    return [id1.toString(), id2.toString()].sort().join('_');
};

module.exports = { generateConversationId };

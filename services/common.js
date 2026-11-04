const { ObjectId } = require("mongodb");

async function exists(key, value, collection) {
    const result = await collection.findOne({ [key]: value });
    return result;
}

function toObjectId(id) {
    if (!id) return null;
    if (id instanceof ObjectId) return id;
    if (typeof id === "string" && ObjectId.isValid(id)) {
        return new ObjectId(id);
    }
    return null;
}

function handleServerError(res, error, customMessage = "An error occurred while processing your request") {
    console.error(error);

    const isClientError = error && error.statusCode && error.statusCode >= 400 && error.statusCode < 500;
    const status = isClientError ? error.statusCode : 500;
    const message = isClientError && error.message ? error.message : customMessage;

    return res.status(status).json({
        message,
        data: null
    });
}

function normalizeUsername(username) {
    return username ? username.toLowerCase().trim() : "";
}

module.exports = {
    exists,
    toObjectId,
    handleServerError,
    normalizeUsername
};

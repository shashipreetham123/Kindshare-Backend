const argon2 = require("argon2");
const User = require("../models/User");

function normalizeUser(userData) {
    return {
        ...userData,
        username: userData.username ? userData.username.toLowerCase().trim() : "",
        type: userData.type ? userData.type.toLowerCase().trim() : "",
        email: userData.email ? userData.email.toLowerCase().trim() : ""
    };
}

async function hashPassword(password) {
    return await argon2.hash(password);
}

async function verifyPassword(hashedPassword, plainPassword) {
    return await argon2.verify(hashedPassword, plainPassword);
}

function toUserDoc(user) {
    return {
        username: user.username,
        password: user.password,
        type: user.type,
        email: user.email,
        address: user.address,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        isAdmin: !!user.isAdmin,
        verified: !!user.verified
    };
}

function toUserJSON(user) {
    return {
        username: user.username,
        type: user.type,
        email: user.email,
        address: user.address,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        isAdmin: !!user.isAdmin,
        verified: !!user.verified
    };
}

async function createUser(userData, usersCollection) {
    const normalized = normalizeUser(userData);
    const hashedPassword = await hashPassword(normalized.password);

    const isAdmin = Boolean(userData.isAdmin);
    const verified = Boolean(userData.verified);

    const user = new User(
        normalized.username,
        hashedPassword,
        normalized.type,
        normalized.phoneNumber,
        normalized.countryCode,
        normalized.address,
        normalized.email,
        undefined,
        isAdmin,
        verified
    );

    const doc = toUserDoc(user);
    const result = await usersCollection.insertOne(doc);

    if (result.acknowledged && result.insertedId) {
        user._id = result.insertedId;
    }

    return user;
}

async function getUserByUsername(username, usersCollection) {
    const normalizedUsername = username.toLowerCase().trim();
    const doc = await usersCollection.findOne({ username: normalizedUsername });

    if (!doc) {
        return null;
    }

    return new User(
        doc.username,
        doc.password,
        doc.type,
        doc.phoneNumber,
        doc.countryCode,
        doc.address,
        doc.email,
        doc._id,
        !!doc.isAdmin,
        !!doc.verified
    );
}

async function userExists(username, usersCollection) {
    const normalizedUsername = username.toLowerCase().trim();
    const doc = await usersCollection.findOne({ username: normalizedUsername });
    return !!doc;
}

module.exports = {
    normalizeUser,
    hashPassword,
    verifyPassword,
    toUserDoc,
    toUserJSON,
    createUser,
    getUserByUsername,
    userExists
};

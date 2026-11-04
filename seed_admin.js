const { MongoClient } = require("mongodb");
const argon2 = require("argon2");
require("./config/env");

async function seedAdmin() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.DB_NAME || "kindshare";

    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log("Connected to MongoDB successfully");

        const db = client.db(dbName);
        const usersCollection = db.collection("users");
        const historyCollection = db.collection("history");

        const adminUsername = "admin";
        const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "admin123";

        const existingAdmin = await usersCollection.findOne({ username: adminUsername });

        const hashedPassword = await argon2.hash(adminPassword);

        if (existingAdmin) {
            console.log(`User '${adminUsername}' already exists. Updating to ensure isAdmin: true and verified: true...`);
            await usersCollection.updateOne(
                { username: adminUsername },
                {
                    $set: {
                        isAdmin: true,
                        verified: true,
                        password: hashedPassword,
                        type: "organization",
                        email: existingAdmin.email || "admin@kindshare.org",
                        countryCode: existingAdmin.countryCode || "+1",
                        phoneNumber: existingAdmin.phoneNumber || "1234567890",
                        address: existingAdmin.address || "100 KindShare HQ, Suite 100"
                    }
                }
            );
            console.log(`Admin user '${adminUsername}' credentials updated.`);
        } else {
            console.log(`Admin user does not exist. Creating user '${adminUsername}'...`);
            const adminUserDoc = {
                username: adminUsername,
                password: hashedPassword,
                type: "organization",
                email: "admin@kindshare.org",
                countryCode: "+1",
                phoneNumber: "1234567890",
                address: "100 KindShare HQ, Suite 100",
                isAdmin: true,
                verified: true,
                createdAt: new Date()
            };

            await usersCollection.insertOne(adminUserDoc);

            await historyCollection.insertOne({
                username: adminUsername,
                event: "admin seed initialization",
                date: new Date(),
                summaryShort: "Default Admin user initialized",
                summaryLong: "System seed script initialized default root administrator account with full privileges."
            });

            console.log(`Admin user '${adminUsername}' created successfully.`);
        }

        console.log("Admin seeding complete.");
        console.log(`Credentials: Username: '${adminUsername}', Password: '${adminPassword}'`);
    } catch (err) {
        console.error("Failed to seed admin user:", err);
    } finally {
        await client.close();
    }
}

seedAdmin();


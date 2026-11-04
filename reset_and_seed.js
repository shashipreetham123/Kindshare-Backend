const { MongoClient, ObjectId } = require("mongodb");
const argon2 = require("argon2");
require("./config/env");

async function resetAndSeedDatabase() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.DB_NAME || "kindshare";

    console.log(`Connecting to MongoDB at ${mongoUri}, database: ${dbName}...`);
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log("MongoDB connection established.");

        const db = client.db(dbName);

        const collections = ["users", "products", "requests", "reserves", "history"];

        console.log("\n--- STEP 1: Clearing existing datasets ---");
        for (const colName of collections) {
            const col = db.collection(colName);
            const count = await col.countDocuments();
            await col.deleteMany({});
            console.log(`Cleared collection '${colName}' (deleted ${count} documents)`);
        }

        console.log("\n--- STEP 2: Seeding valid user accounts ---");
        const defaultPasswordHash = await argon2.hash("password123");
        const adminPasswordHash = await argon2.hash("admin123");

        const sampleUsers = [
            {
                username: "admin",
                password: adminPasswordHash,
                type: "organization",
                email: "admin@kindshare.org",
                countryCode: "+1",
                phoneNumber: "1234567890",
                address: "KindShare Headquarters, 100 Hope St, New York, NY",
                isAdmin: true,
                verified: true,
                createdAt: new Date(Date.now() - 3600000 * 24 * 30)
            },
            {
                username: "sarah_gives",
                password: defaultPasswordHash,
                type: "individual",
                email: "sarah@communityrelief.org",
                countryCode: "+1",
                phoneNumber: "5551234567",
                address: "45 Elm Boulevard, Apt 3B, Boston, MA",
                isAdmin: false,
                verified: true,
                createdAt: new Date(Date.now() - 3600000 * 24 * 20)
            },
            {
                username: "hope_foodbank",
                password: defaultPasswordHash,
                type: "organization",
                email: "support@hopefoodbank.org",
                countryCode: "+1",
                phoneNumber: "5559876543",
                address: "800 Charity Way, Suite 12, Chicago, IL",
                isAdmin: false,
                verified: true,
                createdAt: new Date(Date.now() - 3600000 * 24 * 15)
            },
            {
                username: "alex_shares",
                password: defaultPasswordHash,
                type: "individual",
                email: "alex.shares@email.com",
                countryCode: "+1",
                phoneNumber: "5554567890",
                address: "742 Evergreen Terrace, Springfield, OR",
                isAdmin: false,
                verified: false,
                createdAt: new Date(Date.now() - 3600000 * 24 * 10)
            },
            {
                username: "city_bakery",
                password: defaultPasswordHash,
                type: "business",
                email: "donations@citybakery.com",
                countryCode: "+1",
                phoneNumber: "5557891234",
                address: "12 Market Square, Seattle, WA",
                isAdmin: false,
                verified: true,
                createdAt: new Date(Date.now() - 3600000 * 24 * 5)
            },
            {
                username: "user1",
                password: defaultPasswordHash,
                type: "individual",
                email: "user1@example.com",
                countryCode: "+1",
                phoneNumber: "5550001111",
                address: "101 Pine Street, Austin, TX",
                isAdmin: false,
                verified: false,
                createdAt: new Date(Date.now() - 3600000 * 24 * 2)
            }
        ];

        const usersCol = db.collection("users");
        await usersCol.insertMany(sampleUsers);
        console.log(`Inserted ${sampleUsers.length} valid user accounts.`);

        console.log("\n--- STEP 3: Seeding realistic products ---");
        const productsCol = db.collection("products");

        const sampleProducts = [
            {
                _id: new ObjectId(),
                name: "Warm Insulated Winter Parka (Size L)",
                description: "Clean, weather-resistant insulated winter jacket with detachable hood. Sanitized and in pristine condition for winter warming drives.",
                username: "sarah_gives",
                quantity: 4,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 4)
            },
            {
                _id: new ObjectId(),
                name: "Non-Perishable Family Meal Pantry Pack",
                description: "Wholesome shelf-stable goods containing dried black beans, rolled oats, brown rice, whole canned tomatoes, and vegetable broth.",
                username: "hope_foodbank",
                quantity: 25,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 8)
            },
            {
                _id: new ObjectId(),
                name: "Artisan Whole Grain Sourdough & Bagels",
                description: "Freshly packaged day-end surplus whole wheat loaves and assorted sesame bagels from local morning bake. Ready for immediate pickup.",
                username: "city_bakery",
                quantity: 18,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 12)
            },
            {
                _id: new ObjectId(),
                name: "Elementary Backpack & School Supplies Set",
                description: "Padded durable backpacks loaded with ruled notebooks, colored pencils, safety scissors, rulers, and glue sticks for young students.",
                username: "sarah_gives",
                quantity: 10,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 18)
            },
            {
                _id: new ObjectId(),
                name: "Emergency Thermal Fleece Blankets (Box of 10)",
                description: "Heavy duty, windproof emergency thermal survival blankets for local warming shelters and crisis response.",
                username: "hope_foodbank",
                quantity: 15,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 24)
            },
            {
                _id: new ObjectId(),
                name: "Children Illustrated Adventure Books (Set of 8)",
                description: "Collection of award-winning picture and early reader books for ages 4-9 in clean, excellent condition.",
                username: "alex_shares",
                quantity: 6,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 30)
            },
            {
                _id: new ObjectId(),
                name: "Essential Kitchen Cookware & Utensils Kit",
                description: "Stainless steel soup pot, 10-inch skillet, cooking spoons, chef knife, and cutting board for transitional housing families.",
                username: "alex_shares",
                quantity: 3,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 36)
            },
            {
                _id: new ObjectId(),
                name: "Certified First Aid & Trauma Response Kit",
                description: "Sterile gauze bandages, antiseptic wipes, burn dressings, emergency shears, and surgical tape.",
                username: "hope_foodbank",
                quantity: 8,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 48)
            },
            {
                _id: new ObjectId(),
                name: "Infant Diapers & Hypoallergenic Wipes Pack",
                description: "Unopened boxes of Size 2 diapers along with sensitive skin baby wipes for young families.",
                username: "sarah_gives",
                quantity: 12,
                accessLevel: 4,
                coverImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80",
                images: [
                    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80"
                ],
                listedAt: new Date(Date.now() - 3600000 * 60)
            }
        ];

        await productsCol.insertMany(sampleProducts);
        console.log(`Inserted ${sampleProducts.length} valid community products.`);

        console.log("\n--- STEP 4: Seeding sample requests & reserves ---");
        const requestsCol = db.collection("requests");
        const reservesCol = db.collection("reserves");

        const sampleRequests = [
            {
                _id: new ObjectId(),
                productId: sampleProducts[0]._id, // Winter Parka
                donorUsername: "sarah_gives",
                beneficiaryUsername: "alex_shares",
                quantity: 1,
                requestedOn: new Date(Date.now() - 3600000 * 2),
                note: "Hello Sarah, requesting a winter jacket for our community member who recently relocated."
            },
            {
                _id: new ObjectId(),
                productId: sampleProducts[2]._id, // Bread & Bagels
                donorUsername: "city_bakery",
                beneficiaryUsername: "user1",
                quantity: 2,
                requestedOn: new Date(Date.now() - 3600000 * 1),
                note: "Would love to pick up fresh bread for our family evening meal. Thank you!"
            }
        ];
        await requestsCol.insertMany(sampleRequests);
        console.log(`Inserted ${sampleRequests.length} active requests.`);

        const sampleReserves = [
            {
                _id: new ObjectId(),
                productId: sampleProducts[1]._id, // Pantry Pack
                donorUsername: "hope_foodbank",
                beneficiaryUsername: "user1",
                quantity: 2,
                reservedOn: new Date(Date.now() - 3600000 * 10),
                pickupNotes: "Pickup scheduled for tomorrow at the community distribution center.",
                donorCompleted: false,
                beneficiaryCompleted: false
            }
        ];
        await reservesCol.insertMany(sampleReserves);
        console.log(`Inserted ${sampleReserves.length} active reserves.`);

        console.log("\n--- STEP 5: Seeding global audit history ---");
        const historyCol = db.collection("history");
        const sampleHistory = [
            {
                username: "admin",
                event: "system initialize",
                date: new Date(Date.now() - 3600000 * 24 * 30),
                summaryShort: "KindShare platform database initialized",
                summaryLong: "System initialized default root administrator account and foundational collections."
            },
            {
                username: "sarah_gives",
                event: "user registration",
                date: new Date(Date.now() - 3600000 * 24 * 20),
                summaryShort: "User @sarah_gives registered",
                summaryLong: "Sarah registered as an Individual donor account."
            },
            {
                username: "sarah_gives",
                event: "admin verify user",
                date: new Date(Date.now() - 3600000 * 24 * 19),
                summaryShort: "Account verified by admin",
                summaryLong: 'Admin "admin" set verification status of user "sarah_gives" to true.'
            },
            {
                username: "sarah_gives",
                event: "product list",
                date: new Date(Date.now() - 3600000 * 4),
                summaryShort: 'Listed product "Warm Insulated Winter Parka"',
                summaryLong: 'User "sarah_gives" listed 4 unit(s) of "Warm Insulated Winter Parka".'
            },
            {
                username: "alex_shares",
                event: "request",
                date: new Date(Date.now() - 3600000 * 2),
                summaryShort: "Requested 1 item(s) from sarah_gives",
                summaryLong: 'Beneficiary "alex_shares" requested 1 unit(s) of winter parka from donor "sarah_gives".'
            }
        ];
        await historyCol.insertMany(sampleHistory);
        console.log(`Inserted ${sampleHistory.length} audit history logs.`);

        console.log("\n=======================================================");
        console.log("   DATASET RESET & SEEDING COMPLETED SUCCESSFULLY!");
        console.log("=======================================================");
        console.log("Available Test Accounts:");
        console.log("  1) Administrator:  username: 'admin',        password: 'admin123'");
        console.log("  2) Verified Donor: username: 'sarah_gives',  password: 'password123'");
        console.log("  3) Food Bank Org:  username: 'hope_foodbank',password: 'password123'");
        console.log("  4) Bakery Biz:     username: 'city_bakery',  password: 'password123'");
        console.log("  5) Member:         username: 'alex_shares',  password: 'password123'");
        console.log("  6) Beneficiary:    username: 'user1',        password: 'password123'");
        console.log("=======================================================\n");

    } catch (err) {
        console.error("Dataset seeding failed:", err);
    } finally {
        await client.close();
    }
}

resetAndSeedDatabase();


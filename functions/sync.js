const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function sync() {
    const usersPath = path.join(__dirname, '..', 'users.json');
    if (!fs.existsSync(usersPath)) {
        console.error('users.json not found at', usersPath);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const users = data.users;

    console.log(`Syncing ${users.length} users to Firestore...`);

    for (const user of users) {
        if (user.email) {
            console.log(`Syncing ${user.email} (${user.localId})...`);
            try {
                await db.collection('users').doc(user.localId).set({
                    email: user.email
                }, { merge: true });
            } catch (e) {
                console.error(`Failed to sync ${user.email}:`, e.message);
            }
        }
    }

    console.log('All users synced successfully!');
    process.exit(0);
}

sync();

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
    apiKey: "AIzaSyDxYl84Of2pzNvH9Rw8l4queQ3jJuwEZy4",
    authDomain: "time-tracker-and-invoice.firebaseapp.com",
    projectId: "time-tracker-and-invoice"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sync() {
    const data = JSON.parse(fs.readFileSync("users.json", "utf8"));
    const users = data.users;

    console.log(`Syncing ${users.length} users...`);

    for (const user of users) {
        if (user.email) {
            console.log(`Syncing ${user.email} (${user.localId})...`);
            await setDoc(doc(db, "users", user.localId), {
                email: user.email
            }, { merge: true });
        }
    }

    console.log("Done!");
    process.exit(0);
}

sync().catch(console.error);

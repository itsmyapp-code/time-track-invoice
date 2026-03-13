import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDxYl84Of2pzNvH9Rw8l4queQ3jJuwEZy4",
    authDomain: "time-tracker-and-invoice.firebaseapp.com",
    projectId: "time-tracker-and-invoice"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    console.log("Checking products collection...");
    const pSnap = await getDocs(collection(db, "products"));
    console.log(`Found ${pSnap.docs.length} products`);
    for (const d of pSnap.docs) {
        console.log(`Product: ${d.id} | active: ${d.data().active}`);
        const prSnap = await getDocs(collection(d.ref, "prices"));
        console.log(`  Found ${prSnap.docs.length} prices for ${d.id}`);
        for (const p of prSnap.docs) {
            console.log(`    Price: ${p.id} | active: ${p.data().active}`);
        }
    }
    process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });

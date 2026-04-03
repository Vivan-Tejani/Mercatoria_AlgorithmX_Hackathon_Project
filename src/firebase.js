import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "http://localhost:9000?ns=YOUR_PROJECT_ID", // important
  projectId: "YOUR_PROJECT_ID",
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Get DB
const db = getDatabase(app);

// 🔥 Connect to LOCAL emulator
connectDatabaseEmulator(db, "localhost", 9000);

export { db };
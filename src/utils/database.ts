import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

const connect = async () => {
    try {
        await mongoose.connect(DATABASE_URL, {
            dbName: "ngontolodon",
        });
        return Promise.resolve("Database connection established")
    } catch (error) {
        return Promise.reject(error);
    }
}

export default connect;
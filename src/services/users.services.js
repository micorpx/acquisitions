import logger from "../config/logger.js"
import { db } from "../config/database.js";
import { users } from "../models/user.model.js";
import { email } from "zod";

export const getAllUsers = async () => {
    try {
        return await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.createdAt,
            updated_at: users.updatedAt
        }).from(users);


    } catch (e) {
        logger.error('Error in getting Users: ', e);
        throw e;

    }
}
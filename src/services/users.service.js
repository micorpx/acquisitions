import logger from "../config/logger.js"
import { db } from "../config/database.js";
import { users } from "../models/user.model.js";
import { eq } from "drizzle-orm";

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

export const getUserById = async (id) => {
    try {
        const [user] = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.createdAt,
            updated_at: users.updatedAt
        }).from(users).where(eq(users.id, id)).limit(1);

        return user;
    } catch (e) {
        logger.error('Error in getting User by ID: ', e);
        throw e;
    }
}

export const updateUser = async (id, updates) => {
    try {
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!existingUser) {
            throw new Error('User not found');
        }

        const [updatedUser] = await db
            .update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                created_at: users.createdAt,
                updated_at: users.updatedAt
            });

        logger.info(`User ${id} updated successfully`);
        return updatedUser;
    } catch (e) {
        logger.error('Error in updating User: ', e);
        throw e;
    }
}

export const deleteUser = async (id) => {
    try {
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id });

        if (!deletedUser) {
            throw new Error('User not found');
        }

        logger.info(`User ${id} deleted successfully`);
        return deletedUser;
    } catch (e) {
        logger.error('Error in deleting User: ', e);
        throw e;
    }
}

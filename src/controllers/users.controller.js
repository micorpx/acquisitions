import logger from "../config/logger.js";
import { users } from "../models/user.model.js";
import { getAllUsers } from "../services/users.services.js";
import { count } from "drizzle-orm";

export const fetchAllUsers = async (req, res, next) => {
    try {
        logger.info('Getting all users....');
        const allUsers = await getAllUsers();
        res.json({
            message: 'Successfully retrieved all users',
            users: allUsers,
            count: allUsers.length,
        })
    } catch (e) {
        logger.error(e);
        next(e);
    }
}
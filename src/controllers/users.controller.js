import logger from '../config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '../validations/users.validation.js';
import { formatValidationErrors } from '../utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users....');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Successfully retrieved all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Authorization check: users can only fetch their own data unless admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own user data',
      });
    }

    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(idValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;

    // Check if user is trying to update their own info or is admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change role
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user ${id}`);
    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error(e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Only admins or the user themselves can delete
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(`Deleting user ${id}`);
    await deleteUser(id);

    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    logger.error(e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

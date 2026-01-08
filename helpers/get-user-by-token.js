import JWT from 'jsonwebtoken';
import User from '../models/Users.js';
import dotenv from 'dotenv';

dotenv.config();

const getUserByToken = async (token) => {
  if (!token) {
    throw new Error('Access denied. No token provided.');
  }
    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const user = await User.findByPk(userId);   
        return user;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export default getUserByToken;
import User from '../models/Users.js';
import createUserToken from '../helpers/create-user-token.js';
import checkUser from '../helpers/check-user.js';
import bcrypt from 'bcrypt';

export class UserController {
  static async register(req, res) {
    const { name, email, password } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (name.length < 3) {
      return res
        .status(400)
        .json({ message: 'Name must be at least 3 characters long' });
    }

    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    try {
      const user = await User.create({ name, email, password, profileImage });
      await createUserToken(user, req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailExists = await User.findOne({ where: { email } });
    
    if (!emailExists)
      return res.status(404).json({ message: 'Email not found' });

    const passwordMatch = await bcrypt.compare(password, emailExists.password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Invalid password' });


    const userCredentials = {
      email: email,
      password: emailExists.password
    }

  
    try {
      const user = await User.findOne({ where: userCredentials });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      await createUserToken(user, req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req, res) {
    const { name } = req.body;
    const userId = req.userId;
    console.log(userId);

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (name.length < 3) {
      return res
        .status(400)
        .json({ message: 'Name must be at least 3 characters long' });
    }

    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user data
      user.name = name;
      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }

      await user.save();

      // Return updated user data without password
      const updatedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      };

      res.status(200).json({ 
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

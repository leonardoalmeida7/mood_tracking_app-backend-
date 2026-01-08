import JWT from 'jsonwebtoken';

const createUserToken = async (user, req, res) => {
    const token = JWT.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
        message: 'User authenticated successfully!',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
        },
    });
};

export default createUserToken;
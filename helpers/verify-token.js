import JWT from 'jsonwebtoken';

export const getToken = (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return token;
}

const verifyToken = (req, res, next) => {
    const token = getToken(req);
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const verified = JWT.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        req.userId = verified.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export default verifyToken;

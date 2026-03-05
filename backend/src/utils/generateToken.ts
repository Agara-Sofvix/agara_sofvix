import jwt from 'jsonwebtoken';

const generateToken = (id: string, tokenVersion: number) => {
    return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export default generateToken;

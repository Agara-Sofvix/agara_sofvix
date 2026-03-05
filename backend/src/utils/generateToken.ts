import jwt from 'jsonwebtoken';

const generateToken = (id: string, tokenVersion: number) => {
    return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET as string, {
        expiresIn: '36500d', // 100 years (effectively lifetime login)
    });
};

export default generateToken;

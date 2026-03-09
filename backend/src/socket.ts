import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    // Bug #6: Socket.io authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            (socket as any).userId = decoded.id;
            (socket as any).userName = decoded.name;
            next();
        } catch (err) {
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('Authenticated user connected:', socket.id, 'userId:', (socket as any).userId);

        socket.on('join_tournament', (tournamentId) => {
            socket.join(tournamentId);
            console.log(`User ${(socket as any).userId} joined tournament room: ${tournamentId}`);
        });

        socket.on('join_admin', () => {
            socket.join('admin');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

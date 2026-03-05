import SystemEvent from '../models/SystemEvent';
import { getIo } from '../socket';

export const createEvent = async (
    type: string,
    title: string,
    description: string,
    metadata?: any,
    session?: any
) => {
    try {
        const event = await SystemEvent.create([
            {
                type,
                title,
                description,
                metadata,
            }
        ], { session });

        const createdEvent = event[0];

        // Emit real-time update to admin panel
        try {
            const io = getIo();
            io.to('admin').emit('system_event', createdEvent);
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }

        return createdEvent;
    } catch (error) {
        console.error('Failed to create system event:', error);
        throw error;
    }
};

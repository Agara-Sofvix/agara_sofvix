import cron from 'node-cron';
import Tournament from '../models/Tournament';
import TypingResult from '../models/TypingResult';
import { createEvent } from './eventService';

export const initCronJobs = () => {
    console.log('Initializing cron jobs...');

    // Daily Leaderboard Update (Midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily leaderboard update...');
        try {
            // Logic to calculate daily high scores
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const results = await TypingResult.find({
                createdAt: { $gte: today }
            }).sort({ wpm: -1 }).limit(5).populate('user', 'name');

            if (results.length > 0) {
                const topUser = (results[0].user as any).name;
                await createEvent(
                    'DAILY_LEADERBOARD',
                    'Daily Leaderboard Update',
                    `Daily leaderboard finalized. Top user: ${topUser}`,
                    { topResults: results.map(r => ({ user: (r.user as any).name, wpm: r.wpm })) }
                );
            } else {
                await createEvent(
                    'DAILY_LEADERBOARD',
                    'Daily Leaderboard Update',
                    'No typing results recorded today.',
                    null
                );
            }


        } catch (error) {
            console.error('Error in daily leaderboard cron:', error);
        }
    });

    // Tournament End Check (Every Hour)
    cron.schedule('0 * * * *', async () => {
        console.log('Checking for ended tournaments...');
        try {
            const now = new Date();
            const endedTournaments = await Tournament.find({
                endTime: { $lte: now },
                status: 'live' // Assuming 'live' is the status for active tournaments
            });

            for (const tournament of endedTournaments) {
                tournament.status = 'completed'; // Update status if that's how it's handled
                await tournament.save();

                await createEvent(
                    'TOURNAMENT_END',
                    'Tournament Ended',
                    `Tournament "${tournament.name}" has ended.`,
                    { tournamentId: tournament._id, name: tournament.name }
                );
            }
        } catch (error) {
            console.error('Error in tournament end check cron:', error);
        }
    });
};

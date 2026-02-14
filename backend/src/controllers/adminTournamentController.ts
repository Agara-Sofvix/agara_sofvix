import PDFDocument from 'pdfkit';
import { Request, Response } from 'express';
import Tournament from '../models/Tournament';
import TournamentResult from '../models/TournamentResult';
import AuditLog from '../models/AuditLog';

// @desc    Update tournament status
// @route   PUT /api/admin/tournaments/:id/status
// @access  Private (Admin)
export const updateTournamentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;

        if (!['upcoming', 'live', 'completed'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            res.status(404).json({ message: 'Tournament not found' });
            return;
        }

        tournament.status = status;
        await tournament.save();

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'UPDATE_TOURNAMENT_STATUS',
            targetType: 'Tournament',
            targetId: req.params.id,
            metadata: { newStatus: status },
            ipAddress: req.ip,
        });

        res.json(tournament);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete tournament
// @route   DELETE /api/admin/tournaments/:id
// @access  Private (Admin)
export const deleteTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            res.status(404).json({ message: 'Tournament not found' });
            return;
        }

        await Tournament.findByIdAndDelete(req.params.id);

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'DELETE_TOURNAMENT',
            targetType: 'Tournament',
            targetId: req.params.id,
            metadata: { name: tournament.name },
            ipAddress: req.ip,
        });

        res.json({ message: 'Tournament deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tournament participants
// @route   GET /api/admin/tournaments/:id/participants
// @access  Private (Admin)
export const getTournamentParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('participants', 'name username email');

        if (!tournament) {
            res.status(404).json({ message: 'Tournament not found' });
            return;
        }

        res.json(tournament.participants);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove invalid score from leaderboard
// @route   DELETE /api/admin/leaderboards/:resultId
// @access  Private (Admin)
export const removeLeaderboardScore = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await TournamentResult.findById(req.params.resultId);

        if (!result) {
            res.status(404).json({ message: 'Result not found' });
            return;
        }

        await TournamentResult.findByIdAndDelete(req.params.resultId);

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'REMOVE_LEADERBOARD_SCORE',
            targetType: 'TournamentResult',
            targetId: req.params.resultId,
            metadata: { wpm: result.wpm, user: result.user },
            ipAddress: req.ip,
        });

        res.json({ message: 'Score removed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset leaderboard for tournament
// @route   POST /api/admin/leaderboards/:tournamentId/reset
// @access  Private (Admin)
export const resetLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tournamentId } = req.params;
        const isGlobal = tournamentId === 'global' || tournamentId === 'all';

        console.log(`[Admin] Resetting leaderboard. Mode: ${isGlobal ? 'ALL DATA' : `Tournament ${tournamentId}`}`);

        if (!isGlobal && (!tournamentId || tournamentId.length < 12)) {
            console.warn(`[Admin] Invalid tournamentId for reset: ${tournamentId}`);
            res.status(400).json({ message: 'Invalid tournament ID' });
            return;
        }

        let deleteResult;
        if (isGlobal) {
            deleteResult = await TournamentResult.deleteMany({});
            console.log(`[Admin] GLOBAL RESET: Deleted ${deleteResult.deletedCount} results total`);
        } else {
            const tournament = await Tournament.findById(tournamentId);
            if (!tournament) {
                console.log(`[Admin] Tournament not found: ${tournamentId}`);
                res.status(404).json({ message: 'Tournament not found' });
                return;
            }
            deleteResult = await TournamentResult.deleteMany({ tournament: tournamentId });
            console.log(`[Admin] Successfully deleted ${deleteResult.deletedCount} results for tournament ${tournamentId}`);
        }

        // Log the action (Don't block success if logging fails)
        try {
            await AuditLog.create({
                admin: (req as any).admin._id,
                action: isGlobal ? 'RESET_ALL_LEADERBOARDS' : 'RESET_LEADERBOARD',
                targetType: isGlobal ? 'System' : 'Tournament',
                targetId: isGlobal ? 'system' : tournamentId,
                ipAddress: req.ip,
                metadata: { deletedCount: deleteResult.deletedCount }
            });
        } catch (logError) {
            console.error('[Admin] Failed to create audit log for reset:', logError);
        }

        res.json({
            message: isGlobal ? 'All dashboard leaderboard data reset successfully' : 'Leaderboard reset successfully',
            deletedCount: deleteResult.deletedCount
        });
    } catch (error: any) {
        console.error('[Admin] CRITICAL ERROR resetting leaderboard:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export leaderboard as PDF
// @route   GET /api/admin/leaderboards/:tournamentId/export
// @access  Private (Admin)
export const exportLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tournamentId } = req.params;
        const isGlobal = tournamentId === 'global' || tournamentId === 'all';

        console.log(`[Admin] Starting PDF export. Mode: ${isGlobal ? 'GLOBAL' : `Tournament ${tournamentId}`}`);

        if (!isGlobal && (!tournamentId || tournamentId.length < 12)) {
            res.status(400).json({ message: 'Valid tournament ID is required for export' });
            return;
        }

        let results;
        let tournament = null;

        if (isGlobal) {
            results = await TournamentResult.find({})
                .populate('user', 'name username email')
                .populate('tournament', 'name')
                .sort({ wpm: -1, accuracy: -1 });
        } else {
            tournament = await Tournament.findById(tournamentId);
            results = await TournamentResult.find({ tournament: tournamentId })
                .populate('user', 'name username email')
                .sort({ wpm: -1, accuracy: -1 });
        }

        console.log(`[Admin] Found ${results.length} results to PDF export`);

        // Filter duplicates
        const uniqueLeaderboard: any[] = [];
        const seenUsers = new Set();
        for (const res of results) {
            const userId = res.user ? (res.user as any)._id.toString() : null;
            if (userId && !seenUsers.has(userId)) {
                uniqueLeaderboard.push(res);
                seenUsers.add(userId);
            }
        }

        console.log(`[Admin] Generating PDF for ${uniqueLeaderboard.length} participants`);

        const doc = new PDFDocument({ margin: 50 });
        let filename = `leaderboard_${tournament?.name.replace(/\s+/g, '_') || tournamentId}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text(tournament ? 'Tournament Leaderboard' : 'Global Leaderboard', { align: 'center' });
        doc.fontSize(14).text(tournament?.name || 'All Competitive Results', { align: 'center' });
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();

        // Table Header
        const startX = 50;
        let startY = doc.y;
        const colWidths = [40, 150, 100, 80, 80];
        const headers = ['Rank', 'Name', 'Username', 'WPM', 'Accuracy'];

        doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, i) => {
            const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.text(header, x, startY);
        });

        doc.moveTo(startX, startY + 15).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + 15).stroke();
        startY += 25;

        // Table Rows
        doc.font('Helvetica');
        uniqueLeaderboard.forEach((result, index) => {
            if (startY > 700) {
                doc.addPage();
                startY = 50;

                // Redraw table headers on new page
                doc.fontSize(10).font('Helvetica-Bold');
                headers.forEach((header, i) => {
                    const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc.text(header, x, startY);
                });
                doc.moveTo(startX, startY + 15).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + 15).stroke();
                startY += 25;
                doc.font('Helvetica');
            }

            const user = result.user as any;
            const row = [
                (index + 1).toString(),
                user?.name || 'Deleted User',
                user?.username || 'N/A',
                Math.round(result.wpm || 0).toString(),
                `${Math.round(result.accuracy || 0)}%`
            ];

            row.forEach((text, i) => {
                const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                doc.text(text, x, startY);
            });

            startY += 20;
        });

        doc.end();
        console.log(`[Admin] PDF Export completed successfully for ${tournamentId}`);

        // Log the action (Don't block success if logging fails)
        try {
            await AuditLog.create({
                admin: (req as any).admin._id,
                action: 'EXPORT_LEADERBOARD',
                targetType: 'Tournament',
                targetId: tournamentId,
                ipAddress: req.ip,
                metadata: { format: 'pdf', count: uniqueLeaderboard.length }
            });
        } catch (logError) {
            console.error('[Admin] Failed to create audit log for export:', logError);
        }

    } catch (error: any) {
        console.error('[Admin] CRITICAL ERROR exporting leaderboard:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Get audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('admin', 'name email')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments();

        res.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Create a new tournament (Admin)
// @route   POST /api/admin/tournaments
// @access  Private (Admin)
export const createTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, subheading, startTime, endTime, textContent } = req.body;

        const tournament = await Tournament.create({
            name,
            subheading,
            startTime,
            endTime,
            textContent,
            createdBy: (req as any).admin._id,
            creatorModel: 'Admin',
            status: 'live'
        });

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'CREATE_TOURNAMENT',
            targetType: 'Tournament',
            targetId: tournament._id,
            metadata: { name },
            ipAddress: req.ip,
        });

        res.status(201).json(tournament);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update tournament
// @route   PUT /api/admin/tournaments/:id
// @access  Private (Admin)
export const updateTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, subheading, startTime, endTime, textContent, status } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            res.status(404).json({ message: 'Tournament not found' });
            return;
        }

        if (name) tournament.name = name;
        if (subheading !== undefined) tournament.subheading = subheading;
        if (startTime) tournament.startTime = startTime;
        if (endTime) tournament.endTime = endTime;
        if (textContent) tournament.textContent = textContent;
        if (status) tournament.status = status;

        await tournament.save();

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'UPDATE_TOURNAMENT',
            targetType: 'Tournament',
            targetId: req.params.id,
            metadata: { name: tournament.name },
            ipAddress: req.ip,
        });

        res.json(tournament);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get leaderboard (Global or Specific Tournament)
// @route   GET /api/admin/leaderboards
// @access  Private (Admin)
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tournamentId, limit = 50 } = req.query;
        const query: any = {};

        if (tournamentId && tournamentId !== 'global') {
            query.tournament = tournamentId;
        }

        const results = await TournamentResult.find(query)
            .populate('user', 'name username email')
            .populate('tournament', 'name')
            .sort({ wpm: -1, accuracy: -1 });

        // Filter duplicates to ensure only one result per user is shown
        const uniqueLeaderboard: any[] = [];
        const seenUsers = new Set();

        for (const res of results) {
            const userId = res.user ? (res.user as any)._id.toString() : null;
            if (userId && !seenUsers.has(userId)) {
                uniqueLeaderboard.push(res);
                seenUsers.add(userId);
            }
            if (uniqueLeaderboard.length >= Number(limit)) break;
        }

        res.json(uniqueLeaderboard);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Define a simple Text model since we don't have one imported
const TamilTextSchema = new mongoose.Schema({
    category: { type: String, required: true, index: true },
    content: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    createdAt: { type: Date, default: Date.now }
});

const TamilText = mongoose.models.TamilText || mongoose.model('TamilText', TamilTextSchema);

dotenv.config();

const tamilTexts = [
    {
        category: 'literature',
        content: 'யாதும் ஊரே யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா; நோதலும் தணிதலும் அவற்றோ ரன்ன; சாதலும் புதுவது அன்றே; வாழ்தல் இனிதென மகிழ்ந்தன்றும் இலமே; முனிவின் இன்னாதென்றலும் இலமே.',
        difficulty: 'hard'
    },
    {
        category: 'literature',
        content: 'அகரம் முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு. கற்றதனால் ஆய பயனென்கொல் வாலறிவன் நற்றாள் தொழாஅர் எனின். மலர்மிசை ஏகினான் மாணடி சேர்ந்தார் நிலமிசை நீடுவாழ் வார்.',
        difficulty: 'medium'
    },
    {
        category: 'cinema',
        content: 'வாழ்க்கை ஒரு வட்டம்; இங்கே தோற்கிறவன் ஜெய்ப்பான், ஜெயிக்கிறவன் தோற்பான். ஆனால் முயற்சி செய்கிறவன் என்றுமே தோற்பதில்லை. விடாமுயற்சி விஸ்வரூப வெற்றி தரும்.',
        difficulty: 'easy'
    },
    {
        category: 'news',
        content: 'தமிழகத்தில் பல்வேறு மாவட்டங்களில் இன்று கனமழை பெய்ய வாய்ப்புள்ளதாக வானிலை ஆய்வு மையம் தெரிவித்துள்ளது. பொதுமக்கள் பாதுகாப்பாக இருக்குமாறு அறிவுறுத்தப்பட்டுள்ளனர். நீர்நிலைகளுக்கு அருகில் செல்ல வேண்டாம் என்று எச்சரிக்கை விடுக்கப்பட்டுள்ளது.',
        difficulty: 'medium'
    },
    {
        category: 'general',
        content: 'உடல்நலமே மிகப்பெரிய செல்வம். தினமும் உடற்பயிற்சி செய்வதும், சத்தான உணவுகளை உண்பதும் நம்மை நோய்களில் இருந்து பாதுகாக்கும். போதுமான அளவு தண்ணீர் குடிப்பது உடலுக்கு மிகவும் நல்லது.',
        difficulty: 'easy'
    },
    {
        category: 'literature',
        content: 'பிறப்பொக்கும் எல்லா உயிர்க்கும் சிறப்பொவ்வா செய்தொழில் வேற்றுமை யான். ஒழுக்கம் விழுப்பம் தரலான் ஒழுக்கம் உயிரினும் ஓம்பப் படும். வாய்மை எனப்படுவது யாதெனின் யாதொன்றும் தீமையிலாத சொலல்.',
        difficulty: 'hard'
    }
];

const seedTexts = async () => {
    try {
        await connectDB();

        // Clear existing texts to avoid duplicates
        await TamilText.deleteMany({ category: { $in: ['literature', 'cinema', 'news', 'general'] } });

        await TamilText.insertMany(tamilTexts);

        console.log('Tamil texts seeded successfully into TamilText collection!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding texts:', error);
        process.exit(1);
    }
};

seedTexts();

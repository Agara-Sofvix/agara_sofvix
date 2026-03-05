import { create } from 'zustand';
import { getTamilTexts } from '../services/api';

interface TamilText {
    _id: string;
    category: string;
    content: string;
}

interface TextState {
    texts: TamilText[];
    isLoading: boolean;
    error: string | null;
    fetchTexts: (category?: string) => Promise<void>;
    getRandomText: (category: string, excludeText?: string) => string;
    getRandomTextObject: (category: string, excludeText?: string) => TamilText | null;
}

export const useTextStore = create<TextState>((set, get) => ({
    texts: [],
    isLoading: false,
    error: null,

    fetchTexts: async (category?: string) => {
        set({ isLoading: true, error: null });
        try {
            console.log('[useTextStore] Fetching texts, category:', category);
            const data = await getTamilTexts(category);
            console.log('[useTextStore] Received data:', data);
            console.log('[useTextStore] Data length:', data?.length);
            set({ texts: data, isLoading: false });
        } catch (err: any) {
            console.error('[useTextStore] Error fetching texts:', err);
            set({ error: err.message, isLoading: false });
        }
    },

    getRandomText: (category: string, excludeText?: string) => {
        const selected = get().getRandomTextObject(category, excludeText);
        return selected?.content || '';
    },

    getRandomTextObject: (category: string, excludeText?: string) => {
        const { texts } = get();
        const categoryTexts = texts.filter(t => t.category === category);

        if (categoryTexts.length === 0) return null;
        if (categoryTexts.length === 1) return categoryTexts[0];

        let selected;
        do {
            const randomIndex = Math.floor(Math.random() * categoryTexts.length);
            selected = categoryTexts[randomIndex];
        } while (selected.content === excludeText && categoryTexts.length > 1);

        return selected;
    }
}));

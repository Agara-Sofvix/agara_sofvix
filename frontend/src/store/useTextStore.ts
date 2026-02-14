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
        const { texts } = get();
        console.log('[useTextStore] getRandomText called, category:', category);
        console.log('[useTextStore] Total texts in store:', texts.length);
        const categoryTexts = texts.filter(t => t.category === category);
        console.log('[useTextStore] Texts for category "' + category + '":', categoryTexts.length);

        if (categoryTexts.length === 0) {
            console.warn('[useTextStore] No texts found for category:', category);
            return '';
        }
        if (categoryTexts.length === 1) return categoryTexts[0].content;

        let selected;
        do {
            const randomIndex = Math.floor(Math.random() * categoryTexts.length);
            selected = categoryTexts[randomIndex].content;
        } while (selected === excludeText && categoryTexts.length > 1);

        console.log('[useTextStore] Selected text (first 50 chars):', selected.substring(0, 50));
        return selected;
    }
}));

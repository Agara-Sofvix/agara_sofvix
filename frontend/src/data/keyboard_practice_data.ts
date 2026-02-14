
export interface PracticeLesson {
    id: string;
    title: string;
    instruction: string;
    content: string; // The Tamil text to type
    tips?: string[];
}

export interface PracticeSection {
    id: string;
    title: string;
    description: string;
    lessons: PracticeLesson[];
}

export const keyboardPracticeData: PracticeSection[] = [
    {
        id: "home_row_mechanical",
        title: "1. Home Row Drills (Mechanical)",
        description: "Focus strictly on key positions A-S-D-F and H-J-K-L.",
        lessons: [
            {
                id: "home_left_iso",
                title: "Left Home (A S D F)",
                instruction: "Keys: அ(A), ஸ்(S), ட்(D), ஃ(F).",
                content: "அ ட் ஸ் ஃ ஸ் அ ஃ ட் ஃ அ ஸ் ட் ட் ஃ அ ஸ் ",
                tips: ["Don't look at the keys.", "Return to 'F' bump."]
            },
            {
                id: "home_right_iso",
                title: "Right Home (H J K L)",
                instruction: "Keys: ஹ்(H), ஞ்(J), க்(K), ல்(L).",
                content: "ஹ் க் ஞ் ல் ஞ் ஹ் ல் க் ல் ஞ் க் ஹ் க் ல் ஞ் ஹ் ",
                tips: ["Keep your right index on the 'J' bump."]
            },
            {
                id: "home_index_stretch",
                title: "Index Stretch (G & H)",
                instruction: "Keys: ங்(G) and ஹ்(H).",
                content: "ங் ஹ் ங் ஹ் ங் ஹ் ங் ஹ் ங் ஹ் ங் ஹ் ங் ஹ் ங் ஹ் ",
                tips: ["Stretch your index finger and snap back immediately."]
            }
        ]
    },
    {
        id: "top_row_mechanical",
        title: "2. Top Row Drills (Mechanical)",
        description: "Practice the Top Row reach: Q-W-E-R-T and Y-U-I-O-P.",
        lessons: [
            {
                id: "top_left_iso",
                title: "Top Left (Q W E R T)",
                instruction: "Keys: ஔ(Q), ஐ(W), எ(E), ர்(R), த்(T).",
                content: "ஔ எ ஐ த் ர் ஐ ஔ த் ர் எ த் ஔ ஐ ர் எ ஔ ",
                tips: ["Reach up without lifting your palm."]
            },
            {
                id: "top_right_iso",
                title: "Top Right (Y U I O P)",
                instruction: "Keys: ய்(Y), உ(U), இ(I), ஒ(O), ப்(P).",
                content: "ய் இ உ ப் ஒ உ ய் ஒ ப் இ ப் உ ய் இ ஒ ய் ",
                tips: ["Pinky reaches for 'ப்'(P)."]
            }
        ]
    },
    {
        id: "bottom_row_mechanical",
        title: "3. Bottom Row Drills (Mechanical)",
        description: "Practice the Bottom Row drop: Z-X-C-V-B and N-M.",
        lessons: [
            {
                id: "bottom_left_iso",
                title: "Bottom Left (Z X C V B)",
                instruction: "Keys: ழ்(Z), ஶ்(X), ச்(C), வ்(V), ந்(B).",
                content: "ழ் ச் ஶ் ந் வ் ச் ந் ழ் வ் ஶ் ந் ழ் ச் ஶ் வ் ச் ",
                tips: ["Tuck your fingers under slightly."]
            },
            {
                id: "bottom_right_iso",
                title: "Bottom Right (N M)",
                instruction: "Keys: ன்(N), ம்(M).",
                content: "ன் ம் ன் ம் ன் ம் ன் ம் ன் ம் ன் ம் ன் ம் ன் ம் ",
                tips: ["Right index drops down for both keys."]
            }
        ]
    },
    {
        id: "finger_coordination",
        title: "4. Cross-Hand Coordination",
        description: "Mix keys from both hands and different rows.",
        lessons: [
            {
                id: "home_top_mix",
                title: "Home & Top Mix",
                instruction: "Practice shifting between Home and Top rows.",
                content: "அ எ இ க் ஸ் ர் உ ஞ் த் ஃ ஒ ல் ய் ஹ் அ க் எ இ ",
                tips: ["Maintain a steady rhythm."]
            },
            {
                id: "home_bottom_mix",
                title: "Home & Bottom Mix",
                instruction: "Practice shifting between Home and Bottom rows.",
                content: "அ ழ் ட் ச் ஸ் ஶ் ஃ வ் ங் ந் ன் க் ல் ம் ஸ் ச் அ ன் ",
                tips: ["Keep your wrists steady."]
            }
        ]
    }
];

export const practiceSchedule = [
    { day: "Day 1-2", focus: "Posture & Home Row", time: "15 mins" },
    { day: "Day 3-4", focus: "Uyir Eluthukkal (Vowels)", time: "20 mins" },
    { day: "Day 5-6", focus: "Mei Eluthukkal (Consonants)", time: "20 mins" },
    { day: "Day 7-9", focus: "Uyirmei Series (Compounds)", time: "30 mins" },
    { day: "Day 10+", focus: "Words & Speed Drills", time: "30 mins+" }
];

export const motivationTips = [
    "Accuracy is the foundation of speed.",
    "Practice does not make perfect. Perfect practice makes perfect.",
    "Relax your hands. Tension slows you down.",
    "Look at the screen, not the keyboard.",
    "Consistency is better than intensity."
];

export const COMPOUND_SERIES: Record<string, string[]> = {
    'அ': ['க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', 'ஜ', 'ஷ', 'ஸ', 'ஹ', 'க்ஷ', 'ஶ'],
    'ஆ': ['கா', 'ஙா', 'சா', 'ஞா', 'டா', 'ணா', 'தா', 'நா', 'பா', 'மா', 'யா', 'ரா', 'லா', 'வா', 'ழா', 'ளா', 'றா', 'னா', 'ஜா', 'ஷா', 'ஸா', 'ஹா', 'க்ஷா', 'ஶா'],
    'இ': ['கி', 'ஙி', 'சி', 'ஞி', 'டி', 'ணி', 'தி', 'நி', 'பி', 'மி', 'யி', 'ரி', 'லி', 'வி', 'ழி', 'ளி', 'றி', 'னி', 'ஜி', 'ஷி', 'ஸி', 'ஹி', 'க்ஷி', 'ஶி'],
    'ஈ': ['கீ', 'ஙீ', 'சீ', 'ஞீ', 'டீ', 'ணீ', 'தீ', 'நீ', 'பீ', 'மீ', 'யீ', 'ரீ', 'லீ', 'வீ', 'ழீ', 'ளீ', 'றீ', 'னீ', 'ஜீ', 'ஷீ', 'ஸீ', 'ஹீ', 'க்ஷீ', 'ஶீ'],
    'உ': ['கு', 'ஙு', 'சு', 'ஞு', 'டு', 'ணு', 'து', 'நு', 'பு', 'மு', 'யு', 'ரு', 'லு', 'வு', 'ழு', 'ளு', 'று', 'னு', 'ஜு', 'ஷு', 'ஸு', 'ஹு', 'க்ஷு', 'ஶு'],
    'ஊ': ['கூ', 'ஙூ', 'சூ', 'ஞூ', 'டூ', 'ணூ', 'தூ', 'நூ', 'பூ', 'மூ', 'யூ', 'ரூ', 'லூ', 'வூ', 'ழூ', 'ளூ', 'றூ', 'னூ', 'ஜூ', 'ஷூ', 'ஸூ', 'ஹூ', 'க்ஷூ', 'ஶூ'],
    'எ': ['கெ', 'ஙெ', 'செ', 'ஞெ', 'டெ', 'ணெ', 'தெ', 'நெ', 'பெ', 'மெ', 'யெ', 'ரெ', 'லெ', 'வெ', 'ழெ', 'ளெ', 'றெ', 'னெ', 'ஜெ', 'ஷெ', 'ஸெ', 'ஹெ', 'க்ஷெ', 'ஶெ'],
    'ஏ': ['கே', 'ஙே', 'சே', 'ஞே', 'டே', 'ணே', 'தே', 'நே', 'பே', 'மே', 'யே', 'ரே', 'லே', 'வே', 'ழே', 'ளே', 'றே', 'னே', 'ஜே', 'ஷே', 'ஸே', 'ஹே', 'க்ஷே', 'ஶே'],
    'ஐ': ['கை', 'ஙை', 'சை', 'ஞை', 'டை', 'ணை', 'தை', 'நை', 'பை', 'மை', 'யை', 'ரை', 'லை', 'வை', 'ழை', 'ளை', 'றை', 'னை', 'ஜை', 'ஷை', 'ஸை', 'ஹை', 'க்ஷை', 'ஶை'],
    'ஒ': ['கொ', 'ஙொ', 'சொ', 'ஞொ', 'டொ', 'ணொ', 'தொ', 'நொ', 'பொ', 'மொ', 'யொ', 'ரொ', 'லொ', 'வொ', 'ழொ', 'ளொ', 'றொ', 'னொ', 'ஜொ', 'ஷொ', 'ஸொ', 'ஹொ', 'க்ஷொ', 'ஶொ'],
    'ஓ': ['கோ', 'ஙோ', 'சோ', 'ஞோ', 'டோ', 'ணோ', 'தோ', 'நோ', 'போ', 'மோ', 'யோ', 'ரோ', 'லோ', 'வோ', 'ழோ', 'ளோ', 'றோ', 'னோ', 'ஜோ', 'ஷோ', 'ஸோ', 'ஹோ', 'க்ஷோ', 'ஶோ'],
    'ஔ': ['கௌ', 'ஙௌ', 'சௌ', 'ஞௌ', 'டௌ', 'ணௌ', 'தௌ', 'நௌ', 'பௌ', 'மௌ', 'யௌ', 'ரௌ', 'லௌ', 'வௌ', 'ழௌ', 'ளௌ', 'றௌ', 'னௌ', 'ஜௌ', 'ஷௌ', 'ஸௌ', 'ஹௌ', 'க்ஷௌ', 'ஶௌ'],
};


import { getTamilGraphemes, handleTamilBackspace } from './tamilEngine';

const testCases = ["வொ", "வௌ", "கோ", "மூ"];
testCases.forEach(tc => {
    console.log(`Graphemes of "${tc}":`, JSON.stringify(getTamilGraphemes(tc)));
    const bs = handleTamilBackspace(tc, tc.length, tc.length);
    console.log(`Backspace on "${tc}" at end:`, JSON.stringify(bs));
});

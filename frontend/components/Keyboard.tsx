
import React from 'react';
import { AppSettings } from '../src/types';
import { TAMIL_PHONETIC_MAP } from '../tamilEngine';
import MobileKeyboard from './MobileKeyboard';

interface KeyboardProps {
    activeKeys: Set<string>;
    settings?: AppSettings;
}

const Keyboard: React.FC<KeyboardProps> = ({ activeKeys, settings }) => {
    const isKeyActive = (key: string) => {
        if (!key) return false;
        const k = key.toLowerCase();
        if (k === 'meta' || k === 'command') return activeKeys.has('meta') || activeKeys.has('os') || activeKeys.has('command');
        if (k === 'alt' || k === 'option') return activeKeys.has('alt');
        if (k === 'control') return activeKeys.has('control');
        if (k === 'shift') return activeKeys.has('shift');
        return activeKeys.has(k);
    };

    const isGuidanceKey = (key: string) => {
        if (!settings?.handGuidance || !key) return false;
        return activeKeys.has(`${key.toLowerCase()}_guide`);
    };

    const onKeyClick = (keyId: string, label?: string) => {
        if (!keyId) return;
        const lowerKey = keyId.toLowerCase();
        const isShiftActive = activeKeys.has('shift');

        if (lowerKey === 'backspace') {
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'backspace', activeBase: false } }));
        } else if (lowerKey === 'enter' || lowerKey === 'return') {
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'char', value: '\n' } }));
        } else if (lowerKey === ' ') {
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'char', value: ' ' } }));
        } else if (lowerKey === 'shift') {
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'shift-toggle' } }));
        } else if (/^[a-z]$/.test(lowerKey)) {
            // Dispatch uppercase if shift is active
            const value = isShiftActive ? lowerKey.toUpperCase() : lowerKey;
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'phonetic', value } }));
        } else if (TAMIL_PHONETIC_MAP[lowerKey]) {
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'char', value: TAMIL_PHONETIC_MAP[lowerKey].main } }));
        } else if (label && label.length === 1) {
            window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'char', value: label } }));
        }
    };

    const Key = ({ en, ta, shiftTa, className = "", id = "", isSystem = false }: { en?: string, ta?: string, shiftTa?: string, className?: string, id?: string, isSystem?: boolean, key?: string }) => {
        const keyId = id || en || "";
        const active = isKeyActive(keyId);
        const guided = isGuidanceKey(keyId);
        const isShift = activeKeys.has('shift');
        const baseClasses = `keyboard-key ${active ? 'active' : ''} ${guided ? 'ring-4 ring-yellow-400 animate-pulse' : ''} ${className} cursor-pointer hover:bg-cream-light/80 active:scale-95 transition-all`;

        const handleClick = () => {
            if (isSystem) {
                onKeyClick(keyId, en);
            } else if (isShift && en && en.length === 1) {
                // Number/Symbol keys: top label (en) is the shifted char
                onKeyClick(en, en);
            } else {
                onKeyClick(keyId, ta || en);
            }
        };

        if (isSystem) {
            return (
                <button type="button" onClick={handleClick} className={baseClasses}>
                    <span className="system-label text-[8px] font-black text-header-brown/60 absolute top-1.5 left-1.5 uppercase">{en}</span>
                    <span className="material-symbols-outlined text-[16px] text-header-brown/60 absolute bottom-1.5 right-1.5">{ta}</span>
                </button>
            );
        }

        // Number keys or symbol keys (2 labels)
        if (ta && en && !shiftTa && !TAMIL_PHONETIC_MAP[en?.toLowerCase()]) {
            return (
                <button type="button" onClick={handleClick} className={baseClasses}>
                    {/* Match the Tamil-letter key layout:
              top-right = shifted symbol, bottom-left = base symbol */}
                    <span className="key-label-ta-shift">{en}</span>
                    <span className="key-label-ta-main">{ta}</span>
                </button>
            );
        }

        return (
            <button type="button" onClick={handleClick} className={baseClasses}>
                {shiftTa && <span className="key-label-ta-shift">{shiftTa}</span>}
                {ta && <span className="key-label-ta-main">{ta}</span>}
                {en && <span className="key-label-en-main">{en}</span>}
            </button>
        );
    };

    const LetterKey = (key: string) => {
        const map = TAMIL_PHONETIC_MAP[key];
        const shiftMap = TAMIL_PHONETIC_MAP[key.toUpperCase()];

        let zoneClass = '';
        if (map) {
            zoneClass = map.type === 'uyir' ? 'vowel-zone' : (map.type === 'mei' ? 'consonant-zone' : '');
        }

        // Only show shifted label if it's different from the base label
        const ta = map?.main;
        const shiftTa = (shiftMap?.main !== ta) ? shiftMap?.main : undefined;

        return (
            <Key
                key={key}
                en={key.toUpperCase()}
                ta={ta}
                shiftTa={shiftTa}
                className={zoneClass}
            />
        );
    };

    return (
        <>
            {/* Mobile-only layout */}
            <div className="block sm:hidden w-full">
                <MobileKeyboard />
            </div>

            {/* Desktop / tablet layout (existing) */}
            <div className="keyboard-wrapper hidden sm:flex">
                <div className="keyboard-chassis">
                    <div className="flex flex-col gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
                        {/* Row 1: Number Row */}
                        <div className="flex gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
                            <Key en="~" ta="`" id="`" />
                            <Key en="!" ta="1" id="1" />
                            <Key en="@" ta="2" id="2" />
                            <Key en="#" ta="3" id="3" />
                            <Key en="$" ta="4" id="4" />
                            <Key en="%" ta="5" id="5" />
                            <Key en="^" ta="6" id="6" />
                            <Key en="&" ta="7" id="7" />
                            <Key en="*" ta="8" id="8" />
                            <Key en="(" ta="9" id="9" />
                            <Key en=")" ta="0" id="0" />
                            <Key en="_" ta="-" id="-" />
                            <Key en="+" ta="=" id="=" />
                            <Key en="delete" ta="backspace" id="backspace" isSystem className="!flex-grow-[2.5]" />
                        </div>

                        {/* Row 2 */}
                        <div className="flex gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
                            <Key en="tab" ta="keyboard_tab" id="tab" isSystem className="!flex-grow-[1.6]" />
                            {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(LetterKey)}
                            <Key en="{" ta="[" />
                            <Key en="}" ta="]" />
                            <Key en="|" ta="\" className="!flex-grow-[1.4]" />
                        </div>

                        {/* Row 3 */}
                        <div className="flex gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
                            <Key en="caps" ta="keyboard_capslock" id="capslock" isSystem className="!flex-grow-[1.9]" />
                            {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(LetterKey)}
                            <Key en=":" ta=";" />
                            <Key en='"' ta="'" />
                            <Key en="return" ta="keyboard_return" id="enter" isSystem className="!flex-grow-[2.5]" />
                        </div>

                        {/* Row 4 */}
                        <div className="flex gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
                            <Key en="shift" ta="north" id="shift" isSystem className="!flex-grow-[2.6]" />
                            {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(LetterKey)}
                            <Key en="<" ta="," />
                            <Key en=">" ta="." />
                            <Key en="?" ta="/" />
                            <Key en="shift" ta="north" id="shift" isSystem className="!flex-grow-[3.2]" />
                        </div>

                        {/* Row 5 */}
                        <div className="flex gap-0.5 xs:gap-1 sm:gap-1.5 w-full items-stretch text-header-brown/60">
                            <div className="keyboard-key !flex-grow-[1.2]"><span className="text-[8px] font-black absolute top-1.5 left-1.5 uppercase">fn</span></div>
                            <div className={`keyboard-key !flex-grow-[1.2] ${isKeyActive('control') ? 'active' : ''}`}><span className="text-[8px] font-black absolute top-1.5 left-1.5 uppercase">ctrl</span></div>
                            <div className={`keyboard-key !flex-grow-[1.2] ${isKeyActive('alt') ? 'active' : ''}`}><span className="text-[8px] font-black absolute top-1.5 left-1.5 uppercase">opt</span></div>
                            <div className={`keyboard-key !flex-grow-[1.5] ${isKeyActive('meta') ? 'active' : ''}`}><span className="text-[8px] font-black absolute top-1.5 left-1.5 uppercase">cmd</span></div>
                            <div
                                className={`keyboard-key !flex-grow-[8] ${isKeyActive(' ') ? 'active' : ''} ${isGuidanceKey(' ') ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
                                onClick={() => onKeyClick(' ', ' ')}
                            ></div>
                            <div className={`keyboard-key !flex-grow-[1.5] ${isKeyActive('meta') ? 'active' : ''}`}><span className="text-[8px] font-black absolute top-1.5 left-1.5 uppercase">cmd</span></div>
                            <div className={`keyboard-key !flex-grow-[1.2] ${isKeyActive('alt') ? 'active' : ''}`}><span className="text-[8px] font-black absolute top-1.5 left-1.5 uppercase">opt</span></div>

                            <div className="flex gap-[1px] items-end ml-[1px] text-header-brown/60">
                                <div className={`keyboard-key !min-w-[22px] sm:!min-w-[42px] !h-[26px] sm:!h-[44px] ${isKeyActive('arrowleft') ? 'active' : ''}`}><span className="material-symbols-outlined text-[10px] sm:text-[14px] m-auto">arrow_left</span></div>
                                <div className="flex flex-col gap-[1px] w-[22px] sm:w-[42px]">
                                    <div className={`keyboard-key !min-w-full !h-[11px] sm:!h-[21px] ${isKeyActive('arrowup') ? 'active' : ''}`}><span className="material-symbols-outlined text-[10px] sm:text-[14px] m-auto">arrow_drop_up</span></div>
                                    <div className={`keyboard-key !min-w-full !h-[11px] sm:!h-[21px] ${isKeyActive('arrowdown') ? 'active' : ''}`}><span className="material-symbols-outlined text-[10px] sm:text-[14px] m-auto">arrow_drop_down</span></div>
                                </div>
                                <div className={`keyboard-key !min-w-[22px] sm:!min-w-[42px] !h-[26px] sm:!h-[44px] ${isKeyActive('arrowright') ? 'active' : ''}`}><span className="material-symbols-outlined text-[10px] sm:text-[14px] m-auto">arrow_right</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Keyboard;

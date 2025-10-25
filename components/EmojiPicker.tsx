import React, { useRef, useEffect } from 'react';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
}

const EMOJIS = [
  '😀', '😂', '😍', '😭', '😊', '🥰', '🤔', '😴', '🥳', '🤯',
  '❤️', '👍', '🙏', '🎉', '💯', '✨', '🔥', '🍕', '🍦', '🍵',
  '👋', '💔', '😠', '🙄', '💼', '💪', '👀', '🥺', '😇', '🤣'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={pickerRef} className="absolute bottom-full mb-2 w-72 bg-[var(--ui-panel-bg)] backdrop-blur-md border border-[var(--ui-border)] rounded-xl shadow-lg p-3 z-10">
            <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => onEmojiSelect(emoji)}
                        className="text-2xl rounded-lg p-1 hover:bg-violet-500/20 transition-colors"
                        aria-label={emoji}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiPicker;
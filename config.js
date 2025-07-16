const KEYBOARD_CONFIG = {
    // 濁点・半濁点のマッピング
    dakutenMapping: {
        'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
        'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
        'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
        'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ',
        'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ'
    },
    
    handakutenMapping: {
        'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ',
        'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ'
    },
    
    layout: [
        [
            { key: '`', kana: 'ろ', finger: 'left-pinky' },
            { key: '1', kana: 'ぬ', finger: 'left-pinky' },
            { key: '2', kana: 'ふ', finger: 'left-ring' },
            { key: '3', kana: 'あ', shift_kana: 'ぁ', finger: 'left-middle' },
            { key: '4', kana: 'う', shift_kana: 'ぅ', finger: 'left-index' },
            { key: '5', kana: 'え', shift_kana: 'ぇ', finger: 'left-index' },
            { key: '6', kana: 'お', shift_kana: 'ぉ', finger: 'right-index' },
            { key: '7', kana: 'や', shift_kana: 'ゃ', finger: 'right-index' },
            { key: '8', kana: 'ゆ', shift_kana: 'ゅ', finger: 'right-middle' },
            { key: '9', kana: 'よ', shift_kana: 'ょ', finger: 'right-ring' },
            { key: '0', kana: 'わ', shift_kana: 'を', finger: 'right-pinky' },
            { key: '-', kana: 'ほ', finger: 'right-pinky' },
            { key: '=', kana: 'へ', finger: 'right-pinky' },
            { key: 'Backspace', kana: '', finger: 'right-pinky', class: 'backspace-key' }
        ],
        [
            { key: 'Tab', kana: '', finger: 'left-pinky', class: 'tab-key' },
            { key: 'q', kana: 'た', finger: 'left-pinky' },
            { key: 'w', kana: 'て', finger: 'left-ring' },
            { key: 'e', kana: 'い', finger: 'left-middle' },
            { key: 'r', kana: 'す', finger: 'left-index' },
            { key: 't', kana: 'か', finger: 'left-index' },
            { key: 'y', kana: 'ん', finger: 'right-index' },
            { key: 'u', kana: 'な', finger: 'right-index' },
            { key: 'i', kana: 'に', finger: 'right-middle' },
            { key: 'o', kana: 'ら', finger: 'right-ring' },
            { key: 'p', kana: 'せ', finger: 'right-pinky' },
            { key: '[', kana: '゛', finger: 'right-pinky' },
            { key: ']', kana: '゜', finger: 'right-pinky' },
            { key: '\\', kana: 'む', finger: 'right-pinky' }
        ],
        [
            { key: 'Caps', kana: '', finger: 'left-pinky', class: 'caps-key' },
            { key: 'a', kana: 'ち', finger: 'left-pinky' },
            { key: 's', kana: 'と', finger: 'left-ring' },
            { key: 'd', kana: 'し', finger: 'left-middle' },
            { key: 'f', kana: 'は', finger: 'left-index' },
            { key: 'g', kana: 'き', finger: 'left-index' },
            { key: 'h', kana: 'く', finger: 'right-index' },
            { key: 'j', kana: 'ま', finger: 'right-index' },
            { key: 'k', kana: 'の', finger: 'right-middle' },
            { key: 'l', kana: 'り', finger: 'right-ring' },
            { key: ';', kana: 'れ', finger: 'right-pinky' },
            { key: "'", kana: 'け', finger: 'right-pinky' },
            { key: 'Enter', kana: '', finger: 'right-pinky', class: 'enter-key' }
        ],
        [
            { key: 'ShiftLeft', kana: '', finger: 'left-pinky', class: 'shift-key' },
            { key: 'z', kana: 'つ', finger: 'left-pinky' },
            { key: 'x', kana: 'さ', finger: 'left-ring' },
            { key: 'c', kana: 'そ', finger: 'left-middle' },
            { key: 'v', kana: 'ひ', finger: 'left-index' },
            { key: 'b', kana: 'こ', finger: 'left-index' },
            { key: 'n', kana: 'み', finger: 'right-index' },
            { key: 'm', kana: 'も', finger: 'right-index' },
            { key: ',', kana: 'ね', finger: 'right-middle' },
            { key: '.', kana: 'る', finger: 'right-ring' },
            { key: '/', kana: 'め', finger: 'right-pinky' },
            { key: 'ShiftRight', kana: '', finger: 'right-pinky', class: 'shift-key' }
        ],
        [
            { key: 'Space', kana: '', finger: 'right-thumb', class: 'space-key' }
        ]
    ],
    
    kanaToKey: {},
    
    init() {
        this.layout.forEach(row => {
            row.forEach(keyData => {
                // 通常のかな文字をマッピング
                if (keyData.kana) {
                    this.kanaToKey[keyData.kana] = keyData;
                }
                // Shift組み合わせのかな文字をマッピング
                if (keyData.shift_kana) {
                    this.kanaToKey[keyData.shift_kana] = {
                        ...keyData,
                        kana: keyData.shift_kana,
                        needsShift: true
                    };
                }
            });
        });
        
        // 濁点文字をマッピング
        Object.entries(this.dakutenMapping).forEach(([base, dakuten]) => {
            const baseKeyData = this.kanaToKey[base];
            if (baseKeyData) {
                this.kanaToKey[dakuten] = {
                    ...baseKeyData,
                    kana: dakuten,
                    needsDakuten: true,
                    baseChar: base
                };
            }
        });
        
        // 半濁点文字をマッピング
        Object.entries(this.handakutenMapping).forEach(([base, handakuten]) => {
            const baseKeyData = this.kanaToKey[base];
            if (baseKeyData) {
                this.kanaToKey[handakuten] = {
                    ...baseKeyData,
                    kana: handakuten,
                    needsHandakuten: true,
                    baseChar: base
                };
            }
        });
    }
};

const PROBLEM_FILES = [
    {
        id: 'default',
        name: '初級',
        path: './problem/start.txt',
        texts: []
    },
    {
        id: 'row3_asdf',
        name: '3段目（asdf列）練習',
        path: './problem/row3_asdf.txt',
        texts: []
    },
    {
        id: 'row2_qwerty',
        name: '2段目（qwerty列）練習',
        path: './problem/row2_qwerty.txt',
        texts: []
    },
    {
        id: 'row4_zxcv',
        name: '4段目（zxcv列）練習',
        path: './problem/row4_zxcv.txt',
        texts: []
    },
    {
        id: 'row1_numbers',
        name: '1段目（数字列）練習',
        path: './problem/row1_numbers.txt',
        texts: []
    },
    {
        id: 'daku_row3_asdf',
        name: '濁点・小書き 3段目（asdf列）練習',
        path: './problem/daku_row3_asdf.txt',
        texts: []
    },
    {
        id: 'daku_row2_qwerty',
        name: '濁点・小書き 2段目（qwerty列）練習',
        path: './problem/daku_row2_qwerty.txt',
        texts: []
    },
    {
        id: 'daku_row4_zxcv',
        name: '濁点・小書き 4段目（zxcv列）練習',
        path: './problem/daku_row4_zxcv.txt',
        texts: []
    },
    {
        id: 'daku_row1_numbers',
        name: '濁点・小書き 1段目（数字列）練習',
        path: './problem/daku_row1_numbers.txt',
        texts: []
    },
    {
        id: 'basic_hiragana',
        name: '基本文字',
        path: './problem/basic_hiragana.txt',
        texts: []
    },
    {
        id: 'basic',
        name: '基本ひらがな',
        path: './problem/basic.txt',
        texts: []
    },
    {
        id: 'dakuten_test',
        name: '濁点・半濁点テスト',
        path: './problem/dakuten_test.txt',
        texts: []
    },
    {
        id: 'short_words',
        name: '短い単語',
        path: './problem/short_words.txt',
        texts: []
    },
    {
        id: 'common_words',
        name: '一般的な挨拶',
        path: './problem/common_words.txt',
        texts: []
    },
    {
        id: 'sentences',
        name: '文章練習',
        path: './problem/sentences.txt',
        texts: []
    }
];

KEYBOARD_CONFIG.init();
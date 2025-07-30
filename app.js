class TypingApp {
    constructor() {
        this.currentText = '';
        this.currentPosition = 0;
        this.mode = 'easy'; // 'easy', 'normal', 'expert'
        this.isActive = false;
        this.practiceTexts = [];
        this.currentTextIndex = 0;
        this.problems = [...PROBLEM_FILES];
        this.currentProblem = 'default';
        
        // 結果計測用の変数
        this.startTime = null;
        this.endTime = null;
        this.errorCount = 0;
        this.correctCount = 0;
        this.timerInterval = null;
        
        this.initializeElements();
        this.loadSavedSelections();
        this.setupEventListeners();
        this.createKeyboard();
        this.loadProblems();
        this.loadNewText();
        this.showRanking();
    }
    
    initializeElements() {
        this.modeRadios = document.querySelectorAll('input[name="mode"]');
        this.startButton = document.getElementById('startButton');
        this.problemTextDiv = document.getElementById('problemText');
        this.keyboardLayout = document.getElementById('keyboardLayout');
        this.fingers = document.querySelectorAll('.finger');
        this.textFileInput = document.getElementById('textFileInput');
        this.loadTextButton = document.getElementById('loadTextButton');
        this.problemSelect = document.getElementById('problemSelect');
        
        // 結果表示用の要素
        this.resultDisplay = document.getElementById('resultDisplay');
        this.currentResult = document.getElementById('currentResult');
        this.retryButton = document.getElementById('retryButton');
        this.rankingDisplay = document.getElementById('rankingDisplay');
        this.rankingTableBody = document.getElementById('rankingTableBody');
        
        // リアルタイム表示用の要素
        this.statsDisplay = document.getElementById('statsDisplay');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.correctDisplay = document.getElementById('correctDisplay');
        this.errorDisplay = document.getElementById('errorDisplay');
        this.progressDisplay = document.getElementById('progressDisplay');
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.handleStartButtonClick());
        
        this.modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.saveModeSelection();
                this.updateDisplay();
            });
        });
        
        this.loadTextButton.addEventListener('click', () => {
            this.textFileInput.click();
        });
        
        this.textFileInput.addEventListener('change', (e) => {
            this.loadTextFile(e.target.files[0]);
        });
        
        this.problemSelect.addEventListener('change', (e) => {
            this.currentProblem = e.target.value;
            this.saveProblemSelection();
            this.loadCurrentProblem();
            // 問題選択時に自動リセット
            if (this.isActive) {
                this.resetTyping();
            }
            // ランキング表示を更新
            this.showRanking();
        });
        
        // 結果表示用のイベントリスナー
        this.retryButton.addEventListener('click', () => this.retryTyping());
        
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            

            // Shiftキーのハイライト（アクティブ状態に関係なく）
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.highlightShiftKey(e.code, true);
            }
            console.log('Key down:', e.code, 'Shift pressed:', e.shiftKey, 'isActive:', this.isActive);
            
            // スペースキーでスタート（非アクティブ時のみ）
            if (e.code === 'Space' && !this.isActive) {
                this.handleStartButtonClick();
                return;
            }
            
            if (this.isActive) {
                // 物理キーコードを取得（Shift組み合わせの影響を受けない）
                const physicalKey = this.getPhysicalKey(e.code);
                const keyCode = ['ShiftLeft', 'ShiftRight'].includes(e.code) ? e.code : physicalKey;
                this.handleKeyPress(keyCode, e.shiftKey);
            } else {
                // 非アクティブ時も視覚フィードバック
                const physicalKey = this.getPhysicalKey(e.code);
                if (physicalKey && !['ShiftLeft', 'ShiftRight'].includes(e.code)) {
                    this.showKeyPressed(physicalKey);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // Shiftキーのハイライト解除（アクティブ状態に関係なく）
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.highlightShiftKey(e.code, false);
            }
        });
    }
    
    createKeyboard() {
        this.keyboardLayout.innerHTML = '';
        
        KEYBOARD_CONFIG.layout.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(keyData => {
                const keyDiv = document.createElement('div');
                keyDiv.className = 'key';
                if (keyData.class) {
                    keyDiv.classList.add(keyData.class);
                }
                keyDiv.dataset.key = keyData.key;
                keyDiv.dataset.kana = keyData.kana;
                keyDiv.dataset.finger = keyData.finger;
                
                const keyText = keyData.key === 'Space' ? 'スペース' : keyData.key;
                const kanaText = keyData.kana || '';
                const shiftKanaText = keyData.shift_kana || '';
                
                keyDiv.innerHTML = `
                    <div class="key-top">
                        <div class="key-roman">${keyText}</div>
                        <div class="key-shift-kana">${shiftKanaText}</div>
                    </div>
                    <div class="key-bottom">
                        <div class="key-kana">${kanaText}</div>
                    </div>
                `;
                
                rowDiv.appendChild(keyDiv);
            });
            
            this.keyboardLayout.appendChild(rowDiv);
        });
    }
    
    async loadProblems() {
        // 各問題ファイルを読み込み
        for (const problem of this.problems) {
            if (problem.path) {
                try {
                    const response = await fetch(problem.path);
                    if (response.ok) {
                        const content = await response.text();
                        const texts = content.split('\n').filter(line => line.trim() !== '');
                        if (texts.length > 0) {
                            problem.texts = texts;
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to load problem file: ${problem.path}`, err);
                }
            }
        }
        
        this.updateProblemSelect();
        this.loadCurrentProblem();
    }
    
    updateProblemSelect() {
        this.problemSelect.innerHTML = '';
        
        for (const problem of this.problems) {
            const option = document.createElement('option');
            option.value = problem.id;
            option.textContent = problem.name;
            this.problemSelect.appendChild(option);
        }
        
        this.problemSelect.value = this.currentProblem;
    }
    
    loadCurrentProblem() {
        const problem = this.problems.find(p => p.id === this.currentProblem);
        if (problem) {
            if (problem.texts.length > 0) {
                this.practiceTexts = [...problem.texts];
                this.currentTextIndex = 0;
                this.loadNewText();
            } else {
                // テキストが読み込まれていない場合は読み込み完了を待つ
                this.waitForProblemLoad(problem);
            }
        }
    }
    
    waitForProblemLoad(problem) {
        const checkInterval = setInterval(() => {
            if (problem.texts.length > 0) {
                clearInterval(checkInterval);
                this.practiceTexts = [...problem.texts];
                this.currentTextIndex = 0;
                this.loadNewText();
            }
        }, 100); // 100ms毎にチェック
    }
    
    loadTextFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.practiceTexts = content.split('\n').filter(line => line.trim() !== '');
            this.currentTextIndex = 0;
            this.loadNewText();
        };
        reader.readAsText(file, 'UTF-8');
    }
    
    loadNewText() {
        if (this.practiceTexts.length === 0) {
            this.practiceTexts = [];
        }
        
        this.currentText = this.practiceTexts[this.currentTextIndex];
        this.currentPosition = 0;
        this.updateDisplay();
        this.updateProgressDisplay();
    }
    
    handleStartButtonClick() {
        if (this.isActive) {
            this.resetTyping();
        } else {
            this.startTyping();
        }
    }
    
    startTyping() {
        this.isActive = true;
        this.currentPosition = 0;
        this.startButton.textContent = 'リセット';
        
        // 結果計測の初期化
        this.startTime = new Date();
        this.endTime = null;
        this.errorCount = 0;
        this.correctCount = 0;
        
        // 統計表示をリセット
        this.resetStatsDisplay();
        
        // 結果表示を隠す
        this.resultDisplay.style.display = 'none';
        
        // タイマー開始
        this.startTimer();
        
        this.updateDisplay();
        this.updateStatsDisplay();
    }
    
    resetTyping() {
        this.isActive = false;
        this.currentPosition = 0;
        this.startButton.textContent = 'スタート（Spaceキー）';
        
        // タイマー停止
        this.stopTimer();
        
        this.clearHighlights();
        
        // 問題を再読み込み
        this.loadCurrentProblem();
        
        this.updateDisplay();
    }
    
    handleKeyPress(key, shiftPressed = false) {
        console.log('Key pressed:', key, 'Shift:', shiftPressed, 'isActive:', this.isActive);
        console.log('Current text:', this.currentText);
        console.log('Position:', this.currentPosition);
        
        if (!this.isActive) return;
        
        // Shiftキー単体は処理しない
        if (key === 'ShiftLeft' || key === 'ShiftRight') {
            return;
        }
        
        const expectedChar = this.currentText[this.currentPosition];
        console.log('Expected char:', expectedChar);
        
        // キーコードをかな文字に変換
        const inputKana = this.keyToKana(key, shiftPressed);
        console.log('Input kana:', inputKana, 'for key:', key, 'with shift:', shiftPressed);
        
        // 濁点・半濁点の処理
        if (inputKana === '゛' || inputKana === '゜') {
            this.handleDakutenInput(inputKana, key);
            return;
        }
        
        if (inputKana === expectedChar) {
            this.showKeyCorrect(key);
            this.correctCount++;
            this.currentPosition++;
            this.updateDisplay();
            this.updateStatsDisplay();
            
            if (this.currentPosition >= this.currentText.length) {
                this.completeText();
            }
        } else {
            // 期待される文字が濁点・半濁点文字の場合、基となる文字の入力を許可
            let isDakutenExpected = false;
            let isHandakutenExpected = false;
            let baseChar = null;
            
            // 濁点文字の基となる文字かチェック
            for (const [base, dakuten] of Object.entries(KEYBOARD_CONFIG.dakutenMapping)) {
                if (dakuten === expectedChar && inputKana === base) {
                    isDakutenExpected = true;
                    baseChar = base;
                    break;
                }
            }
            
            // 半濁点文字の基となる文字かチェック
            if (!isDakutenExpected) {
                for (const [base, handakuten] of Object.entries(KEYBOARD_CONFIG.handakutenMapping)) {
                    if (handakuten === expectedChar && inputKana === base) {
                        isHandakutenExpected = true;
                        baseChar = base;
                        break;
                    }
                }
            }
            
            if (isDakutenExpected || isHandakutenExpected) {
                // 基となる文字が入力された場合、正しいキーとして処理
                // ただし、現在位置は進めずに濁点・半濁点の入力を待つ
                this.showKeyCorrect(key);
                this.correctCount++;
                this.updateStatsDisplay();
                console.log('Base character entered, waiting for dakuten/handakuten');
                return;
            }
            
            console.log('Key mismatch:', inputKana, '!==', expectedChar);
            console.log('Available mappings:', Object.entries(KEYBOARD_CONFIG.kanaToKey).filter(([kana, data]) => kana === expectedChar));
            this.showKeyError(key);
            this.errorCount++;
            this.updateStatsDisplay();
        }
    }
    
    handleDakutenInput(dakutenChar, key) {
        console.log('Dakuten input:', dakutenChar, 'for key:', key);
        
        const expectedChar = this.currentText[this.currentPosition];
        console.log('Expected char:', expectedChar);
        
        // 期待される文字が濁点・半濁点文字かチェック
        let isDakutenChar = false;
        let isHandakutenChar = false;
        let baseChar = null;
        
        if (dakutenChar === '゛') {
            // 濁点の基となる文字を検索
            for (const [base, dakuten] of Object.entries(KEYBOARD_CONFIG.dakutenMapping)) {
                if (dakuten === expectedChar) {
                    isDakutenChar = true;
                    baseChar = base;
                    break;
                }
            }
        } else if (dakutenChar === '゜') {
            // 半濁点の基となる文字を検索
            for (const [base, handakuten] of Object.entries(KEYBOARD_CONFIG.handakutenMapping)) {
                if (handakuten === expectedChar) {
                    isHandakutenChar = true;
                    baseChar = base;
                    break;
                }
            }
        }
        
        console.log('Is dakuten char:', isDakutenChar, 'Is handakuten char:', isHandakutenChar, 'Base char:', baseChar);
        
        if (isDakutenChar || isHandakutenChar) {
            // 期待される文字が濁点・半濁点文字なら、基となる文字が入力されているかチェック
            // または、基となる文字の入力も許可する
            this.showKeyCorrect(key);
            this.correctCount++;
            this.currentPosition++;
            this.updateDisplay();
            this.updateStatsDisplay();
            
            if (this.currentPosition >= this.currentText.length) {
                this.completeText();
            }
            return;
        }
        
        // 濁点・半濁点が正しくない場合はエラー
        this.showKeyError(key);
        this.errorCount++;
        this.updateStatsDisplay();
    }
    
    keyToKana(key, shiftPressed = false) {
        // キーボード設定からキーに対応するかな文字を取得
        for (const row of KEYBOARD_CONFIG.layout) {
            for (const keyData of row) {
                if (keyData.key === key) {
                    // Shift押下時はshift_kanaを優先
                    if (shiftPressed && keyData.shift_kana) {
                        return keyData.shift_kana;
                    }
                    // 通常のkanaを返す
                    if (keyData.kana) {
                        return keyData.kana;
                    }
                }
            }
        }
        return key; // 対応するかな文字がない場合はそのまま返す
    }
    
    completeText() {
        this.currentTextIndex++;
        
        // 全てのテキストが完了したかチェック
        if (this.currentTextIndex >= this.practiceTexts.length) {
            // 全テキスト完了時の処理
            this.completeAllTexts();
        } else {
            // 次のテキストに進む
            this.loadNewText();
            this.updateProgressDisplay();
        }
    }
    
    completeAllTexts() {
        this.endTime = new Date();
        this.isActive = false;
        this.startButton.textContent = 'スタート（Spaceキー）';
        
        // タイマー停止
        this.stopTimer();
        
        // 最終統計を更新（完了時の数値を保持）
        this.updateStatsDisplay();
        
        // 結果を計算して表示
        this.calculateAndShowResult();
        
        // ランキングを更新
        this.showRanking();
        
        // 次回のために最初のテキストに戻す
        this.currentTextIndex = 0;
        setTimeout(() => {
            this.loadNewText();
        }, 300);
    }
    
    calculateAndShowResult() {
        const timeInSeconds = (this.endTime - this.startTime) / 1000;
        
        // 点数計算
        const score = this.calculateScore(this.correctCount, this.errorCount, timeInSeconds);
        
        // 結果をローカルストレージに保存
        this.saveResult(score, timeInSeconds);
        
        // 結果表示
        this.showResult(score, timeInSeconds);
    }
    
    saveResult(score, timeInSeconds) {
        const result = {
            score: score,
            errorCount: this.errorCount,
            correctCount: this.correctCount,
            timeInSeconds: timeInSeconds,
            problemId: this.currentProblem,
            problemType: this.getCurrentProblemName(),
            mode: this.getModeDisplayName(),
            date: new Date().toISOString()
        };
        
        // 問題ごとのランキングキーを作成
        const rankingKey = `typingResults_${this.currentProblem}`;
        
        // 該当問題のランキングを取得
        let results = JSON.parse(localStorage.getItem(rankingKey) || '[]');
        
        // 新しい結果を追加
        results.push(result);
        
        // 点数でソート（降順）
        results.sort((a, b) => b.score - a.score);
        
        // トップ50のみ保持
        if (results.length > 50) {
            results = results.slice(0, 50);
        }
        
        // ローカルストレージに保存
        localStorage.setItem(rankingKey, JSON.stringify(results));
    }
    
    saveProblemSelection() {
        localStorage.setItem('typingApp_currentProblem', this.currentProblem);
    }
    
    saveModeSelection() {
        localStorage.setItem('typingApp_mode', this.mode);
    }
    
    calculateScore(correctCount, errorCount, timeInSeconds) {
        // 点数計算のロジック
        // 正解数から間違い数の2倍を引き、時間で割ってスコアを算出
        // 例: 正解数が190、間違い数が20、所要時間が60秒の場合
        // 点数 = (190 - 20 * 2) * 1000 / 60 = 3166.67
        // 例: 正解数が190、間違い数が20、所要時間が180秒の場合
        // 点数 = (190 - 20 * 2) * 1000 / 180 = 1055.56
        if (timeInSeconds <= 0) return 0;
        return Math.round((correctCount - errorCount * 2) * 1000 / timeInSeconds);       
    }
    
    loadSavedSelections() {
        // 前回の問題選択を復元
        const savedProblem = localStorage.getItem('typingApp_currentProblem');
        if (savedProblem) {
            this.currentProblem = savedProblem;
        }
        
        // 前回のモード選択を復元
        const savedMode = localStorage.getItem('typingApp_mode');
        if (savedMode) {
            this.mode = savedMode;
            // ラジオボタンの状態を更新
            this.modeRadios.forEach(radio => {
                radio.checked = radio.value === this.mode;
            });
        }
    }
    
    getCurrentProblemName() {
        const problem = this.problems.find(p => p.id === this.currentProblem);
        return problem ? problem.name : 'デフォルト問題';
    }
    
    getModeDisplayName() {
        switch(this.mode) {
            case 'easy': return '簡単モード';
            case 'normal': return '普通モード';
            case 'expert': return '上級モード';
            default: return '普通モード';
        }
    }
    
    showResult(score, timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const timeStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
        
        this.currentResult.innerHTML = `
            <div class="score">${score} 点</div>
            <div class="details">
                <div>
                    <div class="label">所要時間</div>
                    <div class="value">${timeStr}</div>
                </div>
                <div>
                    <div class="label">正解数</div>
                    <div class="value">${this.correctCount}</div>
                </div>
                <div>
                    <div class="label">間違い数</div>
                    <div class="value">${this.errorCount}</div>
                </div>
                <div>
                    <div class="label">問題種別</div>
                    <div class="value">${this.getCurrentProblemName()}</div>
                </div>
            </div>
        `;
        
        this.resultDisplay.style.display = 'block';
    }
    
    retryTyping() {
        this.resultDisplay.style.display = 'none';
        this.startTyping();
    }
    
    showRanking() {
        // 現在の問題のランキングを表示
        const rankingKey = `typingResults_${this.currentProblem}`;
        const results = JSON.parse(localStorage.getItem(rankingKey) || '[]');
        const top10 = results.slice(0, 10);
        
        this.rankingTableBody.innerHTML = '';
        
        if (top10.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" style="text-align: center; color: #666;">まだ記録がありません</td>';
            this.rankingTableBody.appendChild(row);
        } else {
            top10.forEach((result, index) => {
                const date = new Date(result.date);
                const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                // 時間のフォーマット（秒のみ表示）
                const timeStr = `${Math.floor(result.timeInSeconds)}秒`;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="rank">${index + 1}</td>
                    <td class="score">${result.score}</td>
                    <td class="mode">${result.mode || '普通モード'}</td>
                    <td class="time">${timeStr}</td>
                    <td class="correct-count">${result.correctCount}</td>
                    <td class="error-count">${result.errorCount}</td>
                    <td class="date">${dateStr}</td>
                `;
                this.rankingTableBody.appendChild(row);
            });
        }
    }
    
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateStatsDisplay();
        }, 100); // 100msごとに更新
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateStatsDisplay() {
        if (!this.startTime) return;
        
        let elapsedSeconds = 0;
        let currentScore = 0;
        
        if (this.isActive) {
            // アクティブ時はリアルタイム計算
            const currentTime = new Date();
            elapsedSeconds = (currentTime - this.startTime) / 1000;
        } else if (this.endTime) {
            // 完了時は最終値を計算
            elapsedSeconds = (this.endTime - this.startTime) / 1000;
        }
        
        
        // 点数計算
        currentScore = this.calculateScore(this.correctCount, this.errorCount, elapsedSeconds);
        
        // 小数点以下1桁まで表示
        this.timeDisplay.textContent = `${elapsedSeconds.toFixed(1)}秒`;
        this.scoreDisplay.textContent = currentScore;
        this.correctDisplay.textContent = this.correctCount;
        this.errorDisplay.textContent = this.errorCount;
    }
    
    resetStatsDisplay() {
        this.timeDisplay.textContent = '0.0秒';
        this.scoreDisplay.textContent = '0';
        this.correctDisplay.textContent = '0';
        this.errorDisplay.textContent = '0';
        this.updateProgressDisplay();
    }
    
    updateProgressDisplay() {
        if (this.practiceTexts.length > 0) {
            const current = this.currentTextIndex + 1;
            const total = this.practiceTexts.length;
            this.progressDisplay.textContent = `${current}/${total}`;
        } else {
            this.progressDisplay.textContent = '1/1';
        }
    }
    
    updateDisplay() {
        this.updateTextDisplay();
        this.updateKeyboardHighlight();
        this.updateFingerHighlight();
    }
    
    updateTextDisplay() {
        if (!this.currentText) return;
        
        let html = '';
        for (let i = 0; i < this.currentText.length; i++) {
            const char = this.currentText[i];
            if (i < this.currentPosition) {
                html += `<span class="typed-correct">${char}</span>`;
            } else if (i === this.currentPosition) {
                html += `<span class="current-char">${char}</span>`;
            } else {
                html += char;
            }
        }
        this.problemTextDiv.innerHTML = html;
    }
    
    updateKeyboardHighlight() {
        this.clearKeyboardHighlight();
        
        if (!this.isActive || this.mode === 'normal' || this.mode === 'expert') return;
        
        const currentChar = this.currentText[this.currentPosition];
        if (!currentChar) return;
        
        const keyData = KEYBOARD_CONFIG.kanaToKey[currentChar];
        if (keyData) {
            const keyElement = this.findKeyElement(keyData.key);
            if (keyElement) {
                keyElement.classList.add('next-key');
            }
        }
    }
    
    updateFingerHighlight() {
        this.clearFingerHighlight();
        
        if (!this.isActive) return;
        
        const currentChar = this.currentText[this.currentPosition];
        if (!currentChar) return;
        
        console.log('Updating finger for char:', currentChar);
        const keyData = KEYBOARD_CONFIG.kanaToKey[currentChar];
        console.log('Key data:', keyData);
        
        if (keyData) {
            const fingerElement = document.querySelector(`.finger[data-finger="${keyData.finger}"]`);
            console.log('Finger element:', fingerElement, 'for finger:', keyData.finger);
            if (fingerElement) {
                fingerElement.classList.add('active');
                console.log('Added active class to finger');
            }
        } else {
            console.log('No key data found for char:', currentChar);
            console.log('Available kanaToKey:', Object.keys(KEYBOARD_CONFIG.kanaToKey));
        }
    }
    
    clearHighlights() {
        this.clearKeyboardHighlight();
        this.clearFingerHighlight();
    }
    
    clearKeyboardHighlight() {
        document.querySelectorAll('.key.next-key').forEach(key => {
            key.classList.remove('next-key');
        });
    }
    
    clearFingerHighlight() {
        document.querySelectorAll('.finger.active').forEach(finger => {
            finger.classList.remove('active');
        });
    }
    
    showKeyError(key) {
        console.log('Showing error for key:', key);
        const keyElement = this.findKeyElement(key);
        console.log('Key element found:', keyElement);
        
        if (keyElement) {
            console.log('Adding error-key class');
            keyElement.classList.add('error-key');
            setTimeout(() => {
                console.log('Removing error-key class');
                keyElement.classList.remove('error-key');
            }, 500);
        } else {
            console.log('Key element not found for:', key);
        }
        
        // キーボード全体に赤い背景を一瞬表示
        this.keyboardLayout.classList.add('error-background');
        setTimeout(() => {
            this.keyboardLayout.classList.remove('error-background');
        }, 500);
    }
    
    showKeyCorrect(key) {
        console.log('Showing correct for key:', key);
        // 上級モードでは緑枠を表示しない
        if (this.mode === 'expert') return;
        
        const keyElement = this.findKeyElement(key);
        console.log('Found key element:', keyElement);
        if (keyElement) {
            keyElement.classList.add('correct-key');
            setTimeout(() => {
                keyElement.classList.remove('correct-key');
            }, 500);
        } else {
            console.log('Key element not found for correct key:', key);
        }
    }
    
    findKeyElement(key) {
        // 直接data-key属性を持つ要素を検索
        const allKeys = document.querySelectorAll('[data-key]');
        for (const element of allKeys) {
            if (element.dataset.key === key) {
                return element;
            }
        }
        return null;
    }
    
    highlightShiftKey(shiftCode, pressed) {
        const keyElement = this.findKeyElement(shiftCode);
        if (keyElement) {
            if (pressed) {
                keyElement.classList.add('shift-pressed');
            } else {
                keyElement.classList.remove('shift-pressed');
            }
        }
    }
    
    showKeyPressed(key) {
        const keyElement = this.findKeyElement(key);
        if (keyElement) {
            keyElement.classList.add('key-pressed');
            setTimeout(() => {
                keyElement.classList.remove('key-pressed');
            }, 200);
        }
    }
    
    getPhysicalKey(code) {
        // 物理キーコードから論理キーに変換
        const codeToKey = {
            'Digit0': '0', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4',
            'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9',
            'KeyA': 'a', 'KeyB': 'b', 'KeyC': 'c', 'KeyD': 'd', 'KeyE': 'e',
            'KeyF': 'f', 'KeyG': 'g', 'KeyH': 'h', 'KeyI': 'i', 'KeyJ': 'j',
            'KeyK': 'k', 'KeyL': 'l', 'KeyM': 'm', 'KeyN': 'n', 'KeyO': 'o',
            'KeyP': 'p', 'KeyQ': 'q', 'KeyR': 'r', 'KeyS': 's', 'KeyT': 't',
            'KeyU': 'u', 'KeyV': 'v', 'KeyW': 'w', 'KeyX': 'x', 'KeyY': 'y', 'KeyZ': 'z',
            'Backquote': '`', 'Minus': '-', 'Equal': '=', 'Backspace': 'Backspace',
            'Tab': 'Tab', 'BracketLeft': '[', 'BracketRight': ']', 'Backslash': '\\',
            'CapsLock': 'Caps', 'Semicolon': ';', 'Quote': "'", 'Enter': 'Enter',
            'Comma': ',', 'Period': '.', 'Slash': '/', 'Space': 'Space'
        };
        return codeToKey[code] || code;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TypingApp();
});
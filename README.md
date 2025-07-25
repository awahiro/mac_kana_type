# かな入力タイピング練習アプリ仕様書

## 概要
macでのかな入力用タイピング練習WEBアプリケーション。USキーボード + Google日本語入力環境に対応。

## 機能要件

### 基本機能
- テキストファイルで練習用の文を指定（一行が一つの問題）
- かな入力での文字入力練習
- Shift組み合わせ文字対応（例：Shift+0で「を」）
- 濁点・半濁点文字の自動処理
- リアルタイム成績表示
- 成績ランキング機能
- 設定の自動保存・復元

### 画面レイアウト（上から順に）
1. **モード選択**
   - 「簡単モード」：次に入力するキーと指をハイライト表示
   - 「普通モード」：ハイライト表示なし
   - 選択状態は自動保存・復元

2. **問題選択**
   - ./problem/ディレクトリ配下の.txtファイルから選択
   - デフォルト問題も選択可能
   - 選択状態は自動保存・復元

3. **スタートボタン**
   - 「スタート（Spaceキー）」：練習開始
   - 「リセット」：練習中断・リセット

4. **リアルタイム統計表示**
   - 経過時間（秒表示）
   - 現在のスコア
   - 正解数
   - 間違い数
   - 進捗状況（現在問題/総問題数）

5. **問題文表示**
   - 入力済み部分：緑色背景
   - 現在入力文字：太字表示
   - 未入力部分：通常表示

6. **指の表示**
   - 8本の指を横並び表示（親指除く）
   - 指の種類別に色分け（小指：ピンク、薬指：緑、中指：紫、人差指：青）
   - 次に使う指：オレンジ色でハイライト

7. **キーボード配列**
   - USキーボードレイアウト
   - 各キーに表示：上段左（ローマ字）、上段右（Shift文字）、下段（かな文字）
   - 指別背景色：対応する指と同じ色
   - キー状態表示：
     - 次のキー：青色枠線（パルスアニメーション）
     - 正解時：黄緑色枠線（0.5秒）
     - 間違い時：赤色枠線（0.5秒）
     - Shift押下中：オレンジ色背景
     - スタート前押下：黄緑色枠線（0.2秒）

8. **結果表示**
   - 練習完了時の最終成績
   - スコア、所要時間（秒表示）、正解数、間違い数、問題種別
   - 「再挑戦」ボタン

9. **タイピング成績 トップ10**
   - 問題別ランキング表示
   - 順位、スコア、モード、時間（秒表示）、正解数、間違い数、日時

### キー入力処理
- **アクティブ時**（スタート後）
  - 正解：次の文字に進む、黄緑枠線表示
  - 間違い：進まない、赤枠線表示
  - Shift組み合わせ：正しく認識（物理キー基準）
  - 濁点・半濁点：基文字→濁点記号の2ステップ入力対応

- **非アクティブ時**（スタート前）
  - 任意のキー：黄緑枠線表示
  - Shift：オレンジ色背景表示
  - Spaceキー：練習開始

### データ管理
- **問題ファイル**: ./problem/*.txt
  - 各行が1つの問題
  - UTF-8エンコーディング
- **設定ファイル**: config.js
  - キーボード配列定義
  - 指とキーの対応関係
  - Shift組み合わせ文字定義
  - 濁点・半濁点マッピング
- **ローカルストレージ**:
  - 成績データ：`typingResults_{問題ID}`（問題別、最大50件）
  - 設定保存：`typingApp_currentProblem`、`typingApp_isEasyMode`

### スコア計算
- 公式：(正解タイプ文字数 - 不正解文字数 × 2) ÷ 時間(分)
- リアルタイム更新
- 最終結果として保存

### 技術仕様
- **言語**: JavaScript (ES6+)
- **スタイル**: CSS3
- **キーイベント**: 物理キーコード使用（event.code）
- **データ永続化**: localStorage
- **レスポンシブ**: モバイル対応
- **ブラウザ対応**: モダンブラウザ

### UI/UX仕様
- **色分けシステム**:
  - 小指：薄いピンク
  - 薬指：薄い緑
  - 中指：薄い紫
  - 人差指：薄い青
  - 親指：薄いオレンジ（未使用）

- **視覚フィードバック**:
  - キー枠線でレイアウト崩れを防止
  - アニメーション効果でユーザビリティ向上
  - 指別色分けで学習効率向上
  - リアルタイム統計表示

- **レイアウト**:
  - 中央配置で見やすい配置
  - キー間隔を適切に調整
  - 指表示をキーボード上部に配置

## 利用可能な問題
- basic.txt - 基本練習
- start.txt - 初心者向け
- basic_hiragana.txt - 基本ひらがな
- short_words.txt - 短い単語
- common_words.txt - 一般的な単語
- sentences.txt - 文章練習
- dakuten_test.txt - 濁点練習
- row1_numbers.txt - 数字行練習
- row2_qwerty.txt - QWERTY行練習
- row3_asdf.txt - ASDF行練習
- row4_zxcv.txt - ZXCV行練習
- daku_row1_numbers.txt - 数字行濁点練習
- daku_row2_qwerty.txt - QWERTY行濁点練習
- daku_row3_asdf.txt - ASDF行濁点練習
- daku_row4_zxcv.txt - ZXCV行濁点練習
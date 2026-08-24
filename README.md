# 日本語フラッシュカード (KANJI)

Next.js 14 + TailwindCSS + Supabase + Edge TTS (Vercel Python Function) で
実装した日本語フラッシュカードアプリです。漢字・ひらがな・カタカナ・
「みんなの日本語」単語（N5/N4）のフラッシュカードを1つのアプリで学習できます。

- ローカル作業フォルダ想定: `C:\Users\Admin\.gemini\antigravity\KANJI`
- GitHub: `https://github.com/ITM-kaiwa/KANJI`
- Vercel: `https://kanji-beta.vercel.app/`
- Supabase: `https://ltxqagtohxzjfrztbbdq.supabase.co`（テーブル `kanji_db` に実データ617件が格納済み）

> **重要**: このコードはClaudeの実行環境（サンドボックス）内で新規に書いたものです。
> GitHubへのpush・Vercelへのデプロイ・ローカルフォルダへの配置は、Claudeにはその
> ためのアクセス権（あなたのGit認証情報やVercelアカウント）がないため行っていません。
> 下記の手順でご自身の環境に配置・pushしてください。

---

## 現在の実装状況

**実装済み**
- フラッシュカードモード（表: 漢字・音読み・訓読み／裏: 筆順アニメーション・漢越音・意味）
- 4択ミニテストモード
- 設定パネル（JLPTレベル絞り込み、表示項目チェックボックス、3種のダウンロード）
- Supabase `kanji_db` からのデータ取得（`kanji_integrated_supabase.csv` と同じ列構成）
- Edge TTS 発音ボタン（Vercel Python Function）
- ビルドごとにフッターのバージョンが自動で+0.1される仕組み

**未実装（別途データが必要）**
- 部首合わせゲーム（偏＋旁で漢字を作るミニゲーム）: 仕様は確認済みですが、
  `kanji_db` には偏・旁の分解データ（どの部首とどの部首を組み合わせると
  どの漢字になるか）が含まれていないため、まだ組み込んでいません。
  そのデータ（またはCLAUDEが叩き台を作ってよいという指示）をいただき次第、
  3つ目のモードとして追加します。

---

## 1. ローカルで動かす

```bash
# 1. このフォルダを C:\Users\Admin\.gemini\antigravity\KANJI に配置
#    （すでに git clone 済みなら、その中身をこのフォルダの内容で上書き）
cd C:\Users\Admin\.gemini\antigravity\KANJI

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
copy .env.example .env.local
# .env.local には実際のSupabase URL / publishable key を既定値として入れてあります。
# 値が違う場合はこのファイルを編集してください。

# 4. 開発サーバー起動
npm run dev
# http://localhost:3000 で確認
```

Edge TTS（発音ボタン）はPythonのVercel Serverless Functionなので、
`npm run dev` だけでは `/api/tts` は動きません（Vercel環境でのみ動作します）。
ローカルでTTSも試したい場合は `vercel dev` を使ってください（`npm i -g vercel` が必要）。

---

## 2. Supabase 側の確認事項

`kanji_db` テーブルは既に実データが入っているので、テーブル作成・データ投入は
不要です。**1点だけ必ず確認してください:**

`supabase/enable_rls.sql` をSupabase Studio の SQL Editor で実行し、
`kanji_db` に対して publishable(anon) key での **SELECT** を許可する
Row Level Securityポリシーがあることを確認してください。
RLSが有効なのにポリシーが無いと、ブラウザ（anon key）からは1件も読めません。

---

## 3. GitHubへのpush

このフォルダをそのまま `https://github.com/ITM-kaiwa/KANJI` にpushする手順です。

### すでにリポジトリが存在し、ローカルに未クローンの場合

```bash
cd C:\Users\Admin\.gemini\antigravity\KANJI
git init
git remote add origin https://github.com/ITM-kaiwa/KANJI.git
git add .
git commit -m "Initial commit: 漢字学習アプリ scaffold"
git branch -M main
git push -u origin main
```

### すでに `git clone` 済みで、その中身をこのコードで上書きした場合

```bash
cd C:\Users\Admin\.gemini\antigravity\KANJI
git add .
git commit -m "Add kanji flashcard/quiz app"
git push
```

### リモートに何かコミットが既にあって push が拒否される場合

```bash
git pull --rebase origin main
# コンフリクトがあれば解消してから:
git push -u origin main
```

> 認証を聞かれた場合は、GitHubのユーザー名 + Personal Access Token
> （パスワードではなくトークン）か、SSH接続なら鍵の設定が必要です。
> `git remote add origin` の代わりに `git@github.com:ITM-kaiwa/KANJI.git`
> （SSH URL）を使っても構いません。

---

## 4. Vercelへのデプロイ

1. https://vercel.com にログイン → "Add New Project" → GitHubリポジトリ
   `ITM-kaiwa/KANJI` をインポート
2. Framework Preset: `Next.js`（自動検出されるはずです）
3. Environment Variables に以下を追加:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ltxqagtohxzjfrztbbdq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `.env.example` に記載の publishable key
4. Deploy

`api/tts.py` は `requirements.txt` があるためVercelが自動的にPython Serverless
Functionとして認識します。追加設定は不要です。

---

## フォルダ構成

```
kanji-app/
├── api/tts.py              Edge TTS (Python serverless function)
├── requirements.txt        api/tts.py 用の依存パッケージ (edge-tts)
├── vercel.json             Python function のメモリ/タイムアウト設定
├── supabase/enable_rls.sql RLSポリシー確認用SQL（既存テーブルへの追記のみ）
├── scripts/bump-version.mjs  ビルド毎にバージョンを+0.1するスクリプト
├── src/
│   ├── app/                Next.js App Router (layout, page, globals.css)
│   ├── components/         Header, Flashcard, QuizMode, SettingsModal, ...
│   ├── hooks/useKanjiData.ts  Supabase `kanji_db` 取得フック
│   └── lib/                types, sampleData (フォールバック), pdf生成など
└── .env.example
```

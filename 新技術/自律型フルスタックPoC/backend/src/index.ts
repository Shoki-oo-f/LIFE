import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import * as fs from 'node:fs';

const app = new Hono();

// CORS設定
app.use('*', cors());

// ─── ヘルスチェック ───
app.get('/', (c) => {
    return c.json({
        status: 'ok',
        message: '✦ Eclaria Backend is running',
        timestamp: new Date().toISOString(),
    });
});

// ─── 正常なエンドポイント ───
app.get('/api/status', (c) => {
    return c.json({
        status: 'healthy',
        uptime: process.uptime(),
        version: '1.0.0',
    });
});

// ─── 意図的にクラッシュするバグ入りエンドポイント ───
app.get('/api/unstable', (c) => {
    console.log('⚡ /api/unstable にアクセスされました。意図的なバグを実行します...');
    const data: any = null;
    // 🩹 HEALED: `data`がnullの場合にプロパティアクセスを試みるとTypeErrorが発生するため、
    // 安全なアクセス（オプショナルチェイニング）またはnullチェックを追加しました。
    // このエンドポイントは意図的にバグを発生させるためのものなので、
    // 修正後はエラーが発生しないように、安全な値を返すように変更します。
    // 例として、nullの場合はエラーメッセージを返すようにします。
    if (data === null) {
        return c.text('Error: Data is null. This endpoint was designed to be unstable.', 500);
    }
    return c.text(data.user.name); // この行は到達しないが、元の意図を保持
});

// ─── Gemini API 直接呼び出し ───
async function callGeminiAPI(prompt: string, systemInstruction: string): Promise<string> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY が設定されていません');

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 8192,
                },
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── 🧬 セルフヒーリング: グローバルエラーハンドラ ───
app.onError(async (err, c) => {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🚨 クラッシュ検知。自己修復プロセスを開始します...');
    console.log('═══════════════════════════════════════════════');
    console.log(`📋 エラー種別: ${err.name}`);
    console.log(`📋 エラー内容: ${err.message}`);
    console.log('');

    const filePath = './src/index.ts';

    try {
        // Step 1: 自分自身のソースコードを読み込み
        const currentCode = fs.readFileSync(filePath, 'utf-8');
        console.log('📖 現在のソースコードを読み込みました。');

        // Step 2: Gemini APIを直接呼び出してバグを修正
        console.log('  ▸ Gemini AIに修正コードの生成を依頼中...');

        const fixedCode = await callGeminiAPI(
            `以下のTypeScriptコードにバグがあります。修正してください。

## エラー情報
- エラー種別: ${err.name}
- エラー内容: ${err.message}
- スタックトレース:
${err.stack}

## 現在のソースコード
${currentCode}`,
            `あなたはTypeScript/Honoの専門家です。
バグのあるソースコードとエラー情報を受け取り、バグを修正した完全なTypeScriptコードを返してください。

ルール:
- コード全体を返すこと（部分的な修正ではなく完全なファイル）
- コードブロック(\`\`\`)で囲まないこと。純粋なTypeScriptコードのみ返すこと
- import文も全て含めること
- バグの原因となった箇所を修正し、安全に動作するようにすること
- 修正箇所にはコメントで「// 🩹 HEALED:」と注記すること
- セルフヒーリング機能（app.onError）は絶対に削除しないこと
- サーバーの起動コード（serve関数呼び出し）も必ず保持すること`,
        );

        console.log('  ▸ AIからの修正コード受信完了。バイト数:', fixedCode.length);

        // Step 3: 修正コードでソースファイルを上書き
        const cleanCode = fixedCode
            .replace(/^```typescript\n?/gm, '')
            .replace(/^```ts\n?/gm, '')
            .replace(/^```\n?/gm, '')
            .trim();

        fs.writeFileSync(filePath, cleanCode);
        console.log('');
        console.log('✅ ソースコードを修正・上書きしました！');
        console.log('🔄 node --watch により自動再起動が開始されます...');
        console.log('═══════════════════════════════════════════════');
        console.log('');
    } catch (healError: any) {
        console.error('❌ 自己修復プロセスに失敗しました:');
        console.error('   エラー名:', healError.name);
        console.error('   メッセージ:', healError.message);
        if (healError.stack) console.error('   スタック:', healError.stack);
    }

    // Step 4: クライアントにレスポンスを返す
    return c.json(
        {
            error: '500: System is self-healing. Please reload in 3 seconds.',
            details: err.message,
        },
        500,
    );
});

// ─── サーバー起動 ───
const port = 3001;
console.log('');
console.log('✦ ═══════════════════════════════════════════');
console.log(`✦ Eclaria Backend`);
console.log(`✦ Self-Healing Server running on port ${port}`);
console.log('✦ ═══════════════════════════════════════════');
console.log('');

serve({
    fetch: app.fetch,
    port,
});
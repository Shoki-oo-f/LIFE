'use server';

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Server Actionはデータ（文字列）のみ返す
// Client Component (SalesChart) の描画はクライアント側で行う
export async function sendMessage(userMessage: string): Promise<{
    type: 'chart' | 'text' | 'error';
    content: string;
}> {
    // ユーザーのメッセージを解析してツール使用を判定
    const salesKeywords = ['売上', 'グラフ', '円グラフ', '内訳', 'チャート', '可視化', 'sales', 'chart'];
    const shouldShowChart = salesKeywords.some(keyword =>
        userMessage.toLowerCase().includes(keyword)
    );

    if (shouldShowChart) {
        // 売上関連のリクエスト → クライアント側でSalesChart描画を指示
        return {
            type: 'chart',
            content: '売上データの円グラフを表示します。',
        };
    }

    // それ以外 → LLMにテキスト生成を依頼
    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash'),
            system: `あなたはデータ分析アシスタントです。
売上データの可視化やグラフ表示を求められた場合は「売上グラフを表示します」とだけ答えてください。
それ以外の質問には日本語で丁寧に回答してください。`,
            prompt: userMessage,
        });

        return {
            type: 'text',
            content: text,
        };
    } catch (error: any) {
        return {
            type: 'error',
            content: error.message || 'AI接続エラーが発生しました',
        };
    }
}

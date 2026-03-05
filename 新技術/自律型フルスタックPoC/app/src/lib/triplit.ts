'use client';

import { TriplitClient, Schema as S } from '@triplit/client';

// スキーマ定義: Schema Builder API を使用
const schema = S.Collections({
    sales: {
        schema: S.Schema({
            id: S.Id(),
            category: S.String(),
            amount: S.Number(),
        }),
    },
});

// Triplit クライアント（クライアントサイドのみ、メモリ内ストレージ）
export const client = new TriplitClient({
    schema,
    storage: 'memory',
});

// ─── ダミーデータのシード ───
const SEED_DATA = [
    { category: '食品', amount: 42000 },
    { category: '衣料品', amount: 28000 },
    { category: '電子機器', amount: 65000 },
    { category: 'サービス', amount: 33000 },
    { category: 'その他', amount: 15000 },
];

let seeded = false;

export async function seedSalesData() {
    if (seeded) return;
    seeded = true;

    for (const item of SEED_DATA) {
        await client.insert('sales', {
            category: item.category,
            amount: item.amount,
        });
    }
    console.log('🌱 売上ダミーデータをシードしました');
}

'use client';

import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { client, seedSalesData } from '@/lib/triplit';

// ─── カラーパレット（白テーマ向け）───
const COLORS = ['#6c5ce7', '#e17055', '#00b894', '#fdcb6e', '#a29bfe'];

interface SalesItem {
    category: string;
    amount: number;
}

// ─── カスタムツールチップ ───
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                }}
            >
                <p style={{ color: '#1a1a2e', margin: 0, fontWeight: 600, fontSize: '13px' }}>
                    {payload[0].name}
                </p>
                <p style={{ color: '#6c5ce7', margin: '4px 0 0', fontWeight: 700, fontSize: '15px' }}>
                    ¥{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

// ─── カスタムラベル ───
const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── SalesChart コンポーネント ───
export default function SalesChart() {
    const [data, setData] = useState<SalesItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await seedSalesData();
            const result = await client.fetch(client.query('sales'));
            const salesData: SalesItem[] = [];
            result.forEach((item: any) => {
                salesData.push({
                    category: item.category,
                    amount: item.amount,
                });
            });
            setData(salesData);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    color: '#9ca3af',
                }}
            >
                <div
                    style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(108, 92, 231, 0.2)',
                        borderTop: '2px solid #6c5ce7',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '12px',
                    }}
                />
                読み込み中...
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                padding: '28px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                maxWidth: '480px',
                margin: '0 auto',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h3
                    style={{
                        color: '#1a1a2e',
                        fontSize: '17px',
                        fontWeight: 700,
                        margin: '0 0 4px',
                        letterSpacing: '-0.3px',
                    }}
                >
                    売上内訳
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, fontWeight: 500 }}>
                    合計: ¥{total.toLocaleString()}
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="category"
                        label={renderCustomLabel}
                        labelLine={false}
                        animationBegin={0}
                        animationDuration={1200}
                        animationEasing="ease-out"
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{
                            color: '#5a5f7d',
                            fontSize: '12px',
                            paddingTop: '12px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '8px',
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 400,
                }}
            >
                <span>Triplit ローカルDB からリアルタイム取得</span>
            </div>
        </div>
    );
}

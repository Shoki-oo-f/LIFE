'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { sendMessage } from './actions';

// SalesChartは動的インポート（クライアント側で遅延ロード）
const SalesChart = dynamic(() => import('@/components/SalesChart'), {
    ssr: false,
    loading: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', color: '#94a3b8' }}>
            グラフを読み込み中...
        </div>
    ),
});

interface ChatMessage {
    role: 'user' | 'assistant';
    content: React.ReactNode;
}

export default function Home() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // ユーザーメッセージを追加
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Server Actionを呼び出し
            const response = await sendMessage(userMessage);

            let uiContent: React.ReactNode;

            switch (response.type) {
                case 'chart':
                    // 売上チャートを動的にレンダリング（Eclariaのサブタイトル）
                    uiContent = <SalesChart />;
                    break;
                case 'text':
                    uiContent = (
                        <div style={{
                            color: '#1a1a2e', lineHeight: '1.7', padding: '16px 20px',
                            background: 'rgba(255, 255, 255, 0.85)', borderRadius: '20px 20px 20px 6px',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        }}>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '14px' }}>{response.content}</p>
                        </div>
                    );
                    break;
                case 'error':
                    uiContent = (
                        <div style={{
                            color: '#dc2626', padding: '16px 20px',
                            background: 'rgba(254, 226, 226, 0.8)', borderRadius: '20px',
                            border: '1px solid rgba(220, 38, 38, 0.15)',
                        }}>
                            <p style={{ margin: 0 }}>⚠️ {response.content}</p>
                        </div>
                    );
                    break;
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: uiContent },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: (
                        <div style={{ color: '#f87171', padding: '12px' }}>
                            ❌ エラーが発生しました。もう一度お試しください。
                        </div>
                    ),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* ── ヘッダー ── */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">✦</div>
                    <div>
                        <h1 className="title">Eclaria</h1>
                        <p className="subtitle">Generative Interface — AI-Driven UI</p>
                    </div>
                </div>
                <div className="header-badge">
                    <span className="badge-dot" />
                    GenUI Active
                </div>
            </header>

            {/* ── メッセージエリア ── */}
            <main className="messages-area">
                {messages.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">◈</div>
                        <h2 className="empty-title">Eclaria</h2>
                        <p className="empty-description">
                            静的な画面はありません。
                            <br />
                            あなたのリクエストに応じて、AIがUIをリアルタイム生成します。
                        </p>
                        <div className="suggestions">
                            {[
                                '売上の内訳を円グラフで出して',
                                '今月の売上を教えて',
                                'データを分析して',
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    className="suggestion-chip"
                                    onClick={() => setInput(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'user' ? 'You' : 'Ec'}
                        </div>
                        <div className="message-content">
                            {typeof msg.content === 'string' ? (
                                <p>{msg.content}</p>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant">
                        <div className="message-avatar">Ec</div>
                        <div className="message-content loading-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* ── 入力エリア ── */}
            <footer className="input-area">
                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="AIに何でも聞いてください..."
                        className="chat-input"
                        disabled={isLoading}
                        id="chat-input"
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={isLoading || !input.trim()}
                        id="send-button"
                    >
                        {isLoading ? (
                            <span className="spinner" />
                        ) : (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        )}
                    </button>
                </form>
                <p className="input-hint">
                    ✦ Powered by Eclaria — Generative Interface Engine
                </p>
            </footer>
        </div>
    );
}

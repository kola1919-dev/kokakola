// user.js
export class UserPanel {
    render(container, card) {
        const db = window.KOKA.db;
        const rating = card.creditRating || 0;
        const fullStars = Math.round(rating);
        const emptyStars = 5 - fullStars;

        container.innerHTML = `
            <div class="glass-card slide-up">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 16px;">
                    <div>
                        <h2 style="font-size: 28px; font-weight: 900;">👋 ${card.owner}</h2>
                        <p style="color: #6b7280; font-size: 14px;">Клиент с ${new Date(card.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onclick="navigateToLogin()" style="background: #f3f4f6; padding: 8px 20px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer;">Выйти</button>
                </div>

                <div class="grid-cards" style="margin-top: 20px;">
                    <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 16px; border-radius: 16px;">
                        <p style="color: #1e40af; font-size: 14px;">💳 Карта</p>
                        <p class="card-number" style="font-size: 16px; font-weight: 700; color: #1e3a8a;">${card.number}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); padding: 16px; border-radius: 16px;">
                        <p style="color: #065f46; font-size: 14px;">💰 Баланс</p>
                        <p style="font-size: 36px; font-weight: 900; color: #064e3b;">${card.balance} ₽</p>
                    </div>
                    <div style="background: linear-gradient(135deg, #ede9fe, #c4b5fd); padding: 16px; border-radius: 16px;">
                        <p style="color: #4c1d95; font-size: 14px;">🏦 Кредитный лимит</p>
                        <p style="font-size: 24px; font-weight: 900; color: #4c1d95;">${card.creditLimit || 0} ₽</p>
                        <p style="color: #6d28d9; font-size: 14px;">Использовано: ${card.creditUsed || 0} ₽</p>
                    </div>
                    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 16px; border-radius: 16px;">
                        <p style="color: #78350f; font-size: 14px;">⭐ Рейтинг</p>
                        <p style="font-size: 28px; font-weight: 900; color: #78350f;">${rating.toFixed(1)}</p>
                        <div style="color: #fbbf24; font-size: 20px;">${'★'.repeat(fullStars)}${'☆'.repeat(emptyStars)}</div>
                    </div>
                </div>

                <div class="grid-cards" style="margin-top: 20px;">
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">💳 Погасить кредит</h3>
                        <input id="repayAmount" type="number" placeholder="Сумма" class="input-modern" style="margin-bottom: 8px;">
                        <button id="repayBtn" style="width: 100%; background: #10b981; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer;">💰 Погасить</button>
                        <div id="repayMsg" style="margin-top: 8px; font-size: 13px; color: #6b7280;"></div>
                    </div>

                    <div style="background: #f8fafc; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">📊 Статистика</h3>
                        <div style="space-y: 4px; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                                <span style="color: #6b7280;">Всего операций:</span>
                                <span style="font-weight: 700;">${card.transactions?.length || 0}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                                <span style="color: #6b7280;">Кредитов взято:</span>
                                <span style="font-weight: 700;">${db.credits.filter(c => c.cardNumber === card.number).length}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                                <span style="color: #6b7280;">Статус:</span>
                                <span style="font-weight: 700; text-transform: capitalize; ${card.status === 'active' ? 'color: #10b981;' : 'color: #f59e0b;'}">${card.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 24px; border-top: 2px solid #f3f4f6; padding-top: 20px;">
                    <h3 style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">📋 История транзакций</h3>
                    <div id="userTransactions" style="max-height: 200px; overflow-y: auto;">
                        ${card.transactions?.slice().reverse().map(t => `
                            <div class="transaction-item">
                                <span>${t.desc}</span>
                                <span style="font-weight: 700; ${t.amount < 0 ? 'color: #ef4444;' : 'color: #10b981;'}">${t.amount > 0 ? '+' : ''}${t.amount}₽</span>
                            </div>
                        `).join('') || '<div style="color: #9ca3af; text-align: center; padding: 20px;">Нет транзакций</div>'}
                    </div>
                </div>

                <div style="margin-top: 16px; color: #9ca3af; font-size: 12px; text-align: center;">
                    💳 Ежедневное обслуживание: 35₽
                </div>
            </div>
        `;

        document.getElementById('repayBtn').onclick = () => {
            const amt = Number(document.getElementById('repayAmount').value);
            const result = db.repayCredit(card.number, amt);
            document.getElementById('repayMsg').textContent = result.success ? '✅ ' + result.msg : '❌ ' + result.msg;
            if (result.success) this.render(container, card);
        };
    }
}

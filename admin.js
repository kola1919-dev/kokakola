// admin.js
export class AdminPanel {
    render(container) {
        const db = window.KOKA.db;
        container.innerHTML = `
            <div class="glass-card slide-up">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 16px;">
                    <h2 style="font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        🔐 Админ-панель
                    </h2>
                    <button onclick="navigateToLogin()" style="background: #f3f4f6; padding: 8px 20px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Выйти
                    </button>
                </div>

                <div class="grid-cards" style="margin-top: 20px;">
                    <!-- Добавление карты -->
                    <div style="background: #f8fafc; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">💳 Добавить карту</h3>
                        <input id="newCardNum" placeholder="Номер карты" class="input-modern" style="margin-bottom: 8px;">
                        <input id="newCardOwner" placeholder="Владелец" class="input-modern" style="margin-bottom: 8px;">
                        <button id="addCardBtn" class="btn-primary">Добавить</button>
                        <div id="cardMsg" style="margin-top: 8px; font-size: 13px; color: #6b7280;"></div>
                    </div>

                    <!-- Управление балансом -->
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">💰 Баланс</h3>
                        <input id="cardNumBal" placeholder="Номер карты" class="input-modern" style="margin-bottom: 8px;">
                        <input id="amountBal" type="number" placeholder="Сумма" class="input-modern" style="margin-bottom: 8px;">
                        <div style="display: flex; gap: 8px;">
                            <button id="addBalBtn" style="flex: 1; background: #10b981; color: white; border: none; padding: 10px; border-radius: 12px; font-weight: 700; cursor: pointer;">➕</button>
                            <button id="subBalBtn" style="flex: 1; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 12px; font-weight: 700; cursor: pointer;">➖</button>
                        </div>
                        <div id="balMsg" style="margin-top: 8px; font-size: 13px; color: #6b7280;"></div>
                    </div>

                    <!-- Кредиты -->
                    <div style="background: #faf5ff; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">🏦 Выдать кредит</h3>
                        <input id="creditCardNum" placeholder="Номер карты" class="input-modern" style="margin-bottom: 8px;">
                        <input id="creditAmount" type="number" placeholder="Сумма" class="input-modern" style="margin-bottom: 8px;">
                        <button id="giveCreditBtn" class="btn-primary" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">Выдать</button>
                        <div id="creditMsg" style="margin-top: 8px; font-size: 13px; color: #6b7280;"></div>
                    </div>

                    <!-- Управление -->
                    <div style="background: #fffbeb; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">🔒 Управление</h3>
                        <input id="blockCardNum" placeholder="Номер карты" class="input-modern" style="margin-bottom: 8px;">
                        <div style="display: flex; gap: 8px;">
                            <button id="blockBtn" style="flex: 1; background: #f59e0b; color: white; border: none; padding: 10px; border-radius: 12px; font-weight: 700; cursor: pointer;">🚫 Блок</button>
                            <button id="approveBtn" style="flex: 1; background: #10b981; color: white; border: none; padding: 10px; border-radius: 12px; font-weight: 700; cursor: pointer;">✅ Одобрить</button>
                        </div>
                        <div id="blockMsg" style="margin-top: 8px; font-size: 13px; color: #6b7280;"></div>
                    </div>

                    <!-- Бизнес -->
                    <div style="background: #ecfeff; padding: 16px; border-radius: 16px;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">🏢 Бизнес</h3>
                        <input id="bizLogin" placeholder="Логин" class="input-modern" style="margin-bottom: 8px;">
                        <input id="bizPass" placeholder="Пароль" class="input-modern" style="margin-bottom: 8px;">
                        <input id="bizName" placeholder="Название" class="input-modern" style="margin-bottom: 8px;">
                        <button id="addBizBtn" class="btn-primary" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">Создать</button>
                        <div id="bizMsg" style="margin-top: 8px; font-size: 13px; color: #6b7280;"></div>
                    </div>
                </div>

                <!-- Список карт -->
                <div style="margin-top: 24px; border-top: 2px solid #f3f4f6; padding-top: 20px;">
                    <h3 style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">📋 Все карты</h3>
                    <div id="cardList" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                        ${db.cards.map(c => `
                            <div style="background: #f9fafb; padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span class="card-number" style="font-size: 14px;">${c.number}</span>
                                    <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${c.owner}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-weight: 700;">${c.balance}₽</span>
                                    <span class="status-dot ${c.status}"></span>
                                    <span style="font-size: 12px; background: #f3f4f6; padding: 2px 10px; border-radius: 12px;">⭐ ${(c.creditRating || 0).toFixed(1)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('addCardBtn').onclick = () => {
            const num = document.getElementById('newCardNum').value.trim();
            const owner = document.getElementById('newCardOwner').value.trim();
            if (db.addCard(num, owner)) {
                document.getElementById('cardMsg').textContent = '✅ Карта добавлена';
                this.render(container);
            } else {
                document.getElementById('cardMsg').textContent = '❌ Ошибка: дубликат';
            }
        };

        document.getElementById('addBalBtn').onclick = () => {
            const num = document.getElementById('cardNumBal').value.trim();
            const amt = Number(document.getElementById('amountBal').value);
            if (db.addBalance(num, amt)) {
                document.getElementById('balMsg').textContent = '✅ Баланс увеличен';
                this.render(container);
            } else {
                document.getElementById('balMsg').textContent = '❌ Карта не найдена или не активна';
            }
        };

        document.getElementById('subBalBtn').onclick = () => {
            const num = document.getElementById('cardNumBal').value.trim();
            const amt = Number(document.getElementById('amountBal').value);
            if (db.deductBalance(num, amt)) {
                document.getElementById('balMsg').textContent = '✅ Баланс уменьшен';
                this.render(container);
            } else {
                document.getElementById('balMsg').textContent = '❌ Недостаточно средств';
            }
        };

        document.getElementById('blockBtn').onclick = () => {
            const num = document.getElementById('blockCardNum').value.trim();
            if (db.blockCard(num)) {
                document.getElementById('blockMsg').textContent = '🔄 Статус изменён';
                this.render(container);
            } else {
                document.getElementById('blockMsg').textContent = '❌ Карта не найдена';
            }
        };

        document.getElementById('approveBtn').onclick = () => {
            const num = document.getElementById('blockCardNum').value.trim();
            if (db.approveCard(num)) {
                document.getElementById('blockMsg').textContent = '✅ Карта одобрена';
                this.render(container);
            } else {
                document.getElementById('blockMsg').textContent = '❌ Карта не найдена или уже активна';
            }
        };

        document.getElementById('giveCreditBtn').onclick = () => {
            const num = document.getElementById('creditCardNum').value.trim();
            const amt = Number(document.getElementById('creditAmount').value);
            const result = db.giveCredit(num, amt);
            document.getElementById('creditMsg').textContent = result.success ? '✅ ' + result.msg : '❌ ' + result.msg;
            if (result.success) this.render(container);
        };

        document.getElementById('addBizBtn').onclick = () => {
            const login = document.getElementById('bizLogin').value.trim();
            const pass = document.getElementById('bizPass').value.trim();
            const name = document.getElementById('bizName').value.trim();
            if (db.addBusiness(login, pass, name)) {
                document.getElementById('bizMsg').textContent = '✅ Бизнес создан';
                this.render(container);
            } else {
                document.getElementById('bizMsg').textContent = '❌ Логин занят';
            }
        };
    }
}

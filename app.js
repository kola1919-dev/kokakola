// app.js
import { DB } from './db.js';
import { AdminPanel } from './admin.js';
import { BusinessPanel } from './business.js';
import { UserPanel } from './user.js';

const app = document.getElementById('app');

// Глобальное состояние
window.KOKA = {
    db: new DB(),
    admin: new AdminPanel(),
    business: new BusinessPanel(),
    user: new UserPanel(),
    currentCard: null,
    currentBusiness: null,
};

// Главный экран входа
function renderLogin() {
    app.innerHTML = `
        <div class="glass slide-up login-container">
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 64px; margin-bottom: 8px;">🥤</div>
                <h1 style="color: white; font-size: 42px; font-weight: 900;">KOKAKOLA</h1>
                <p style="color: rgba(255,255,255,0.8); font-size: 18px; margin-top: 4px;">Premium Card System</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button onclick="handleAdminLogin()" class="btn-secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    🔐 Войти как АДМИН
                </button>
                <button onclick="handleBusinessLogin()" class="btn-secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    🏪 Войти как БИЗНЕС
                </button>
                <button onclick="handleUserLogin()" class="btn-secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    💳 Войти по карте
                </button>
                <button onclick="handleCreateCard()" class="btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #34d399, #059669);">
                    ✨ Создать карту
                </button>
            </div>

            <div id="loginError" style="color: #fca5a5; margin-top: 16px; text-align: center; font-size: 14px;"></div>
            <div id="loginSuccess" style="color: #6ee7b7; margin-top: 16px; text-align: center; font-size: 14px;"></div>
        </div>
    `;
}

// Обработчики входа
window.handleAdminLogin = () => {
    const pwd = prompt('Введите пароль админа:');
    if (pwd === 'admin1423') {
        window.KOKA.admin.render(app);
    } else {
        document.getElementById('loginError').textContent = '❌ Неверный пароль';
    }
};

window.handleBusinessLogin = () => {
    const login = prompt('Логин бизнеса:');
    const pwd = prompt('Пароль:');
    const biz = window.KOKA.db.businesses.find(b => b.login === login && b.password === pwd);
    if (biz) {
        window.KOKA.currentBusiness = biz;
        window.KOKA.business.render(app, biz);
    } else {
        document.getElementById('loginError').textContent = '❌ Неверные данные бизнеса';
    }
};

window.handleUserLogin = () => {
    const cardNum = prompt('Введите номер карты:');
    const card = window.KOKA.db.cards.find(c => c.number === cardNum);
    if (card) {
        if (card.blocked || card.status === 'blocked') {
            document.getElementById('loginError').textContent = '❌ Карта заблокирована';
            return;
        }
        if (card.status === 'pending') {
            document.getElementById('loginError').textContent = '⏳ Карта ожидает одобрения админа';
            return;
        }
        window.KOKA.currentCard = card;
        window.KOKA.user.render(app, card);
    } else {
        document.getElementById('loginError').textContent = '❌ Карта не найдена';
    }
};

window.handleCreateCard = () => {
    const owner = prompt('Введите имя владельца:');
    if (!owner) return;
    const number = 'KOKA-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const card = {
        number,
        owner,
        balance: 0,
        blocked: false,
        status: 'pending',
        creditLimit: 0,
        creditUsed: 0,
        creditRating: 0,
        transactions: [],
        lastTaxDate: '',
        createdAt: new Date().toISOString()
    };
    window.KOKA.db.cards.push(card);
    window.KOKA.db.save();
    document.getElementById('loginSuccess').innerHTML = `✅ Карта создана!<br>Номер: <strong>${number}</strong><br>Ожидайте одобрения админа`;
};

window.navigateToLogin = renderLogin;

// Запуск
renderLogin();

// Ежедневный налог (проверка каждую минуту для демонстрации)
setInterval(() => {
    const today = new Date().toDateString();
    window.KOKA.db.cards.forEach(c => {
        if (c.status === 'active' && c.lastTaxDate !== today) {
            c.balance = Math.max(0, c.balance - 35);
            c.lastTaxDate = today;
            c.transactions.push({
                amount: -35,
                desc: 'Обслуживание карты',
                date: new Date().toISOString()
            });
        }
    });
    window.KOKA.db.save();
}, 60000);

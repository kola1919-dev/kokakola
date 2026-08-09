// db.js
export class DB {
    constructor() {
        const saved = localStorage.getItem('kokakola_db');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = this.getDefaults();
        }
        this.cards = this.data.cards || [];
        this.businesses = this.data.businesses || [];
        this.transactions = this.data.transactions || [];
        this.credits = this.data.credits || [];
    }

    getDefaults() {
        return {
            cards: [{
                number: 'KOKA-1111-2222',
                balance: 1000,
                blocked: false,
                status: 'active',
                owner: 'Алексей',
                transactions: [],
                lastTaxDate: '',
                creditLimit: 5000,
                creditUsed: 0,
                creditRating: 4.5,
                createdAt: new Date().toISOString()
            }, {
                number: 'KOKA-3333-4444',
                balance: 500,
                blocked: false,
                status: 'active',
                owner: 'Мария',
                transactions: [],
                lastTaxDate: '',
                creditLimit: 3000,
                creditUsed: 0,
                creditRating: 3.8,
                createdAt: new Date().toISOString()
            }],
            businesses: [{
                id: 'b1',
                login: 'shop1',
                password: 'pass1',
                name: 'Магазин у дома',
                todayEarn: 0,
                blockedCards: [],
                fines: [],
                rating: 5
            }],
            transactions: [],
            credits: []
        };
    }

    save() {
        this.data.cards = this.cards;
        this.data.businesses = this.businesses;
        this.data.transactions = this.transactions;
        this.data.credits = this.credits;
        localStorage.setItem('kokakola_db', JSON.stringify(this.data));
    }

    findCard(number) {
        return this.cards.find(c => c.number === number);
    }

    addCard(number, owner) {
        if (this.findCard(number)) return false;
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
        this.cards.push(card);
        this.save();
        return true;
    }

    blockCard(number) {
        const card = this.findCard(number);
        if (card) {
            card.blocked = !card.blocked;
            card.status = card.blocked ? 'blocked' : 'active';
            this.save();
            return true;
        }
        return false;
    }

    approveCard(number) {
        const card = this.findCard(number);
        if (card && card.status === 'pending') {
            card.status = 'active';
            card.blocked = false;
            card.creditLimit = 1000;
            this.save();
            return true;
        }
        return false;
    }

    addBalance(number, amount) {
        const card = this.findCard(number);
        if (card && card.status === 'active') {
            card.balance += amount;
            this.save();
            return true;
        }
        return false;
    }

    deductBalance(number, amount) {
        const card = this.findCard(number);
        if (card && card.status === 'active' && card.balance >= amount) {
            card.balance -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addBusiness(login, password, name) {
        if (this.businesses.find(b => b.login === login)) return false;
        this.businesses.push({
            id: 'b' + Date.now(),
            login,
            password,
            name,
            todayEarn: 0,
            blockedCards: [],
            fines: [],
            rating: 5
        });
        this.save();
        return true;
    }

    giveCredit(cardNumber, amount) {
        const card = this.findCard(cardNumber);
        if (!card || card.status !== 'active') {
            return { success: false, msg: 'Карта не активна' };
        }
        const newTotal = (card.creditUsed || 0) + amount;
        if (newTotal > (card.creditLimit || 0)) {
            return { success: false, msg: 'Превышен кредитный лимит' };
        }

        card.creditUsed = newTotal;
        card.balance += amount;
        card.transactions.push({
            amount: amount,
            desc: `Кредит ${amount}₽`,
            date: new Date().toISOString()
        });

        this.credits.push({
            cardNumber,
            amount,
            date: new Date().toISOString(),
            repaid: false
        });

        this.save();
        return { success: true, msg: `Кредит ${amount}₽ выдан` };
    }

    repayCredit(cardNumber, amount) {
        const card = this.findCard(cardNumber);
        if (!card) return { success: false, msg: 'Карта не найдена' };
        if (card.balance < amount) return { success: false, msg: 'Недостаточно средств' };
        if ((card.creditUsed || 0) < amount) return { success: false, msg: 'Сумма превышает долг' };

        card.creditUsed -= amount;
        card.balance -= amount;
        card.transactions.push({
            amount: -amount,
            desc: `Погашение кредита ${amount}₽`,
            date: new Date().toISOString()
        });

        // Обновляем статус кредита
        const credits = this.credits.filter(c => c.cardNumber === cardNumber && !c.repaid);
        let remaining = amount;
        for (const credit of credits) {
            if (remaining <= 0) break;
            if (credit.amount <= remaining) {
                credit.repaid = true;
                remaining -= credit.amount;
            } else {
                credit.amount -= remaining;
                remaining = 0;
            }
        }

        this.updateCreditRating(cardNumber);
        this.save();
        return { success: true, msg: `Кредит погашен на ${amount}₽` };
    }

    updateCreditRating(cardNumber) {
        const card = this.findCard(cardNumber);
        if (!card) return;
        const totalCredits = this.credits.filter(c => c.cardNumber === cardNumber);
        if (totalCredits.length === 0) {
            card.creditRating = 0;
        } else {
            const repaid = totalCredits.filter(c => c.repaid).length;
            card.creditRating = Math.min(5, (repaid / totalCredits.length) * 5);
        }
        this.save();
    }
}

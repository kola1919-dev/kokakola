usePaymentCode(code, amount, bizId) {
    const paymentCode = this.paymentCodes.find(p => p.code === code && !p.used);
    if (!paymentCode) return { success: false, msg: 'Код не найден или уже использован' };
    
    if (new Date(paymentCode.expiresAt) < new Date()) {
        return { success: false, msg: 'Код истек' };
    }

    const card = this.findCard(paymentCode.cardNumber);
    if (!card) return { success: false, msg: 'Карта не найдена' };
    if (card.status !== 'active') return { success: false, msg: 'Карта не активна' };
    if (card.balance < amount) return { success: false, msg: 'Недостаточно средств' };

    const biz = this.businesses.find(b => b.id === bizId);
    if (!biz) return { success: false, msg: 'Бизнес не найден' };

    // Проверка блокировки карты для этого бизнеса
    if (biz.blockedCards?.includes(paymentCode.cardNumber)) {
        return { success: false, msg: 'Карта запрещена для этого магазина' };
    }

    // Списание
    card.balance -= amount;
    biz.todayEarn = (biz.todayEarn || 0) + amount;
    
    if (!biz.transactions) biz.transactions = [];
    const transaction = {
        id: Date.now() + Math.random().toString(36).substring(2, 6),
        cardNumber: paymentCode.cardNumber,
        amount: amount,
        desc: `Оплата по коду ${code}`,
        date: new Date().toISOString(),
        refunded: false,
        code: code
    };
    biz.transactions.push(transaction);
    
    if (!card.transactions) card.transactions = [];
    card.transactions.push({
        amount: -amount,
        desc: `Оплата в ${biz.name} (код ${code})`,
        date: new Date().toISOString()
    });

    paymentCode.used = true;
    paymentCode.amount = amount;
    paymentCode.bizId = bizId;

    this.transactions.push({
        bizId: bizId,
        cardNum: paymentCode.cardNumber,
        amount: amount,
        desc: `Оплата по коду ${code} в ${biz.name}`,
        date: new Date().toISOString()
    });

    this.save();
    return { success: true, msg: `Оплата ${amount}₽ по коду ${code}`, cardNumber: paymentCode.cardNumber };
}
/* ========= Data layer (পরে এই অংশ API কল দিয়ে বদলাবে) ========= */
const Store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  users()        { return this.get('users', []); },
  saveUsers(u)   { this.set('users', u); },
  session()      { return this.get('session', null); },
  setSession(id) { this.set('session', id); },
  txs(uid)       { return this.get('tx_' + uid, []); },
  saveTxs(uid, t){ this.set('tx_' + uid, t); }
};

const Auth = {
  register(name, email, password) {
    const users = Store.users();
    if (users.some(u => u.email === email)) return 'এই ইমেইল দিয়ে আগেই একাউন্ট আছে';
    if (password.length < 6) return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
    const user = { id: Date.now().toString(), name, email, password };
    users.push(user);
    Store.saveUsers(users);
    Store.setSession(user.id);
    return null;
  },
  login(email, password) {
    const user = Store.users().find(u => u.email === email && u.password === password);
    if (!user) return 'ইমেইল বা পাসওয়ার্ড ভুল';
    Store.setSession(user.id);
    return null;
  },
  logout() { Store.setSession(null); location.href = 'login.html'; },
  current() {
    const id = Store.session();
    return Store.users().find(u => u.id === id) || null;
  },
  require() {
    const u = this.current();
    if (!u) location.href = 'login.html';
    return u;
  }
};

/* ========= হিসাব ========= */
function addTx(uid, type, amount, note) {
  const list = Store.txs(uid);
  list.unshift({ id: Date.now(), type, amount: Number(amount), note, date: new Date().toISOString() });
  Store.saveTxs(uid, list);
}

function getStats(uid) {
  const list = Store.txs(uid);
  const now = new Date();
  let income = 0, expense = 0, monthExpense = 0;
  for (const t of list) {
    if (t.type === 'income') income += t.amount;
    else {
      expense += t.amount;
      const d = new Date(t.date);
      // শুধু বর্তমান মাসের খরচ — মাস বদলালে নিজে থেকেই রিসেট
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthExpense += t.amount;
    }
  }
  return { income, expense, balance: income - expense, monthExpense };
}

const fmt = n => '৳' + Number(n).toLocaleString('bn-BD');
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = id => document.getElementById(id);

/* ========= পেইজ লজিক ========= */
const pages = {
  login() {
    if (Auth.current()) return (location.href = 'index.html');
    $('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const err = Auth.login($('email').value.trim(), $('password').value);
      if (err) $('error').textContent = err;
      else location.href = 'index.html';
    });
  },

  register() {
    if (Auth.current()) return (location.href = 'index.html');
    $('registerForm').addEventListener('submit', e => {
      e.preventDefault();
      const err = Auth.register($('name').value.trim(), $('email').value.trim(), $('password').value);
      if (err) $('error').textContent = err;
      else location.href = 'index.html';
    });
  },

  home() {
    const user = Auth.require();
    if (!user) return;
    let type = 'expense';

    const render = () => {
      const s = getStats(user.id);
      $('balance').textContent = fmt(s.balance);
      $('monthExpense').textContent = fmt(s.monthExpense);
      $('monthName').textContent = new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' });

      const list = Store.txs(user.id).slice(0, 15);
      $('txList').innerHTML = list.length
        ? list.map(t => `
          <li>
            <div>${esc(t.note || (t.type === 'income' ? 'ইনকাম' : 'খরচ'))}
              <small>${new Date(t.date).toLocaleString('bn-BD')}</small></div>
            <span class="${t.type === 'income' ? 'inc' : 'exp'}">
              ${t.type === 'income' ? '+' : '−'}${fmt(t.amount)}</span>
          </li>`).join('')
        : '<li class="empty">এখনো কোনো লেনদেন নেই</li>';
    };

    const closeModal = () => {
      $('modal').classList.add('hidden');
      $('amount').value = ''; $('note').value = ''; $('modalError').textContent = '';
    };

    $('openModal').onclick = () => $('modal').classList.remove('hidden');
    $('cancelBtn').onclick = closeModal;

    document.querySelectorAll('.toggle button').forEach(b => {
      b.onclick = () => {
        type = b.dataset.type;
        document.querySelectorAll('.toggle button').forEach(x => x.classList.toggle('active', x === b));
      };
    });

    $('saveBtn').onclick = () => {
      const amount = Number($('amount').value);
      if (!amount || amount <= 0) { $('modalError').textContent = 'সঠিক এমাউন্ট দিন'; return; }
      addTx(user.id, type, amount, $('note').value.trim());
      closeModal();
      render();
    };

    render();
  },

  profile() {
    const user = Auth.require();
    if (!user) return;
    const s = getStats(user.id);
    $('pName').textContent = user.name;
    $('pEmail').textContent = user.email;
    $('totalIncome').textContent = fmt(s.income);
    $('totalExpense').textContent = fmt(s.expense);
    $('logoutBtn').onclick = () => Auth.logout();
  }
};

pages[document.body.dataset.page]?.();


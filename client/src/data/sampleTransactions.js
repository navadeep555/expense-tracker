// Realistic sample data (May - Oct 2026) shown until a backend is connected.
// The same generator exists in server/src/seed/seed.js so both sides look identical.

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
const LAST_DAY_OF_DATA = '2026-10-15';

export function generateSampleTransactions() {
  const rows = [];
  MONTHS.forEach((month, idx) => {
    const rnd = mulberry32(1000 + idx * 77);
    const between = (a, b) => Math.round((a + rnd() * (b - a)) / 10) * 10;
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const add = (day, type, category, amount, paymentMethod, note) => {
      const date = `${month}-${pad(day)}`;
      if (date <= LAST_DAY_OF_DATA) rows.push({ date, type, category, amount, paymentMethod, note });
    };

    add(1, 'income', 'Salary', 52000, 'Bank Transfer', 'Monthly salary');
    add(12, 'income', 'Freelance', between(6000, 16000), 'UPI', pick(['Flutter app milestone', 'Video editing project', 'UI design gig']));
    if (idx % 2 === 1) add(20, 'income', 'Investments', between(900, 2500), 'Bank Transfer', 'Mutual fund dividend');

    add(3, 'expense', 'Rent & Housing', 14000, 'UPI', 'Monthly rent');
    add(7, 'expense', 'Bills & Utilities', between(1600, 2600), 'UPI', 'Electricity bill');
    add(9, 'expense', 'Bills & Utilities', 999, 'Debit Card', 'Broadband plan');
    add(11, 'expense', 'Bills & Utilities', 399, 'UPI', 'Mobile recharge');

    const foodNotes = ['Lunch with friends', 'Groceries', 'Swiggy order', 'Cafe coffee', 'Dinner out', 'Weekly vegetables', 'Zomato order', 'Breakfast'];
    [2, 5, 8, 10, 13, 17, 21, 25].forEach((d) =>
      add(d, 'expense', 'Food & Dining', between(150, 950), pick(['UPI', 'Cash', 'Credit Card']), pick(foodNotes))
    );

    const trNotes = ['Metro card top-up', 'Cab to station', 'Fuel', 'Auto ride'];
    [4, 9, 15, 22].forEach((d) => add(d, 'expense', 'Transport', between(80, 650), pick(['UPI', 'Cash']), pick(trNotes)));

    add(6, 'expense', 'Shopping', between(900, 4500), 'Credit Card', pick(['Clothes', 'Headphones', 'Shoes', 'Online order']));
    add(19, 'expense', 'Shopping', between(500, 2500), 'Credit Card', pick(['Home essentials', 'Books', 'Gift']));
    add(14, 'expense', 'Entertainment', between(199, 1200), 'Credit Card', pick(['Movie tickets', 'OTT subscription', 'Concert pass']));
    add(24, 'expense', 'Entertainment', between(199, 800), 'UPI', pick(['Gaming credits', 'Music subscription']));
    add(16, 'expense', 'Health', between(400, 1500), 'UPI', pick(['Pharmacy', 'Doctor visit', 'Gym membership']));
    add(18, 'expense', 'Education', between(1500, 3200), 'Debit Card', pick(['Online course', 'Study material', 'Certification fee']));
    if ([1, 3].includes(idx)) add(27, 'expense', 'Travel', between(3500, 8000), 'Credit Card', 'Weekend trip');
  });

  return rows
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((r, i) => ({ ...r, id: `demo-${i + 1}` }));
}

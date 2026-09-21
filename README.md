# 💰 Income & Expense Tracker

A clean and responsive **Income & Expense Tracker** built with **Vue 3**.
This project helps users track their income, expenses, categories, and current balance through a simple and modern dashboard.

## ✨ Features

* 📊 Total balance calculation
* 💵 Total income tracking
* 💸 Total expense tracking
* ➕ Add income and expense transactions
* 🗂️ Separate categories for income and expenses
* 🔄 Dynamic category selection based on transaction type
* 💰 Automatic balance calculation
* 📋 Recent transaction list
* 🎨 Modern dark-themed responsive UI
* 📱 Mobile-friendly design
* ✅ Basic form validation
* 🔢 Automatic amount formatting with Bangladeshi Taka (৳)

## 🛠️ Technologies Used

* **Vue 3**
* **JavaScript**
* **HTML5**
* **CSS3**
* **Vue Composition API**
* `ref()`
* `computed()`
* `v-model`
* `v-for`
* Conditional rendering

## 📂 Project Structure

```text
src/
├── App.vue
├── main.js
└── assets/
```

The main application logic and UI are currently implemented in:

```text
src/App.vue
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/forid1026/income-expense-tracker
```

### 2. Go to the project directory

```bash
cd expense-tracker
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will then be available through the local development URL shown in your terminal.

## 🧮 How It Works

The application stores transactions in a reactive Vue array.

Each transaction contains:

```js
{
  id: 123456789,
  title: "Monthly Salary",
  category: "Salary",
  amount: 40000,
  type: "income"
}
```

Income and expense totals are calculated using Vue's `computed()`:

```js
const totalIncome = computed(() => {
  return transactions.value
    .filter(transaction => transaction.type === 'income')
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );
});
```

The balance is calculated as:

```text
Balance = Total Income - Total Expenses
```

## 📌 Current Categories

### Income

* Salary
* Freelance
* Business
* Investment
* Bonus
* Gift
* Other

### Expense

* Groceries
* Utilities
* Entertainment
* Restaurants
* Travel
* Clothing
* Healthcare
* Personal
* Education
* Other

## 🔮 Future Improvements

The project is currently being developed further. Planned features include:

* ✏️ Edit transactions
* 🗑️ Delete transactions
* 💾 LocalStorage persistence
* 🔍 Search transactions
* 🔽 Filter by type
* 🗂️ Filter by category
* 📅 Date-based transactions
* 📈 Expense charts and statistics
* 📊 Monthly financial reports
* 🌙 Dark/Light mode
* 📱 Improved mobile experience

## 🎯 Learning Purpose

This project was created as a practical **Vue 3 learning project** to practice:

* Reactive state management with `ref()`
* Derived state with `computed()`
* Form handling with `v-model`
* Event handling
* List rendering
* Conditional rendering
* Component UI structure
* Basic application logic

## 📸 Preview

*Add your project screenshot or demo GIF here.*

```md
![Expense Tracker Preview](./screenshots/expense-tracker.png)
```

## 👨‍💻 Author

**Sheikh Farid**

Software Developer | Laravel | PHP | Vue.js

---

⭐ If you find this project useful, feel free to give the repository a star.

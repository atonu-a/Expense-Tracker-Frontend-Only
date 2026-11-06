# 💰 Expense Tracker

A simple income and expense tracker (frontend only) built with HTML, CSS, and JavaScript. Data is saved in the browser's `localStorage`, so it persists across page refreshes.

## Features

- Register, login, and logout
- **Balance** on the home page (lifetime income − lifetime expense)
- **This month's expense** on the home page, which automatically starts from zero when a new month begins
- Click the "Add" button, choose **Expense / Income**, then enter an amount and an optional note
- Recent transactions list
- **Total income** and **total expense** (lifetime) on the profile page
- Visiting Home or Profile without logging in redirects to the login page
- Mobile-friendly design

## File Structure

```
├── index.html      # Home page
├── login.html      # Login page
├── register.html   # Register page
├── profile.html    # Profile page
├── style.css       # Styles for all pages
└── app.js          # Logic for all pages
```

## How to Run

1. Put all files in the same folder.
2. Open `register.html` in a browser (double-click it, or use VS Code's Live Server).
3. Create an account, then add expenses and income from the home page.

No installation or dependencies required.

## How It Works

| Item | Calculation |
|---|---|
| Balance | Total income − total expense (never resets) |
| This month's expense | Sum of expenses in the current month and year only |
| Profile total income / expense | Sum of all entries from the beginning until now |

## Structure of `app.js`

- **`Store`**: reads and writes data in `localStorage`
- **`Auth`**: register, login, logout, and session checks
- **`addTx` / `getStats`**: adds transactions and calculates totals
- **`pages`**: separate logic for each page (the right one runs based on `<body data-page="...">`)

## Limitations

- Data lives only in that browser on that device and is lost if browser data is cleared.
- Passwords are stored as plain text, so this is for demo and learning purposes only and is not safe for real use.
- There is no edit or delete option yet.

## Future Ideas

- Edit and delete transactions
- Categories (food, transport, bills, etc.)
- Monthly reports and charts
- Dark mode
- Backend integration: replace the `Store` section in `app.js` with API calls and add a database

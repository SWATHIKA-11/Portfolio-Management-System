# Project Report: Portfolio Management Tool

## 1. Abstract

The Portfolio Management Tool is a browser-based application that helps an individual investor record their holdings, measure profit or loss, and see how their money is distributed across asset types. It is built with HTML, CSS and JavaScript and stores data locally in the browser, so it needs no server or database.

## 2. Problem Statement

Many beginner investors keep their holdings in scattered notes or spreadsheets. Calculating profit, loss and allocation by hand is slow and error-prone. A small, easy tool that does these calculations instantly and shows a visual summary solves this.

## 3. Objectives

- Let the user add, edit and delete investments
- Calculate invested amount, current value, profit/loss and return % automatically
- Show portfolio allocation visually
- Keep data persistent between visits without a backend
- Provide search, filter and CSV export

## 4. Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and form |
| CSS3 | Layout, theme, responsive design |
| JavaScript (ES6) | Logic, DOM updates, validation |
| Canvas API | Allocation donut chart |
| localStorage | Saving data in the browser |

## 5. System Design

### 5.1 Modules

1. **Input module**: form with validation for name, type, quantity, buy price and current price.
2. **Calculation module**: computes invested, value, P/L and return for each asset and for the whole portfolio.
3. **Storage module**: reads and writes the holdings array to `localStorage`.
4. **Display module**: renders summary cards, holdings table and the allocation chart.
5. **Utility module**: search, filter and CSV export.

### 5.2 Data Model

Each holding is stored as an object:

```json
{
  "id": "unique-id",
  "name": "Reliance Industries",
  "type": "Stock",
  "quantity": 10,
  "buyPrice": 2400,
  "currentPrice": 2650
}
```

### 5.3 Flow

User fills form → input is validated → holding is saved to the array and `localStorage` → summary, table and chart are re-rendered.

## 6. Formulas

- Invested = Quantity × Buy price
- Current value = Quantity × Current price
- Profit/Loss = Current value − Invested
- Return % = (Profit/Loss ÷ Invested) × 100

## 7. Testing

| Test case | Expected result |
|-----------|-----------------|
| Add valid investment | Appears in table, totals update |
| Submit empty name | Error message shown |
| Quantity set to 0 or negative | Error message shown |
| Edit a holding | Values update everywhere |
| Delete a holding | Row removed after confirmation |
| Reload the page | Data is still present |
| Search and filter | Table shows only matching rows |
| Export CSV | File downloads with all holdings |

## 8. Limitations

- Prices are entered manually; no live market data
- Data is tied to one browser on one device
- Single portfolio only

## 9. Future Scope

- Live prices through a market API
- Multiple portfolios and user login
- Historical performance chart
- CSV import

## 10. Conclusion

The tool meets its goal of giving a quick, clear view of a personal investment portfolio with no setup. It also demonstrates core front-end skills: DOM manipulation, form validation, persistent storage and Canvas drawing.
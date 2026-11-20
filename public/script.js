"use strict";

// ---------- State & storage ----------
const STORAGE_KEY = "portfolio_management_tool_v1";
let assets = loadAssets();

function loadAssets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveAssets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (e) {
    // Storage may be unavailable (private mode); the app still works in memory.
  }
}

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COLORS = ["#3b5bdb", "#1a9e5c", "#f59f00", "#d6336c", "#0ca5b0", "#7048e8", "#868e96"];

function calc(a) {
  const invested = a.quantity * a.buyPrice;
  const value = a.quantity * a.currentPrice;
  const pl = value - invested;
  const ret = invested > 0 ? (pl / invested) * 100 : 0;
  return { invested, value, pl, ret };
}

function plClass(n) {
  return n > 0 ? "gain" : n < 0 ? "loss" : "";
}

function signed(n) {
  return (n > 0 ? "+" : "") + money.format(n);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Rendering ----------
function getVisibleAssets() {
  const q = $("search").value.trim().toLowerCase();
  const type = $("filterType").value;
  return assets.filter(
    (a) => (type === "All" || a.type === type) && a.name.toLowerCase().includes(q)
  );
}

function renderSummary() {
  let invested = 0;
  let value = 0;
  assets.forEach((a) => {
    const c = calc(a);
    invested += c.invested;
    value += c.value;
  });
  const pl = value - invested;
  const ret = invested > 0 ? (pl / invested) * 100 : 0;

  $("totalInvested").textContent = money.format(invested);
  $("currentValue").textContent = money.format(value);

  const plEl = $("profitLoss");
  plEl.textContent = signed(pl);
  plEl.className = "card-value " + plClass(pl);

  const retEl = $("returnPct");
  retEl.textContent = (ret > 0 ? "+" : "") + ret.toFixed(2) + "%";
  retEl.className = "card-value " + plClass(ret);
}

function renderTable() {
  const body = $("tableBody");
  const list = getVisibleAssets();
  body.innerHTML = "";

  list.forEach((a) => {
    const c = calc(a);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(a.name)}</td>
      <td>${escapeHtml(a.type)}</td>
      <td class="num">${a.quantity}</td>
      <td class="num">${money.format(a.buyPrice)}</td>
      <td class="num">${money.format(a.currentPrice)}</td>
      <td class="num">${money.format(c.invested)}</td>
      <td class="num">${money.format(c.value)}</td>
      <td class="num ${plClass(c.pl)}">${signed(c.pl)}</td>
      <td class="num ${plClass(c.ret)}">${(c.ret > 0 ? "+" : "") + c.ret.toFixed(2)}%</td>
      <td>
        <button class="btn small" data-action="edit" data-id="${a.id}">Edit</button>
        <button class="btn small danger" data-action="delete" data-id="${a.id}">Delete</button>
      </td>`;
    body.appendChild(tr);
  });

  const empty = $("tableEmpty");
  if (assets.length === 0) {
    empty.textContent = "No holdings yet. Add your first investment using the form.";
    empty.hidden = false;
  } else if (list.length === 0) {
    empty.textContent = "No holdings match your search or filter.";
    empty.hidden = false;
  } else {
    empty.hidden = true;
  }
}

function renderChart() {
  const canvas = $("allocationChart");
  const ctx = canvas.getContext("2d");
  const legend = $("legend");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  legend.innerHTML = "";

  // Sum current value by asset type
  const totals = {};
  assets.forEach((a) => {
    totals[a.type] = (totals[a.type] || 0) + calc(a).value;
  });
  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  const sum = entries.reduce((s, [, v]) => s + v, 0);

  $("chartEmpty").hidden = entries.length > 0;
  canvas.hidden = entries.length === 0;
  if (entries.length === 0) return;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 8;
  let start = -Math.PI / 2;

  entries.forEach(([type, v], i) => {
    const angle = (v / sum) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    start += angle;

    const li = document.createElement("li");
    li.innerHTML = `<span class="dot" style="background:${COLORS[i % COLORS.length]}"></span>${escapeHtml(type)} · ${((v / sum) * 100).toFixed(1)}%`;
    legend.appendChild(li);
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function renderAll() {
  renderSummary();
  renderTable();
  renderChart();
}

// ---------- Form handling ----------
function resetForm() {
  $("assetForm").reset();
  $("assetId").value = "";
  $("formTitle").textContent = "Add Investment";
  $("saveBtn").textContent = "Add Investment";
  $("cancelBtn").hidden = true;
  $("formError").textContent = "";
}

function readForm() {
  return {
    name: $("name").value.trim(),
    type: $("type").value,
    quantity: parseFloat($("quantity").value),
    buyPrice: parseFloat($("buyPrice").value),
    currentPrice: parseFloat($("currentPrice").value),
  };
}

function validate(data) {
  if (!data.name) return "Please enter an asset name.";
  if (!isFinite(data.quantity) || data.quantity <= 0) return "Quantity must be greater than 0.";
  if (!isFinite(data.buyPrice) || data.buyPrice < 0) return "Buy price must be 0 or more.";
  if (!isFinite(data.currentPrice) || data.currentPrice < 0) return "Current price must be 0 or more.";
  return "";
}

$("assetForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = readForm();
  const err = validate(data);
  $("formError").textContent = err;
  if (err) return;

  const id = $("assetId").value;
  if (id) {
    const idx = assets.findIndex((a) => a.id === id);
    if (idx !== -1) assets[idx] = { id, ...data };
  } else {
    assets.push({ id: String(Date.now()) + Math.random().toString(16).slice(2, 6), ...data });
  }

  saveAssets();
  resetForm();
  renderAll();
});

$("cancelBtn").addEventListener("click", resetForm);

// ---------- Table actions ----------
$("tableBody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const asset = assets.find((a) => a.id === id);
  if (!asset) return;

  if (btn.dataset.action === "delete") {
    if (confirm(`Delete "${asset.name}" from your portfolio?`)) {
      assets = assets.filter((a) => a.id !== id);
      if ($("assetId").value === id) resetForm();
      saveAssets();
      renderAll();
    }
  } else if (btn.dataset.action === "edit") {
    $("assetId").value = asset.id;
    $("name").value = asset.name;
    $("type").value = asset.type;
    $("quantity").value = asset.quantity;
    $("buyPrice").value = asset.buyPrice;
    $("currentPrice").value = asset.currentPrice;
    $("formTitle").textContent = "Edit Investment";
    $("saveBtn").textContent = "Save changes";
    $("cancelBtn").hidden = false;
    $("formError").textContent = "";
    $("name").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ---------- Search / filter ----------
$("search").addEventListener("input", renderTable);
$("filterType").addEventListener("change", renderTable);

// ---------- Clear all ----------
$("clearBtn").addEventListener("click", () => {
  if (assets.length === 0) return;
  if (confirm("This will delete ALL holdings. Continue?")) {
    assets = [];
    saveAssets();
    resetForm();
    renderAll();
  }
});

// ---------- Export CSV ----------
$("exportBtn").addEventListener("click", () => {
  if (assets.length === 0) {
    alert("Nothing to export yet.");
    return;
  }
  const header = ["Name", "Type", "Quantity", "Buy Price", "Current Price", "Invested", "Value", "Profit/Loss", "Return %"];
  const rows = assets.map((a) => {
    const c = calc(a);
    return [a.name, a.type, a.quantity, a.buyPrice, a.currentPrice, c.invested.toFixed(2), c.value.toFixed(2), c.pl.toFixed(2), c.ret.toFixed(2)];
  });
  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "portfolio.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

// ---------- Init ----------
renderAll();
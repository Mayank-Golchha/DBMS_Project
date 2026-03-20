// ============================================================
// FILE: public/script.js
// EstateIQ — Frontend logic
// ============================================================

const API = "/api";

// ── Tab navigation ──────────────────────────────────────────
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ── Utility: format INR ────────────────────────────────────
const inr = (n) => {
  const num = Number(n);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
};

// ── Utility: build a simple HTML table ─────────────────────
function buildTable(rows) {
  if (!rows || !rows.length) return "<p style='color:var(--muted)'>No results found.</p>";
  const keys = Object.keys(rows[0]);
  const ths  = keys.map((k) => `<th>${k.replace(/_/g, " ")}</th>`).join("");
  const trs  = rows.map((row) =>
    `<tr>${keys.map((k) => `<td>${row[k] ?? "—"}</td>`).join("")}</tr>`
  ).join("");
  return `<table class="data-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

// ── PROPERTIES tab ─────────────────────────────────────────
async function loadProperties(params = {}) {
  const grid = document.getElementById("property-grid");
  grid.innerHTML = '<div class="loading-shimmer"></div>';

  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ""))
  ).toString();

  try {
    const res  = await fetch(`${API}/properties?${qs}`);
    const json = await res.json();

    if (!json.success || !json.data.length) {
      grid.innerHTML = "<p style='color:var(--muted)'>No properties found.</p>";
      return;
    }

    grid.innerHTML = json.data.map((p) => `
      <div class="property-card" data-id="${p.property_id}">
        <div class="card-type">${p.property_type}</div>
        <div class="card-address">${p.address_line}</div>
        <div class="card-locality">📍 ${p.locality_name}, ${p.city}</div>
        <div class="card-stats">
          <div class="stat"><span class="label">Selling Price</span><span class="value">${inr(p.selling_price)}</span></div>
          <div class="stat"><span class="label">Monthly Rent</span><span class="value">${inr(p.monthly_rent)}/mo</span></div>
          <div class="stat"><span class="label">Bedrooms</span><span class="value">${p.num_bedrooms} BHK</span></div>
          <div class="stat"><span class="label">Size</span><span class="value">${p.size_sqft} sq ft</span></div>
          <div class="stat"><span class="label">Built</span><span class="value">${p.year_constructed}</span></div>
          <div class="stat"><span class="label">Agent</span><span class="value">${p.listed_by_name}</span></div>
        </div>
        <span class="status-badge status-${p.status}">${p.status}</span>
      </div>
    `).join("");

    // Card click → modal
    document.querySelectorAll(".property-card").forEach((card) => {
      card.addEventListener("click", () => openPropertyModal(card.dataset.id));
    });
  } catch (e) {
    grid.innerHTML = `<p style="color:var(--rust)">Error: ${e.message}</p>`;
  }
}

// Filters
document.getElementById("apply-filters").addEventListener("click", () => {
  loadProperties({
    status:   document.getElementById("filter-status").value,
    type:     document.getElementById("filter-type").value,
    bedrooms: document.getElementById("filter-bedrooms").value,
  });
});
document.getElementById("clear-filters").addEventListener("click", () => {
  document.getElementById("filter-status").value   = "";
  document.getElementById("filter-type").value     = "";
  document.getElementById("filter-bedrooms").value = "";
  loadProperties();
});

// ── Property Modal ─────────────────────────────────────────
async function openPropertyModal(id) {
  try {
    const res  = await fetch(`${API}/properties/${id}`);
    const json = await res.json();
    const p    = json.data;
    document.getElementById("modal-content").innerHTML = `
      <h2 style="font-family:'Playfair Display',serif;margin-bottom:.25rem">${p.address_line}</h2>
      <p style="color:var(--muted);margin-bottom:1.5rem">📍 ${p.locality_name}, ${p.city} — ${p.pincode}</p>
      <div class="card-stats" style="grid-template-columns:1fr 1fr;gap:.8rem">
        <div class="stat"><span class="label">Type</span><span class="value">${p.property_type}</span></div>
        <div class="stat"><span class="label">Status</span><span class="value">${p.status}</span></div>
        <div class="stat"><span class="label">Selling Price</span><span class="value">${inr(p.selling_price)}</span></div>
        <div class="stat"><span class="label">Monthly Rent</span><span class="value">${inr(p.monthly_rent)}/mo</span></div>
        <div class="stat"><span class="label">Size</span><span class="value">${p.size_sqft} sq ft</span></div>
        <div class="stat"><span class="label">Bedrooms</span><span class="value">${p.num_bedrooms} BHK</span></div>
        <div class="stat"><span class="label">Year Built</span><span class="value">${p.year_constructed}</span></div>
        <div class="stat"><span class="label">Listed On</span><span class="value">${p.listing_date?.slice(0,10)}</span></div>
        <div class="stat"><span class="label">Listing Agent</span><span class="value">${p.listed_by_name}</span></div>
        <div class="stat"><span class="label">Agent Contact</span><span class="value">${p.agent_phone}</span></div>
      </div>
    `;
    document.getElementById("property-modal").classList.remove("hidden");
  } catch (e) {
    console.error(e);
  }
}
document.querySelector(".modal-close").addEventListener("click", () =>
  document.getElementById("property-modal").classList.add("hidden")
);
document.querySelector(".modal-backdrop").addEventListener("click", () =>
  document.getElementById("property-modal").classList.add("hidden")
);

// ── AGENTS tab ─────────────────────────────────────────────
async function loadAgents() {
  const grid = document.getElementById("agent-grid");
  grid.innerHTML = '<div class="loading-shimmer"></div>';
  try {
    const res  = await fetch(`${API}/agents`);
    const json = await res.json();
    grid.innerHTML = json.data.map((a) => `
      <div class="agent-card">
        <div class="agent-name">${a.first_name} ${a.last_name}</div>
        <div class="agent-meta">${a.email} · ${a.phone}</div>
        <div class="agent-meta">License: ${a.license_no} · Since ${a.hire_date?.slice(0,10)}</div>
        <div class="agent-stats">
          <div class="agent-stat"><div class="as-num">${a.total_listings}</div><div class="as-lbl">Listings</div></div>
          <div class="agent-stat"><div class="as-num">${a.total_sales}</div><div class="as-lbl">Sales</div></div>
          <div class="agent-stat"><div class="as-num">${a.total_rentals}</div><div class="as-lbl">Rentals</div></div>
        </div>
      </div>
    `).join("");
  } catch (e) {
    grid.innerHTML = `<p style="color:var(--rust)">Error: ${e.message}</p>`;
  }
}

// ── ADD PROPERTY form ──────────────────────────────────────
async function loadLocalities() {
  try {
    const res  = await fetch(`${API}/reports/localities`);
    const json = await res.json();
    const sel  = document.getElementById("f-locality");
    sel.innerHTML = '<option value="">Select locality</option>' +
      json.data.map((l) => `<option value="${l.locality_id}">${l.locality_name}</option>`).join("");
  } catch (e) { console.error("Could not load localities", e); }
}

document.getElementById("submit-property").addEventListener("click", async () => {
  const msg = document.getElementById("form-msg");
  const body = {
    property_type:    document.getElementById("f-type").value,
    address_line:     document.getElementById("f-address").value.trim(),
    locality_id:      document.getElementById("f-locality").value,
    selling_price:    document.getElementById("f-price").value,
    monthly_rent:     document.getElementById("f-rent").value,
    size_sqft:        document.getElementById("f-size").value,
    num_bedrooms:     document.getElementById("f-beds").value,
    year_constructed: document.getElementById("f-year").value,
    listing_date:     document.getElementById("f-listing-date").value,
    status:           document.getElementById("f-status").value,
    listed_by_agent:  document.getElementById("f-agent").value,
  };

  // Client-side validation
  const missing = Object.entries(body).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    msg.textContent = `Please fill in: ${missing.join(", ")}`;
    msg.className = "form-message error";
    msg.classList.remove("hidden");
    return;
  }

  try {
    const res  = await fetch(`${API}/properties`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) {
      msg.textContent = `✅ Property #${json.property_id} listed successfully!`;
      msg.className = "form-message success";
    } else {
      msg.textContent = `❌ ${json.error}`;
      msg.className = "form-message error";
    }
    msg.classList.remove("hidden");
  } catch (e) {
    msg.textContent = `❌ ${e.message}`;
    msg.className = "form-message error";
    msg.classList.remove("hidden");
  }
});

// ── REPORTS tab ─────────────────────────────────────────────
document.querySelectorAll(".btn-report").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const type       = btn.dataset.report;
    const resultDiv  = btn.closest(".report-card").querySelector(".report-result");
    btn.classList.add("loading");
    btn.textContent = "Running…";

    let url = `${API}/reports/${type}`;
    if (type === "price-range") {
      const min = document.getElementById("r2-min").value;
      const max = document.getElementById("r2-max").value;
      url += `?min=${min}&max=${max}`;
    } else if (type === "rent-filter") {
      const locality = encodeURIComponent(document.getElementById("r3-locality").value);
      const beds     = document.getElementById("r3-beds").value;
      const rent     = document.getElementById("r3-rent").value;
      url += `?locality=${locality}&bedrooms=${beds}&max_rent=${rent}`;
    } else if (type === "top-agent") {
      url += `?year=${document.getElementById("r4-year").value}`;
    } else if (type === "agent-avg") {
      url += `?year=${document.getElementById("r5-year").value}`;
    }

    try {
      const res  = await fetch(url);
      const json = await res.json();

      if (type === "extremes") {
        const d = json.data;
        resultDiv.innerHTML = `
          <p style="color:var(--muted);font-size:.8rem;margin-bottom:.5rem">Most Expensive</p>
          ${buildTable([d.most_expensive])}
          <p style="color:var(--muted);font-size:.8rem;margin:.75rem 0 .5rem">Highest Rent</p>
          ${buildTable([d.highest_rent])}
        `;
      } else {
        const rows = Array.isArray(json.data) ? json.data : [json.data];
        resultDiv.innerHTML = `<p style="color:var(--muted);font-size:.78rem;margin-bottom:.5rem">${json.query}</p>` +
          buildTable(rows);
      }
      resultDiv.classList.remove("hidden");
    } catch (e) {
      resultDiv.innerHTML = `<p style="color:var(--rust)">${e.message}</p>`;
      resultDiv.classList.remove("hidden");
    } finally {
      btn.classList.remove("loading");
      btn.textContent = "Run Query";
    }
  });
});

// ── Init ────────────────────────────────────────────────────
loadProperties();
loadLocalities();

// Lazy-load agents when tab is activated
document.querySelector('[data-tab="agents"]').addEventListener("click", loadAgents);

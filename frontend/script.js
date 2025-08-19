:root{
  --bg: #eef2f7;
  --card: #ffffff;
  --text: #1f2d3d;
  --muted: #6b7a90;
  --border: #e5e9f2;
  --primary: #2f80ed;
  --success: #27ae60;
  --danger: #e74c3c;
  --warn: #f39c12;
  --shadow: 0 10px 30px rgba(2,12,27,.08);
  --radius: 16px;
}

*{ box-sizing: border-box; }

html,body{
  margin:0; padding:0; background: var(--bg); color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
}

.nav{
  position: sticky; top:0; z-index: 10; backdrop-filter: blur(10px);
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 22px; background: rgba(255,255,255,.6); border-bottom:1px solid var(--border);
}
.brand{ display:flex; gap:10px; align-items:center; font-weight:700; font-size:1.1rem;}
.logo{ font-size:1.25rem;}
.status{ font-size:.9rem; color: var(--muted); }

.container{
  max-width: 980px; margin: 32px auto; padding: 0 16px; display:grid; gap: 24px;
}

.card{
  background: var(--card); border:1px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 22px;
}
.card h2{ margin: 0 0 6px; }
.muted{ color: var(--muted); margin-top: 0; }

.row{ display:flex; flex-wrap: wrap; gap: 12px; align-items:center; }
.row > *{ flex: 0 0 auto; }

input[type="file"], select{
  padding: 10px 12px; border:1px solid var(--border); border-radius: 10px; background:#fff; min-width: 200px;
}

.btn{
  padding: 10px 16px; border: none; border-radius: 12px; cursor: pointer; background:#f0f3f7;
  transition: transform .06s ease, box-shadow .2s ease;
}
.btn:hover{ transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
.btn.primary{ background: var(--primary); color:#fff; }
.btn.success{ background: var(--success); color:#fff; }
.btn.danger{ background: var(--danger); color:#fff; }
.btn.warn{ background: var(--warn); color:#fff; }

.results{ margin-top: 16px; }
.two-col{ display:grid; gap:14px; grid-template-columns: repeat(2, minmax(0,1fr)); }
@media (max-width: 760px){ .two-col{ grid-template-columns: 1fr; } }

.box{
  min-height: 80px; border:1px solid var(--border); background:#f7f9fc;
  border-radius: 12px; padding: 12px; white-space: pre-wrap; word-break: break-word;
  font-size: .98rem;
}

.actions{ display:flex; gap: 10px; align-items:center; margin-top: 12px; }

.foot{
  text-align:center; padding: 40px 12px; color: var(--muted);
}

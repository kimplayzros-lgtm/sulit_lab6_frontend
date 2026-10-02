import { useEffect, useState } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  CircleAlert,
  CirclePlus,
  LoaderCircle,
  LogOut,
  PackageOpen,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://sulit-lab6-backend.onrender.com' : 'http://127.0.0.1:8787')).replace(/\/$/, '');
const emptyForm = { product_name: '', description: '', price: '', quantity: '' };

async function request(path, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Hindi maabot ang LavaLust API (${API_URL}). Patakbuhin ang backend sa port 8787 at subukan muli.`);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return payload;
}

function money(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value));
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ identifier: '', username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        await request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
        });
        setMode('login');
        setForm({ ...form, identifier: form.email, password: '' });
        setError('Account created. Sign in to continue.');
      } else {
        const session = await request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier: form.identifier, password: form.password }),
        });
        onLogin(session);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <a className="brand brand-light" href="#home"><span className="brand-mark"><Boxes size={18} /></span> stockroom<span className="brand-period">.</span></a>
        <div className="story-copy">
          <p className="eyebrow"><span className="live-dot" /> INVENTORY CONTROL, IN FOCUS</p>
          <h1>Know what<br />you <em>have.</em></h1>
          <p className="story-detail">A clear view of every product, quantity, and price. Your stockroom, minus the guesswork.</p>
        </div>
        <div className="story-bottom"><span>PRODUCT MANAGEMENT SYSTEM</span><span>BUILT ON LAVALUST API</span></div>
        <div className="story-grid" aria-hidden="true" />
      </section>
      <section className="auth-panel">
        <div className="auth-topline"><span>WORKSPACE ACCESS</span><span>01 <i>/</i> 02</span></div>
        <div className="auth-card">
          <div className="auth-icon"><ShieldCheck size={21} /></div>
          <p className="eyebrow">{mode === 'login' ? 'GOOD TO HAVE YOU BACK' : 'SET UP YOUR WORKSPACE'}</p>
          <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          <p className="auth-intro">{mode === 'login' ? 'Use your account to access the product ledger.' : 'Create an account to start managing your products.'}</p>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && <label>Username<input autoComplete="nickname" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength="2" maxLength="100" /></label>}
            {mode === 'register' ? <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label> : <label>Email or username<input autoComplete="username" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required /></label>}
            <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength="8" /></label>
            {error && <p className={`form-message ${error.startsWith('Account created') ? 'success' : ''}`}><CircleAlert size={15} />{error}</p>}
            <button className="button button-ink button-wide" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={17} /> : mode === 'login' ? <>Enter workspace <ArrowRight size={16} /></> : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="mode-toggle">{mode === 'login' ? 'New to Stockroom?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}> {mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        </div>
        <div className="auth-foot"><span>SECURE SESSION</span><span>JWT AUTHENTICATED <i className="secure-dot" /></span></div>
      </section>
    </main>
  );
}

function ProductDialog({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    product_name: product.product_name,
    description: product.description || '',
    price: product.price,
    quantity: product.quantity,
  } : emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave({ ...form, price: Number(form.price), quantity: Number(form.quantity) });
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="modal-head"><div><p className="eyebrow">PRODUCT RECORD</p><h2 id="dialog-title">{product ? 'Edit product' : 'Add a product'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <form className="product-form" onSubmit={submit}>
          <label>Product name<input autoFocus maxLength="100" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required placeholder="e.g. Ceramic pour-over set" /></label>
          <label>Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short description of the product" /></label>
          <div className="form-row"><label>Price <span>(PHP)</span><div className="input-prefix"><b>₱</b><input type="number" min="0" max="99999999.99" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div></label><label>Quantity<input type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></label></div>
          {error && <p className="form-message"><CircleAlert size={15} />{error}</p>}
          <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-ink" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{product ? 'Save changes' : 'Add product'}</button></div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stockroom_session') || 'null'); } catch { return null; }
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(session));
  const [problem, setProblem] = useState('');
  const [query, setQuery] = useState('');
  const [modalProduct, setModalProduct] = useState(undefined);
  const [sort, setSort] = useState('newest');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    localStorage.setItem('stockroom_session', JSON.stringify(session));
    setLoading(true);
    request('/api/products', { token: session.access_token })
      .then((data) => { setProducts(data.products || []); setProblem(''); })
      .catch((error) => {
        setProblem(error.message);
        if (error.message === 'Unauthorized') handleLogout(false);
      })
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  function handleLogin(nextSession) {
    localStorage.setItem('stockroom_session', JSON.stringify(nextSession));
    setSession(nextSession);
  }

  async function handleLogout(sendRequest = true) {
    const current = session;
    localStorage.removeItem('stockroom_session');
    setSession(null);
    setProducts([]);
    if (sendRequest && current?.access_token) {
      try { await request('/api/auth/logout', { method: 'POST', token: current.access_token }); } catch { /* Local session is cleared either way. */ }
    }
  }

  async function saveProduct(values) {
    const editing = modalProduct && modalProduct !== 'new';
    const result = await request(editing ? `/api/products/${modalProduct.id}` : '/api/products', {
      method: editing ? 'PUT' : 'POST',
      token: session.access_token,
      body: JSON.stringify(values),
    });
    setProducts((current) => editing
      ? current.map((item) => item.id === result.product.id ? result.product : item)
      : [result.product, ...current]);
    setProblem('');
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.product_name}”? This cannot be undone.`)) return;
    try {
      await request(`/api/products/${product.id}`, { method: 'DELETE', token: session.access_token });
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (error) { setProblem(error.message); }
  }

  if (!session?.access_token) return <AuthScreen onLogin={handleLogin} />;

  const visibleProducts = products
    .filter((product) => !lowStockOnly || Number(product.quantity) <= 5)
    .filter((product) => `${product.product_name} ${product.description || ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'price' ? Number(a.price) - Number(b.price) : sort === 'quantity' ? Number(a.quantity) - Number(b.quantity) : new Date(b.created_at) - new Date(a.created_at));
  const totalValue = products.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const lowStock = products.filter((item) => Number(item.quantity) <= 5).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#workspace"><span className="brand-mark"><Boxes size={17} /></span> stockroom<span className="brand-period">.</span></a>
        <div className="topbar-right"><span className="topbar-status"><i className="secure-dot" /> API CONNECTED</span><span className="topbar-divider" /><div className="user-chip"><span className="avatar">{(session.user?.username || 'U').slice(0, 1).toUpperCase()}</span><span>{session.user?.username || session.user?.email}</span><ChevronDown size={14} /></div><button className="icon-button logout-button" title="Log out" aria-label="Log out" onClick={() => handleLogout()}><LogOut size={17} /></button></div>
      </header>

      <main className="workspace" id="workspace">
        <div className="page-heading"><div><p className="eyebrow">INVENTORY <span>/</span> OVERVIEW</p><h1>Products <span className="heading-count">{products.length.toString().padStart(2, '0')}</span></h1><p className="page-caption">Keep your product catalogue in order.</p></div><button className="button button-accent" onClick={() => setModalProduct('new')}><CirclePlus size={17} /> Add product</button></div>

        <section className="metrics" aria-label="Inventory summary">
          <div className="metric"><span className="metric-label">TOTAL PRODUCTS</span><strong>{products.length.toString().padStart(2, '0')}</strong><span className="metric-note">items in catalogue</span></div>
          <div className="metric"><span className="metric-label">IN STOCK</span><strong>{products.reduce((sum, item) => sum + Number(item.quantity), 0).toLocaleString()}</strong><span className="metric-note">units available</span></div>
          <div className="metric"><span className="metric-label">CATALOGUE VALUE</span><strong>{money(totalValue)}</strong><span className="metric-note">based on current stock</span></div>
          <button className={`metric metric-alert low-stock-metric${lowStockOnly ? ' is-active' : ''}`} type="button" aria-pressed={lowStockOnly} title="Show products with 5 or fewer units" onClick={() => setLowStockOnly((active) => !active)}><span className="metric-label">LOW STOCK</span><strong>{lowStock.toString().padStart(2, '0')}</strong><span className="metric-note">{lowStockOnly ? 'Showing low-stock items' : `${lowStock === 1 ? 'item needs' : 'items need'} attention`}</span></button>
        </section>

        <section className="catalogue">
          <div className="catalogue-heading"><div><p className="eyebrow">YOUR INVENTORY</p><h2>{lowStockOnly ? 'Low-stock products' : 'Product catalogue'}</h2></div><span className="catalogue-updated"><span className="live-dot" /> LIVE DATA</span></div>
          <div className="toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a product..." aria-label="Find a product" />{query && <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</label><label className="sort-control"><ArrowDownUp size={15} /><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="newest">Recently added</option><option value="price">Price</option><option value="quantity">Quantity</option></select><ChevronDown size={14} /></label></div>
          {problem && <div className="notice"><CircleAlert size={17} /><span>{problem}</span><button onClick={() => { setProblem(''); setLoading(true); request('/api/products', { token: session.access_token }).then((data) => setProducts(data.products || [])).catch((error) => setProblem(error.message)).finally(() => setLoading(false)); }}>Try again</button></div>}
          <div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>DESCRIPTION</th><th>PRICE</th><th>QUANTITY</th><th>ADDED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {loading ? <tr><td colSpan="6" className="table-state"><LoaderCircle className="spin" size={20} />Loading your products...</td></tr> : visibleProducts.length === 0 ? <tr><td colSpan="6"><div className="empty-state"><span><PackageOpen size={24} /></span><strong>{query ? 'No matching products' : 'Your catalogue is empty'}</strong><p>{query ? 'Try another name or clear your search.' : 'Add your first product and it will appear here.'}</p>{!query && <button className="button button-quiet" onClick={() => setModalProduct('new')}><CirclePlus size={16} /> Add your first product</button>}</div></td></tr> : visibleProducts.map((product, index) => <tr className="product-row" key={product.id} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}><td><div className="product-name"><span className="product-monogram">{product.product_name.slice(0, 1).toUpperCase()}</span><span><strong>{product.product_name}</strong><small>SKU-{String(product.id).padStart(4, '0')}</small></span></div></td><td className="description-cell">{product.description || <span className="muted">No description</span>}</td><td className="price-cell">{money(product.price)}</td><td><span className={`quantity-pill ${Number(product.quantity) === 0 ? 'out' : Number(product.quantity) < 6 ? 'low' : ''}`}><i />{Number(product.quantity) === 0 ? 'Out of stock' : `${product.quantity} units`}</span></td><td className="date-cell">{new Date(product.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td><td><div className="row-actions"><button className="icon-button" title="Edit product" aria-label={`Edit ${product.product_name}`} onClick={() => setModalProduct(product)}><Pencil size={16} /></button><button className="icon-button danger-icon" title="Delete product" aria-label={`Delete ${product.product_name}`} onClick={() => deleteProduct(product)}><Trash2 size={16} /></button></div></td></tr>)}
          </tbody></table></div>
          <div className="table-footer"><span>SHOWING <strong>{visibleProducts.length}</strong> OF <strong>{products.length}</strong> PRODUCTS</span><span><span className="footer-mark"><Check size={12} /></span> All changes sync with your API</span></div>
        </section>
        <footer className="page-footer"><span>STOCKROOM <i>·</i> PRODUCT MANAGEMENT</span><span>POWERED BY LAVALUST API</span></footer>
      </main>
      {modalProduct !== undefined && <ProductDialog product={modalProduct === 'new' ? null : modalProduct} onClose={() => setModalProduct(undefined)} onSave={saveProduct} />}
    </div>
  );
}

export default App;
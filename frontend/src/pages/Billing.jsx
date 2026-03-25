import { useState, useEffect, useRef } from 'react';
import { productAPI, billAPI } from '../services/api';
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const fmtCurrency = (v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Billing() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [gstRate, setGstRate] = useState('18');
  const [loading, setLoading] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);
  const printRef = useRef(null);

  useEffect(() => { productAPI.getAll().then((r) => setProducts(r.data)).catch(() => {}); }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product) => {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) { toast.error('Insufficient stock'); return; }
      setCart(cart.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      if (product.quantity < 1) { toast.error('Out of stock'); return; }
      setCart([...cart, { productId: product.id, name: product.name, price: Number(product.price), quantity: 1, maxQty: product.quantity }]);
    }
  };

  const updateQty = (pid, delta) => {
    setCart(cart.map((i) => {
      if (i.productId !== pid) return i;
      const nq = i.quantity + delta;
      if (nq < 1 || nq > i.maxQty) return i;
      return { ...i, quantity: nq };
    }));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstPct = parseFloat(gstRate) || 0;
  const cgstPct = gstPct / 2;
  const sgstPct = gstPct / 2;
  const cgstAmt = subtotal * cgstPct / 100;
  const sgstAmt = subtotal * sgstPct / 100;
  const totalTax = cgstAmt + sgstAmt;
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async () => {
    if (!cart.length) { toast.error('Add items first'); return; }
    setLoading(true);
    try {
      const res = await billAPI.create({ customerName, customerPhone, paymentMethod, taxPercentage: gstPct, items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })) });
      setCreatedBill(res.data);
      toast.success('Bill generated!');
      setCart([]);
      productAPI.getAll().then((r) => setProducts(r.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const handlePrint = () => {
    const c = printRef.current;
    if (!c) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Tax Invoice</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto;color:#1a1a1a;font-size:13px}
        .invoice-header{text-align:center;padding-bottom:15px;border-bottom:2px solid #6366f1;margin-bottom:20px}
        .invoice-header h1{font-size:22px;color:#6366f1;margin-bottom:2px}
        .invoice-header p{color:#666;font-size:11px}
        .meta-grid{display:flex;justify-content:space-between;margin-bottom:18px}
        .meta-box{font-size:12px;line-height:1.6}
        .meta-box strong{color:#333}
        .badge{display:inline-block;background:#6366f1;color:#fff;padding:3px 10px;border-radius:4px;font-weight:600;font-size:12px}
        table{width:100%;border-collapse:collapse;margin:15px 0}
        thead th{background:#f1f5f9;color:#475569;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.5px;padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0}
        thead th:nth-child(n+2){text-align:right}
        tbody td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:12px}
        tbody td:nth-child(n+2){text-align:right}
        tbody tr:hover{background:#fafafa}
        .summary{width:280px;margin-left:auto}
        .summary-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#64748b}
        .summary-row.total{border-top:2px solid #6366f1;margin-top:5px;padding-top:10px;font-size:16px;font-weight:700;color:#1a1a1a}
        .footer{text-align:center;margin-top:30px;padding-top:15px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px}
        .gst-tag{color:#6366f1;font-weight:600}
        @media print{body{padding:15px}}
      </style></head><body>${c.innerHTML}<script>window.print();window.close()<\/script></body></html>`);
    w.document.close();
  };

  if (createdBill) {
    const b = createdBill;
    const gst = Number(b.taxPercentage) || 0;
    const halfGst = gst / 2;
    const taxAmt = Number(b.taxAmount) || 0;
    const halfTax = (taxAmt / 2).toFixed(2);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingCart className="w-8 h-8 text-emerald-400" /></div>
          <h2 className="text-2xl font-bold text-white">Tax Invoice Generated!</h2>
          <p className="text-surface-400">#{b.billNumber}</p>
        </div>

        {/* Professional Invoice */}
        <div ref={printRef} className="bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="invoice-header" style={{textAlign:'center', padding:'24px 30px 18px', borderBottom:'3px solid #6366f1', background:'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)'}}>
            <h1 style={{fontSize:'24px', color:'#6366f1', fontWeight:'800', margin:'0 0 2px', fontFamily:"'Segoe UI',Arial,sans-serif"}}>TAX INVOICE</h1>
            <p style={{color:'#64748b', fontSize:'12px', margin:0, fontFamily:"'Segoe UI',Arial,sans-serif"}}>{user?.shopName || 'My Shop'}</p>
            <p style={{color:'#94a3b8', fontSize:'11px', margin:'2px 0 0', fontFamily:"'Segoe UI',Arial,sans-serif"}}>GST Compliant Invoice</p>
          </div>

          <div style={{padding:'24px 30px 30px'}}>
            {/* Meta info */}
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', gap:'20px'}}>
              <div style={{fontSize:'12px', lineHeight:'1.8', fontFamily:"'Segoe UI',Arial,sans-serif", color:'#475569'}}>
                <div style={{display:'inline-block', background:'#6366f1', color:'#fff', padding:'3px 12px', borderRadius:'4px', fontWeight:'700', fontSize:'12px', marginBottom:'6px'}}>{b.billNumber}</div>
                <br/>
                <span style={{color:'#94a3b8'}}>Date:</span> <strong style={{color:'#1e293b'}}>{new Date(b.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</strong>
                <br/>
                <span style={{color:'#94a3b8'}}>Time:</span> <strong style={{color:'#1e293b'}}>{new Date(b.createdAt).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</strong>
              </div>
              <div style={{fontSize:'12px', lineHeight:'1.8', textAlign:'right', fontFamily:"'Segoe UI',Arial,sans-serif", color:'#475569'}}>
                {b.customerName && <><span style={{color:'#94a3b8'}}>Customer:</span> <strong style={{color:'#1e293b'}}>{b.customerName}</strong><br/></>}
                {b.customerPhone && <><span style={{color:'#94a3b8'}}>Phone:</span> <strong style={{color:'#1e293b'}}>{b.customerPhone}</strong><br/></>}
                <span style={{color:'#94a3b8'}}>Payment:</span> <strong style={{color:'#1e293b'}}>{b.paymentMethod || 'CASH'}</strong>
              </div>
            </div>

            {/* Items table */}
            <table style={{width:'100%', borderCollapse:'collapse', fontFamily:"'Segoe UI',Arial,sans-serif"}}>
              <thead>
                <tr style={{background:'#f1f5f9'}}>
                  <th style={{padding:'10px 12px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #e2e8f0'}}>#</th>
                  <th style={{padding:'10px 12px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #e2e8f0'}}>Item</th>
                  <th style={{padding:'10px 12px', textAlign:'right', fontSize:'10px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #e2e8f0'}}>Qty</th>
                  <th style={{padding:'10px 12px', textAlign:'right', fontSize:'10px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #e2e8f0'}}>Rate</th>
                  <th style={{padding:'10px 12px', textAlign:'right', fontSize:'10px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #e2e8f0'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {b.items.map((it, i) => (
                  <tr key={i} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#94a3b8'}}>{i+1}</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#1e293b', fontWeight:'500'}}>{it.productName}</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#475569', textAlign:'right'}}>{it.quantity}</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#475569', textAlign:'right'}}>₹{fmtCurrency(it.unitPrice)}</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#1e293b', fontWeight:'600', textAlign:'right'}}>₹{fmtCurrency(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div style={{width:'280px', marginLeft:'auto', fontFamily:"'Segoe UI',Arial,sans-serif"}}>
              <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#64748b'}}><span>Subtotal</span><span style={{color:'#1e293b'}}>₹{fmtCurrency(b.subtotal)}</span></div>
              {Number(b.discountAmount) > 0 && <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#10b981'}}><span>Discount</span><span>-₹{fmtCurrency(b.discountAmount)}</span></div>}
              {gst > 0 && <>
                <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#6366f1'}}><span>CGST ({halfGst}%)</span><span>₹{halfTax}</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#6366f1'}}><span>SGST ({halfGst}%)</span><span>₹{halfTax}</span></div>
              </>}
              <div style={{display:'flex', justifyContent:'space-between', borderTop:'2px solid #6366f1', marginTop:'6px', paddingTop:'10px', fontSize:'16px', fontWeight:'800', color:'#1e293b'}}><span>Total</span><span>₹{fmtCurrency(b.totalAmount)}</span></div>
            </div>

            {/* Footer */}
            <div style={{textAlign:'center', marginTop:'30px', paddingTop:'16px', borderTop:'1px solid #e2e8f0', fontFamily:"'Segoe UI',Arial,sans-serif"}}>
              <p style={{color:'#6366f1', fontWeight:'600', fontSize:'12px', margin:'0 0 3px'}}>Thank you for your business!</p>
              <p style={{color:'#94a3b8', fontSize:'10px', margin:0}}>This is a computer-generated invoice • GST applicable as per Government of India</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25">
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button onClick={() => { setCreatedBill(null); setCustomerName(''); setCustomerPhone(''); }} className="flex-1 py-3 bg-surface-800 text-surface-300 rounded-xl hover:bg-surface-700 transition-colors font-medium">New Bill</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">New Bill</h1><p className="text-surface-400 mt-1">Create a GST-compliant invoice</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-11 pr-4 py-3 bg-surface-900/60 border border-surface-700/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div className="bg-surface-900/60 border border-surface-700/50 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-surface-800/90 backdrop-blur-sm"><tr className="border-b border-surface-700/50"><th className="text-left py-3 px-4 text-xs text-surface-400 uppercase">Product</th><th className="text-right py-3 px-4 text-xs text-surface-400 uppercase">Price</th><th className="text-right py-3 px-4 text-xs text-surface-400 uppercase">Stock</th><th className="py-3 px-4"></th></tr></thead>
              <tbody className="divide-y divide-surface-800/50">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-800/30"><td className="py-3 px-4 text-sm text-white">{p.name}</td><td className="py-3 px-4 text-sm text-right text-white">₹{Number(p.price).toLocaleString()}</td><td className="py-3 px-4 text-sm text-right text-surface-400">{p.quantity}</td>
                    <td className="py-3 px-4 text-right"><button onClick={() => addToCart(p)} disabled={p.quantity < 1} className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg disabled:opacity-30"><Plus className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-surface-900/60 border border-surface-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-primary-400" /> Cart ({cart.length})</h3>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone" className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            <div className="grid grid-cols-2 gap-3">
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                <option value="CASH">Cash</option><option value="CARD">Card</option><option value="UPI">UPI</option>
              </select>
              <div className="relative">
                <input type="number" min="0" max="28" step="1" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="w-full px-4 py-2.5 pr-14 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 text-xs font-medium">% GST</span>
              </div>
            </div>

            {!cart.length ? <p className="text-sm text-surface-500 text-center py-6">Add products to cart</p> : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {cart.map((i) => (
                  <div key={i.productId} className="flex items-center gap-3 bg-surface-800/30 rounded-xl p-3">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{i.name}</p><p className="text-xs text-surface-400">₹{i.price} × {i.quantity}</p></div>
                    <div className="flex items-center gap-1"><button onClick={() => updateQty(i.productId, -1)} className="p-1 bg-surface-700 rounded"><Minus className="w-3 h-3 text-surface-300" /></button><span className="text-sm text-white w-6 text-center">{i.quantity}</span><button onClick={() => updateQty(i.productId, 1)} className="p-1 bg-surface-700 rounded"><Plus className="w-3 h-3 text-surface-300" /></button></div>
                    <p className="text-sm font-semibold text-white w-16 text-right">₹{(i.price * i.quantity).toLocaleString()}</p>
                    <button onClick={() => setCart(cart.filter((c) => c.productId !== i.productId))} className="p-1 text-surface-500 hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-surface-700/50 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-surface-400">Subtotal</span><span className="text-white">₹{subtotal.toLocaleString()}</span></div>
                {gstPct > 0 && (
                  <>
                    <div className="flex justify-between text-xs"><span className="text-primary-400">CGST ({cgstPct}%)</span><span className="text-primary-400">₹{cgstAmt.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-primary-400">SGST ({sgstPct}%)</span><span className="text-primary-400">₹{sgstAmt.toFixed(2)}</span></div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold pt-1.5 border-t border-surface-700/50"><span className="text-white">Total</span><span className="text-primary-300">₹{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
              </div>
            )}
            <button onClick={handleSubmit} disabled={!cart.length || loading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all hover:from-emerald-500 hover:to-emerald-400">{loading ? 'Generating...' : 'Generate Bill'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { productAPI, billAPI } from '../services/api';
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const fmtCurrency = (v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Billing() {
  const { user, activeOutletId } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);
  const [activeSchemes, setActiveSchemes] = useState([]);
  const printRef = useRef(null);

  useEffect(() => { 
    if (activeOutletId !== 'all') {
        productAPI.getAll().then((r) => setProducts(r.data)).catch(() => {});
        // Import discountAPI from api.js manually or via import update if needed
        import('../services/api').then(mod => {
           mod.discountAPI.getActive().then(r => setActiveSchemes(r.data)).catch(() => {});
        });
    }
  }, [activeOutletId]);

  if (activeOutletId === 'all') {
    return (
       <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-surface-900/50 rounded-3xl border border-surface-700/50 shadow-2xl mt-12 mx-4 sm:mx-12">
           <div className="w-24 h-24 mb-6 bg-primary-500/20 rounded-full flex items-center justify-center">
               <ShoppingCart className="w-12 h-12 text-primary-400" />
           </div>
           <h2 className="text-2xl font-black text-white mb-3">Select a Branch to Start Billing</h2>
           <p className="text-surface-400 max-w-lg text-lg leading-relaxed">You are currently viewing global aggregated inventory. Please select a specific physical branch from the top header to operate the terminal and deduct physical stock.</p>
       </div>
    );
  }

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
      setCart([...cart, { productId: product.id, name: product.name, price: Number(product.price), quantity: 1, maxQty: product.quantity, gstRate: Number(product.gstRate || 0), categoryId: product.category?.id }]);
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

  const calculateDiscount = (item, lineTotal) => {
      let maxDiscount = 0;
      for (const scheme of activeSchemes) {
          if (scheme.applicableCategory && item.categoryId !== scheme.applicableCategory.id) continue;
          if (scheme.minPurchaseAmount && lineTotal < scheme.minPurchaseAmount) continue;
          
          let discount = 0;
          if (scheme.discountType === 'PERCENTAGE') {
              discount = lineTotal * (scheme.value / 100);
          } else if (scheme.discountType === 'FLAT') {
              discount = Math.min(scheme.value, lineTotal);
          } else if (scheme.discountType === 'BUY_ONE_GET_ONE') {
              if (item.quantity >= 2) {
                  const freeItems = Math.floor(item.quantity / 2);
                  discount = item.price * freeItems;
              }
          }
          if (discount > maxDiscount) maxDiscount = discount;
      }
      return maxDiscount;
  };

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  const uniqueTaxes = {};

  cart.forEach(i => {
    const lineSubtotal = i.price * i.quantity;
    const itemDiscount = calculateDiscount(i, lineSubtotal);
    const taxableAmount = lineSubtotal - itemDiscount;
    
    subtotal += lineSubtotal;
    totalDiscount += itemDiscount;
    
    const itemTax = taxableAmount * (i.gstRate / 100);
    totalTax += itemTax;
    
    const rateKey = i.gstRate.toString();
    if (!uniqueTaxes[rateKey]) uniqueTaxes[rateKey] = 0;
    uniqueTaxes[rateKey] += itemTax;
  });

  const grandTotal = (subtotal - totalDiscount) + totalTax;

  const handleSubmit = async () => {
    if (!cart.length) { toast.error('Add items first'); return; }
    setLoading(true);
    try {
      const res = await billAPI.create({ customerName, customerPhone, paymentMethod, items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })) });
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
                  <th style={{padding:'10px 12px', textAlign:'right', fontSize:'10px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #e2e8f0'}}>GST %</th>
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
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#6366f1', textAlign:'right', fontWeight:'600'}}>{it.gstRate || 0}%</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#1e293b', fontWeight:'600', textAlign:'right'}}>₹{fmtCurrency(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div style={{width:'280px', marginLeft:'auto', fontFamily:"'Segoe UI',Arial,sans-serif"}}>
              <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#64748b'}}><span>Subtotal</span><span style={{color:'#1e293b'}}>₹{fmtCurrency(b.subtotal)}</span></div>
              {Number(b.discountAmount) > 0 && <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#10b981'}}><span>Discount</span><span>-₹{fmtCurrency(b.discountAmount)}</span></div>}
              {taxAmt > 0 && <>
                <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#6366f1'}}><span>CGST Total</span><span>₹{halfTax}</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'12px', color:'#6366f1'}}><span>SGST Total</span><span>₹{halfTax}</span></div>
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
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Point of Sale</h1>
        <p className="text-surface-400 font-medium">Create a new order & process payments securely</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 xl:gap-8 items-start">
        {/* Products Column */}
        <div className="xl:col-span-3 space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search products by name or SKU..." 
              className="w-full pl-12 pr-4 py-4 bg-surface-900/60 hover:bg-surface-800/80 border border-surface-700/50 focus:border-primary-500/50 rounded-[1.25rem] text-white placeholder-surface-500 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-8">
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                onClick={() => p.quantity > 0 && addToCart(p)}
                className={`group bg-surface-800/40 hover:bg-surface-800/80 backdrop-blur-md border ${p.quantity > 0 ? 'border-surface-700/50 hover:border-primary-500/50 cursor-pointer' : 'border-danger/20 opacity-60 cursor-not-allowed'} rounded-2xl p-4 transition-all duration-300 flex items-center gap-4`}
              >
                {/* Glowing Initial Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/20 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]">
                  <span className="text-primary-400 font-bold text-xl uppercase tracking-wider">{p.name.charAt(0)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate transition-colors ${p.quantity > 0 ? 'text-white group-hover:text-primary-200' : 'text-surface-400'}`}>{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded-md">₹{Number(p.price).toLocaleString()}</span>
                    <span className="text-surface-500 text-xs px-2 py-0.5 rounded-md bg-surface-900/50 font-medium">{p.quantity} on hand</span>
                  </div>
                </div>

                <button 
                  disabled={p.quantity < 1}
                  onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                  className="w-10 h-10 shrink-0 rounded-full bg-surface-700/40 group-hover:bg-primary-500 text-surface-400 group-hover:text-white flex items-center justify-center transition-all disabled:opacity-0 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-surface-500">
                <p>No products found matching "{search}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart/Checkout Panel */}
        <div className="xl:col-span-2 relative">
          <div className="sticky top-6 bg-surface-900/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-700/50">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <div className="p-2.5 bg-primary-500/20 rounded-xl text-primary-400"><ShoppingCart className="w-5 h-5" /></div>
                Current Order
              </h3>
              <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]">{cart.length} Items</span>
            </div>

            {/* Inputs Container */}
            <div className="space-y-4">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name (Optional)" className="w-full px-4 py-3.5 bg-surface-950/50 hover:bg-surface-900 border border-surface-700/50 focus:border-primary-500 rounded-xl text-white placeholder-surface-500 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all shadow-inner" />
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone Number" className="w-full px-4 py-3.5 bg-surface-950/50 hover:bg-surface-900 border border-surface-700/50 focus:border-primary-500 rounded-xl text-white placeholder-surface-500 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all shadow-inner" />
              <div className="grid grid-cols-1 gap-4">
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-4 py-3.5 bg-surface-950/50 border border-surface-700/50 focus:border-primary-500 rounded-xl text-white text-sm font-medium focus:outline-none hover:bg-surface-900 transition-all shadow-inner appearance-none relative">
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Card Payment</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 min-h-[160px] max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {!cart.length ? (
                 <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-4 py-12">
                   <div className="p-4 bg-surface-800/50 rounded-full inset-shadow-sm"><ShoppingCart className="w-8 h-8 opacity-40 text-surface-400" /></div>
                   <p className="text-sm font-medium">Add products to start cart</p>
                 </div>
              ) : cart.map((i) => (
                <div key={i.productId} className="flex items-center gap-3 md:gap-4 bg-surface-800/40 hover:bg-surface-800/60 transition-colors border border-surface-700/30 rounded-2xl p-3 pr-4">
                  <div className="w-10 h-10 rounded-full bg-surface-950/50 border border-surface-700/50 flex items-center justify-center text-surface-300 font-bold text-xs uppercase shrink-0 shadow-inner">
                    {i.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{i.name}</p>
                    <p className="text-xs text-primary-400 font-medium mt-0.5">₹{i.price} <span className="text-surface-500 inline-block ml-1">• {i.gstRate}% GST</span></p>
                  </div>
                  <div className="flex items-center bg-surface-950/50 rounded-full p-1 border border-surface-700/50 shadow-inner">
                    <button onClick={() => updateQty(i.productId, -1)} className="w-6 h-6 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700/80 rounded-full transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-xs font-bold text-white shrink-0">{i.quantity}</span>
                    <button onClick={() => updateQty(i.productId, 1)} className="w-6 h-6 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700/80 rounded-full transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="flex flex-col items-end shrink-0 w-[50px] md:w-[65px]">
                    <p className="font-bold text-white text-[13px] md:text-sm truncate w-full text-right tracking-tight">₹{(i.price * i.quantity).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter((c) => c.productId !== i.productId))} className="p-1.5 md:p-2 text-surface-500 hover:text-danger hover:bg-danger/10 rounded-full transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Checkout Totals */}
            {cart.length > 0 && (
              <div className="bg-surface-950/50 rounded-2xl p-5 space-y-3 border border-surface-800 shadow-inner">
                <div className="flex justify-between text-sm text-surface-400 font-medium"><span>Subtotal (Excl. Tax)</span><span className="text-white">₹{subtotal.toLocaleString()}</span></div>
                {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-emerald-400">
                      <span>Discount Schemes Applied</span>
                      <span>-₹{totalDiscount.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                    </div>
                )}
                {Object.keys(uniqueTaxes).map(rate => parseFloat(uniqueTaxes[rate]) > 0 ? (
                  <div key={rate} className="flex justify-between text-xs text-primary-400/80 font-medium">
                    <span>GST ({rate}%)</span>
                    <span>₹{uniqueTaxes[rate].toFixed(2)}</span>
                  </div>
                ) : null)}
                <div className="pt-3 border-t border-surface-800 flex justify-between items-center text-xl font-black text-white">
                  <span>Total</span>
                  <span className="text-primary-400">₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleSubmit} 
              disabled={!cart.length || loading} 
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-[15px] tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-40 disabled:hover:shadow-none transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:transform-none"
            >
              {loading ? 'Processing Transaction...' : 'Complete Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

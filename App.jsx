import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CarFront, MapPin, CalendarDays, Clock3, Phone, MessageCircle,
  ShieldCheck, Route, Luggage, Settings, X, CheckCircle2, Fuel, Calculator,
  Menu, Star, ChevronDown
} from 'lucide-react';

const PHONE = '919600919525';
const WHATSAPP = '919600919526';
const DEFAULT_RATES = [
  { name: 'Sedan', rate: 15, note: 'சௌகரியமான Sedan' },
  { name: 'SUV', rate: 18, note: 'குடும்பப் பயணங்களுக்கு' },
  { name: 'Innova', rate: 20, note: 'வசதியான குடும்பப் பயணம்' },
  { name: 'Innova Crysta', rate: 22, note: 'Premium பயணம்' }
];

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('oot_settings') || 'null');
    if (saved) return saved;
  } catch {}
  return { rates: DEFAULT_RATES, petrolPrice: 0, baselinePetrol: 0, adjustment: 0, pendingRates: null };
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  }).format(now)} IST</span>;
}

function App() {
  const [settings, setSettings] = useState(readSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [form, setForm] = useState({
    pickup: '', drop: '', date: '', time: '', vehicle: 'Sedan',
    distance: '', luggage: 'இல்லை', carrier: 'வேண்டாம்', customerName: '', customerPhone: '', notes: ''
  });
  const [sent, setSent] = useState(false);
  const [adminDraft, setAdminDraft] = useState(settings);

  useEffect(() => localStorage.setItem('oot_settings', JSON.stringify(settings)), [settings]);

  const selectedRate = settings.rates.find(v => v.name === form.vehicle)?.rate || 15;
  const estimate = useMemo(() => {
    const km = Number(form.distance);
    return km > 0 ? Math.round(km * selectedRate) : 0;
  }, [form.distance, selectedRate]);

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  function bookingMessage() {
    return [
      'வணக்கம்! OnlineOneWayTaxi.com மூலம் ஒரு Taxi Booking Estimate வேண்டும்.',
      `பெயர்: ${form.customerName || 'குறிப்பிடவில்லை'}`,
      `தொலைபேசி: ${form.customerPhone || 'குறிப்பிடவில்லை'}`,
      `Pickup: ${form.pickup}`,
      `Drop: ${form.drop}`,
      `பயண தேதி: ${form.date}`,
      `பயண நேரம்: ${form.time}`,
      `வாகனம்: ${form.vehicle}`,
      `தூரம்: ${form.distance} KM`,
      `தோராயமான வாடகை: ${estimate ? money(estimate) : 'தொலைபேசியில் உறுதி செய்யவும்'}`,
      `லக்கேஜ்: ${form.luggage}`,
      `Carrier: ${form.carrier}`,
      `குறிப்பு: ${form.notes || 'இல்லை'}`,
      'இறுதி வாடகையை தொலைபேசியில் உறுதி செய்யவும்.'
    ].join('\n');
  }

  function sendWhatsApp(e) {
    e.preventDefault();
    if (!form.pickup || !form.drop || !form.date || !form.time || !form.customerPhone) {
      alert('Pickup, Drop, Date, Time மற்றும் Phone Number நிரப்பவும்.');
      return;
    }
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(bookingMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  }

  function openAdmin() {
    setAdminDraft(settings);
    setAdminOpen(true);
    setAdminUnlocked(false);
    setAdminPassword('');
    setAdminError('');
  }

  function unlockAdmin(e) {
    e.preventDefault();
    // Demo-only gate. Change this before publishing; it is not secure without a backend.
    if (adminPassword === 'Taxi@2026') setAdminUnlocked(true);
    else setAdminError('கடவுச்சொல் சரியில்லை.');
  }

  function saveAdmin() {
    setSettings(adminDraft);
    setAdminOpen(false);
    setAdminUnlocked(false);
  }

  function calculateAutomaticRates() {
    const current = Number(adminDraft.petrolPrice);
    const baseline = Number(adminDraft.baselinePetrol);
    const adjustment = Number(adminDraft.adjustment);
    if (!current || !baseline || adjustment < 0) {
      alert('Petrol Price, Base Petrol Price மற்றும் adjustment மதிப்புகளை நிரப்பவும்.');
      return;
    }
    const delta = current - baseline;
    const proposed = adminDraft.rates.map(v => ({
      ...v, rate: Math.max(1, Math.round(v.rate + delta * adjustment))
    }));
    setAdminDraft(prev => ({ ...prev, pendingRates: proposed }));
  }

  function applyAutomaticRates() {
    if (!adminDraft.pendingRates) return;
    setAdminDraft(prev => ({ ...prev, rates: prev.pendingRates, pendingRates: null, baselinePetrol: Number(prev.petrolPrice) }));
  }

  return (
    <div className="site-shell">
      <div className="top-strip">
        <div className="container top-inner">
          <span>🚕 ஒரு வழிப் பயணங்களுக்கு நம்பகமான Taxi Booking</span>
          <span className="live-time"><span className="live-dot" /> LIVE <LiveClock /></span>
        </div>
      </div>

      <header className="header">
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label="Online One Way Taxi home">
            <span className="brand-mark"><CarFront size={27} /></span>
            <span><strong>ONLINE ONE WAY</strong><small>TAXI TRAVELS</small></span>
          </a>
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><Menu /></button>
          <nav className={menuOpen ? 'nav-links show' : 'nav-links'}>
            <a href="#home" onClick={() => setMenuOpen(false)}>முகப்பு</a>
            <a href="#booking" onClick={() => setMenuOpen(false)}>Booking</a>
            <a href="#vehicles" onClick={() => setMenuOpen(false)}>வாகனங்கள்</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>எப்படி செயல்படும்?</a>
          </nav>
          <a className="nav-call" href={`tel:+${PHONE}`}><Phone size={16}/> Call Now</a>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-bg-shape shape-one" /><div className="hero-bg-shape shape-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> ONE WAY TAXI BOOKING</div>
              <h1>உங்கள் பயணம்<br/><em>இனிமையாக</em> தொடங்கட்டும்.</h1>
              <p className="hero-tagline">For Comfortable Journeys, Book Online!</p>
              <p className="hero-desc">உங்கள் ஊரிலிருந்து Airport, Chennai, Bengaluru மற்றும் விரும்பும் இடங்களுக்கு One Way Taxi வசதி.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#booking">Book Your Taxi <ArrowRight size={18}/></a>
                <a className="btn btn-outline" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/> WhatsApp</a>
              </div>
              <div className="trust-row">
                <span><ShieldCheck size={17}/> எளிய Booking</span>
                <span><Route size={17}/> One Way Trip</span>
                <span><Clock3 size={17}/> 24/7 Enquiry</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-orbit orbit-a" /><div className="hero-orbit orbit-b" />
              <div className="hero-car-card">
                <div className="car-card-label"><span className="live-dot"/> COMFORTABLE JOURNEYS</div>
                <img src="https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=85" alt="White premium car on the road" />
                <div className="car-caption"><span><b>One Way Taxi</b><small>Travel with comfort</small></span><span className="caption-icon"><CarFront/></span></div>
              </div>
              <div className="floating-chip chip-top"><span className="chip-icon"><MapPin size={17}/></span><span><b>Pickup to Drop</b><small>Easy one-way trips</small></span></div>
              <div className="floating-chip chip-bottom"><span className="chip-icon green"><CheckCircle2 size={17}/></span><span><b>Quick Enquiry</b><small>Connect on WhatsApp</small></span></div>
            </div>
          </div>
          <div className="road-line"><span className="road-dashes"/></div>
        </section>

        <section className="booking-section" id="booking">
          <div className="container booking-layout">
            <div className="section-intro">
              <div className="eyebrow">START YOUR JOURNEY</div>
              <h2>உங்கள் Taxi-ஐ<br/><em>இப்போதே</em> பதிவு செய்யுங்கள்</h2>
              <p>பயண விவரங்களை நிரப்புங்கள். தோராயமான வாடகையைப் பார்த்து WhatsApp மூலம் எங்களுக்கு அனுப்புங்கள்.</p>
              <div className="estimate-note"><Calculator size={20}/><span><b>Fare Estimate மட்டும்</b><small>Website-ல் ஆன்லைன் பணம் வசூலிக்கப்படாது. இறுதி வாடகை தொலைபேசியில் உறுதி செய்யப்படும்.</small></span></div>
            </div>
            <form className="booking-card" onSubmit={sendWhatsApp}>
              <div className="form-heading"><div><span className="form-kicker">BOOKING FORM</span><h3>பயண விவரங்கள்</h3></div><span className="form-icon"><CarFront/></span></div>
              <div className="form-grid">
                <label className="field"><span><MapPin size={15}/> Pickup Location *</span><input value={form.pickup} onChange={e=>updateForm('pickup',e.target.value)} placeholder="உங்கள் Pickup இடம்" required /></label>
                <label className="field"><span><MapPin size={15}/> Drop Location *</span><input value={form.drop} onChange={e=>updateForm('drop',e.target.value)} placeholder="செல்ல வேண்டிய இடம்" required /></label>
                <label className="field"><span><CalendarDays size={15}/> Journey Date *</span><input type="date" min={localDate} value={form.date} onChange={e=>updateForm('date',e.target.value)} required /></label>
                <label className="field"><span><Clock3 size={15}/> Journey Time (AM/PM) *</span><input type="time" value={form.time} onChange={e=>updateForm('time',e.target.value)} required /></label>
                <label className="field"><span><CarFront size={15}/> Select Vehicle *</span><select value={form.vehicle} onChange={e=>updateForm('vehicle',e.target.value)}>{settings.rates.map(v=><option key={v.name} value={v.name}>{v.name}</option>)}</select></label>
                <label className="field"><span><Route size={15}/> Approx. Distance (KM)</span><input type="number" min="1" step="1" value={form.distance} onChange={e=>updateForm('distance',e.target.value)} placeholder="தூரம் (KM) உள்ளிடவும்" /></label>
                <label className="field"><span><Phone size={15}/> உங்கள் Phone Number *</span><input type="tel" inputMode="numeric" value={form.customerPhone} onChange={e=>updateForm('customerPhone',e.target.value)} placeholder="10 இலக்க மொபைல் எண்" pattern="[0-9+ ]{10,15}" required /></label>
                <label className="field"><span>உங்கள் பெயர்</span><input value={form.customerName} onChange={e=>updateForm('customerName',e.target.value)} placeholder="பெயர் (விருப்பம்)" /></label>
                <label className="field"><span><Luggage size={15}/> Luggage உள்ளதா?</span><select value={form.luggage} onChange={e=>updateForm('luggage',e.target.value)}><option>இல்லை</option><option>ஆம்</option></select></label>
                <label className="field"><span>Car Carrier தேவையா?</span><select value={form.carrier} onChange={e=>updateForm('carrier',e.target.value)}><option>வேண்டாம்</option><option>தேவை</option></select></label>
                <label className="field field-full"><span>கூடுதல் குறிப்பு</span><textarea rows="2" value={form.notes} onChange={e=>updateForm('notes',e.target.value)} placeholder="வேறு ஏதேனும் தகவல் இருந்தால் எழுதுங்கள்..." /></label>
              </div>
              <div className="estimate-panel">
                <div><span className="estimate-label">YOUR ESTIMATED FARE</span><strong>{estimate ? money(estimate) : '— — —'}</strong><small>{estimate ? `${form.distance} KM × ${money(selectedRate)} / KM` : 'தூரத்தை உள்ளிட்டால் தோராயமான வாடகை தெரியும்'}</small></div>
                <span className="estimate-badge"><Calculator size={17}/> Estimate</span>
              </div>
              <p className="fare-disclaimer">* இது தோராயமான கணிப்பு மட்டுமே. Toll, Parking, Permit மற்றும் பிற பொருந்தக்கூடிய கட்டணங்கள் தனியாக இருக்கலாம். இறுதி வாடகை எங்கள் குழுவால் உறுதி செய்யப்படும்.</p>
              <button className="btn btn-whatsapp submit-btn" type="submit"><MessageCircle size={19}/> WhatsApp மூலம் Booking விவரங்களை அனுப்பவும் <ArrowRight size={18}/></button>
              {sent && <div className="success-message"><CheckCircle2 size={17}/> WhatsApp திறக்கப்படுகிறது. செய்தியை அனுப்பி Booking உறுதி செய்யுங்கள்.</div>}
            </form>
          </div>
        </section>

        <section className="vehicles-section" id="vehicles">
          <div className="container">
            <div className="center-heading"><div className="eyebrow">OUR VEHICLES</div><h2>உங்கள் பயணத்திற்கு ஏற்ற <em>வாகனம்</em></h2><p>உங்கள் தேவைக்கேற்ப வாகனத்தைத் தேர்வு செய்யுங்கள்.</p></div>
            <div className="vehicle-grid">
              {[
                {name:'Sedan', rate:settings.rates[0]?.rate, desc:'சிறிய குடும்பம் மற்றும் தனிப்பட்ட பயணங்களுக்கு', img:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'},
                {name:'SUV', rate:settings.rates[1]?.rate, desc:'கூடுதல் இடவசதியுடன் வசதியான பயணம்', img:'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80'},
                {name:'Innova', rate:settings.rates[2]?.rate, desc:'குடும்பப் பயணங்களுக்கு ஏற்ற வசதி', img:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'},
                {name:'Innova Crysta', rate:settings.rates[3]?.rate, desc:'Premium வசதியுடன் நீண்ட தூரப் பயணம்', img:'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'}
              ].map((v,i)=><article className="vehicle-card" key={v.name}>
                <div className="vehicle-image"><img src={v.img} alt={`${v.name} taxi`} loading="lazy"/><span className="vehicle-number">0{i+1}</span></div>
                <div className="vehicle-info"><div className="vehicle-title"><h3>{v.name}</h3><span>{money(v.rate)}<small> / KM</small></span></div><p>{v.desc}</p><button onClick={()=>{updateForm('vehicle',v.name);document.getElementById('booking').scrollIntoView({behavior:'smooth'});}} className="vehicle-select">இந்த வாகனத்தை தேர்வு செய் <ArrowRight size={16}/></button></div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="how-section" id="how">
          <div className="container">
            <div className="center-heading"><div className="eyebrow">HOW IT WORKS</div><h2>மிக எளிதான <em>Booking</em></h2></div>
            <div className="steps-grid">
              <div className="step"><span>01</span><MapPin/><h3>இடங்களை உள்ளிடுங்கள்</h3><p>Pickup மற்றும் Drop இடங்களைத் தேர்வு செய்யுங்கள்.</p></div>
              <div className="step"><span>02</span><CarFront/><h3>வாகனத்தைத் தேர்வு செய்யுங்கள்</h3><p>உங்கள் பயணத்திற்கு ஏற்ற வாகனத்தைத் தேர்வு செய்யுங்கள்.</p></div>
              <div className="step"><span>03</span><Calculator/><h3>Estimate பாருங்கள்</h3><p>தோராயமான வாடகையைப் பார்த்து விவரங்களை அனுப்புங்கள்.</p></div>
              <div className="step"><span>04</span><MessageCircle/><h3>தொலைபேசியில் உறுதி</h3><p>எங்கள் குழு தொடர்புகொண்டு இறுதி வாடகையை உறுதி செய்யும்.</p></div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-inner"><div><span className="eyebrow">READY TO TRAVEL?</span><h2>உங்கள் அடுத்த பயணம்<br/>இங்கே தொடங்கட்டும்!</h2><p>இப்போதே உங்கள் பயண விவரங்களை அனுப்புங்கள்.</p></div><div className="cta-actions"><a className="btn btn-light" href={`tel:+${PHONE}`}><Phone size={18}/> 9600919525</a><a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/> WhatsApp Booking</a></div></div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-main"><div className="brand footer-brand"><span className="brand-mark"><CarFront size={27}/></span><span><strong>ONLINE ONE WAY</strong><small>TAXI TRAVELS</small></span></div><p>For Comfortable Journeys, Book Online!</p><div className="footer-links"><a href={`tel:+${PHONE}`}><Phone size={15}/> Call: 9600919525</a><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle size={15}/> WhatsApp: 9600919526</a></div></div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} OnlineOneWayTaxi.com. All rights reserved.</span><button onClick={openAdmin}><Settings size={14}/> Admin</button></div>
      </footer>

      <a className="floating-whatsapp" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="WhatsApp Booking"><MessageCircle size={25}/></a>

      {adminOpen && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setAdminOpen(false);}}>
        <div className="admin-modal">
          <div className="modal-header"><div><span className="form-kicker">ADMIN CONTROL PANEL</span><h3>வாடகை நிர்வாகம்</h3></div><button className="icon-button" onClick={()=>setAdminOpen(false)}><X/></button></div>
          {!adminUnlocked ? <form onSubmit={unlockAdmin} className="admin-login"><p>Admin Panel திறக்க கடவுச்சொல்லை உள்ளிடுங்கள்.</p><label className="field"><span>Admin Password</span><input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} placeholder="Password" autoFocus/></label>{adminError && <p className="error">{adminError}</p>}<button className="btn btn-primary" type="submit">தொடரவும்</button><small>Demo password: Taxi@2026 (Live செய்வதற்கு முன் மாற்றவும்)</small></form> :
          <div className="admin-content">
            <div className="admin-warning"><ShieldCheck size={18}/> இப்போது இது Browser-ல் சேமிக்கப்படும் Demo Admin. பாதுகாப்பான Live Admin-க்கு Backend Authentication தேவை.</div>
            <h4><Settings size={17}/> வாகனங்களின் KM Rate</h4>
            <div className="admin-rate-list">{adminDraft.rates.map((v,i)=><label className="field" key={v.name}><span>{v.name} (₹ / KM)</span><input type="number" min="1" value={v.rate} onChange={e=>setAdminDraft(prev=>({...prev,rates:prev.rates.map((r,j)=>j===i?{...r,rate:Number(e.target.value)}:r)}))}/></label>)}</div>
            <h4><Fuel size={17}/> Petrol Price Adjustment</h4>
            <div className="admin-rate-list two-col">
              <label className="field"><span>தற்போதைய Petrol Price (₹/L)</span><input type="number" min="0" value={adminDraft.petrolPrice} onChange={e=>setAdminDraft(p=>({...p,petrolPrice:e.target.value}))} placeholder="உதா: 102"/></label>
              <label className="field"><span>Base Petrol Price (₹/L)</span><input type="number" min="0" value={adminDraft.baselinePetrol} onChange={e=>setAdminDraft(p=>({...p,baselinePetrol:e.target.value}))} placeholder="அடிப்படை விலை"/></label>
              <label className="field field-full"><span>Petrol ₹1 மாறும்போது KM Rate எவ்வளவு மாற வேண்டும்? (₹)</span><input type="number" min="0" step="0.1" value={adminDraft.adjustment} onChange={e=>setAdminDraft(p=>({...p,adjustment:e.target.value}))} placeholder="உதா: 0.25"/></label>
            </div>
            <button className="btn btn-outline admin-calc" onClick={calculateAutomaticRates} type="button"><Calculator size={17}/> புதிய Rate கணக்கிடு</button>
            {adminDraft.pendingRates && <div className="preview-box"><b>புதிய Rate Preview</b>{adminDraft.pendingRates.map(v=><div key={v.name}><span>{v.name}</span><strong>{money(v.rate)} / KM</strong></div>)}<button className="btn btn-primary" onClick={applyAutomaticRates} type="button">Approve & Apply Rates</button></div>}
            <div className="admin-actions"><button className="btn btn-outline" onClick={()=>setAdminOpen(false)} type="button">Cancel</button><button className="btn btn-primary" onClick={saveAdmin} type="button">Save Changes</button></div>
          </div>}
        </div>
      </div>}
    </div>
  );
}

export default App;
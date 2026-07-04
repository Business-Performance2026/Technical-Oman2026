import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import {
  ShieldCheck, User, Wrench, MapPin, CheckCircle2, XCircle,
  Radar, Plus, AlertCircle, Power, ArrowRight,
  ClipboardList, Users, LogOut, BadgeCheck, Hourglass, Sparkles,
  Trash2, Pencil, MessageCircle, Save, X
} from "lucide-react";

const REGIONS = [
  "مسقط", "ظفار", "الباطنة شمال", "الباطنة جنوب", "الداخلية",
  "الشرقية شمال", "الشرقية جنوب", "الظاهرة", "البريمي", "مسندم", "الوسطى"
];

const SPECIALTIES = [
  "كاميرات مراقبة", "أنظمة إنذار وحماية", "إضاءة ذكية",
  "شبكات وواي فاي", "تحكم مركزي", "أقفال ذكية"
];

const WILAYAT = {
  "مسقط": ["مسقط", "بوشر", "السيب", "مطرح", "العامرات", "قريات"],
  "الباطنة شمال": ["صحار", "شناص", "لوى", "صحم"],
  "الباطنة جنوب": ["الرستاق", "نخل", "العوابي", "بركاء"],
  "الداخلية": ["نزوى", "بهلاء", "إزكي", "منح"],
  "ظفار": ["صلالة", "طاقة", "مرباط", "ثمريت"],
  "الشرقية شمال": ["إبراء", "المضيبي", "بدية"],
  "الشرقية جنوب": ["صور", "الكامل والوافي", "جعلان بني بو علي"],
  "الظاهرة": ["عبري", "ينقل", "ضنك"],
  "البريمي": ["البريمي", "محضة", "السنينة"],
  "مسندم": ["خصب", "بخا", "دبا"],
  "الوسطى": ["هيما", "محوت", "الدقم"]
};

const COL_BG = "#04706C";
const COL_CARD = "#024A4A";
const COL_BORDER = "#0B615D";
const COL_BORDER_SOFT = "#0A5A56";
const COL_TEXT = "#F5F3EA";
const COL_MUTED = "#B9D9D6";
const COL_ACCENT = "#E3A657";
const COL_GREEN = "#7ED4A8";
const COL_BLUE = "#8FC3E0";
const COL_RED = "#F0A08D";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

function overlap(a, b) {
  return a.some(x => b.includes(x));
}

function waLink(phone, message) {
  const clean = phone.replace(/\D/g, "").replace(/^0+/, "");
  return `https://wa.me/968${clean}?text=${encodeURIComponent(message)}`;
}

function WaPhoneLink({ phone, message }) {
  return (
    <a className="wa-link" href={waLink(phone, message)} target="_blank" rel="noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 }}>
      <MessageCircle size={13} /> {phone}
    </a>
  );
}

function Badge({ tone, children }) {
  const tones = {
    amber: { bg: "rgba(227,166,87,0.18)", fg: COL_ACCENT },
    green: { bg: "rgba(126,212,168,0.16)", fg: COL_GREEN },
    red: { bg: "rgba(240,160,141,0.18)", fg: COL_RED },
    sand: { bg: "rgba(185,217,214,0.14)", fg: COL_MUTED }
  };
  const t = tones[tone] || tones.sand;
  return (
    <span style={{
      background: t.bg, color: t.fg, fontSize: 12, fontWeight: 700,
      padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap"
    }}>{children}</span>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{
      background: COL_CARD, border: `1px solid ${COL_BORDER}`, borderRadius: 14,
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: COL_MUTED, fontWeight: 700 }}>{label}</span>
        <Icon size={16} color={accent || COL_ACCENT} />
      </div>
      <span style={{ fontSize: 26, fontWeight: 800, color: COL_TEXT }}>{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: COL_MUTED, fontWeight: 600 }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  background: "#013C3C", border: `1px solid ${COL_BORDER}`, borderRadius: 10,
  padding: "10px 12px", color: COL_TEXT, fontSize: 14, fontFamily: "inherit", outline: "none"
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function Select(props) {
  return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}

function MultiChoice({ options, selected, onToggle, accent }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} style={{
            border: `1px solid ${active ? accent : COL_BORDER}`,
            background: active ? `${accent}26` : "#013C3C",
            color: active ? accent : COL_MUTED,
            borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}>
            {active && <CheckCircle2 size={13} />} {opt}
          </button>
        );
      })}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#3E6461" : COL_ACCENT, color: "#1B1204", border: "none",
      borderRadius: 10, padding: "11px 18px", fontWeight: 800, fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 8, opacity: disabled ? 0.7 : 1, ...style
    }}>{children}</button>
  );
}
function GhostButton({ children, onClick, tone, style }) {
  const colors = { green: COL_GREEN, red: COL_RED, sand: COL_MUTED };
  const c = colors[tone] || colors.sand;
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: c, border: `1px solid ${c}66`,
      borderRadius: 10, padding: "9px 14px", fontWeight: 700, fontSize: 13,
      cursor: "pointer", display: "flex", alignItems: "center", gap: 6, ...style
    }}>{children}</button>
  );
}
function IconButton({ icon: Icon, onClick, tone, title }) {
  const colors = { green: COL_GREEN, red: COL_RED, sand: COL_MUTED };
  const c = colors[tone] || colors.sand;
  return (
    <button onClick={onClick} title={title} style={{
      background: "transparent", border: `1px solid ${c}66`, color: c,
      width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer"
    }}><Icon size={14} /></button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: COL_CARD, border: `1px solid ${COL_BORDER}`, borderRadius: 16,
      padding: "20px 22px", ...style
    }}>{children}</div>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px", color: COL_MUTED,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8
    }}>
      <Icon size={28} color={COL_BORDER_SOFT} />
      <div style={{ fontWeight: 700, color: COL_TEXT, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{body}</div>
    </div>
  );
}

function DispatchPing() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: COL_ACCENT, fontSize: 13.5, fontWeight: 700 }}>
      <span style={{ position: "relative", width: 14, height: 14, display: "inline-block" }}>
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%", background: COL_ACCENT,
          opacity: 0.5, animation: "pingRing 1.1s ease-out infinite"
        }} />
        <span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: COL_ACCENT }} />
      </span>
      جاري البحث عن أقرب فني متاح...
    </div>
  );
}

function SaduPattern({ opacity = 0.5 }) {
  return (
    <svg width="100%" height="34" viewBox="0 0 240 34" preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", opacity }}>
      <defs>
        <pattern id="saduZig" width="24" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 34 L12 0 L24 34" fill="none" stroke={COL_ACCENT} strokeWidth="1.4" />
          <circle cx="12" cy="17" r="2" fill={COL_GREEN} />
        </pattern>
      </defs>
      <rect width="240" height="34" fill="url(#saduZig)" />
    </svg>
  );
}

function Emblem({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <rect x="1" y="1" width="32" height="32" rx="10" fill={COL_CARD} stroke={COL_BORDER} />
      <path d="M17 8 L26 15.5 V26 H21 V19 H13 V26 H8 V15.5 Z" fill={COL_ACCENT} />
      <circle cx="17" cy="15.2" r="1.6" fill={COL_BG} />
    </svg>
  );
}

function colToArray(snapshot) {
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default function App() {
  const [view, setView] = useState("landing");
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState({ t: false, c: false, r: false });

  const [customerSession, setCustomerSession] = useState(null);
  const [technicianSession, setTechnicianSession] = useState(null);
  const [adminIn, setAdminIn] = useState(false);

  useEffect(() => {
    const unsubT = onSnapshot(collection(db, "technicians"), snap => {
      setTechnicians(colToArray(snap));
      setLoaded(l => ({ ...l, t: true }));
    });
    const unsubC = onSnapshot(collection(db, "customers"), snap => {
      setCustomers(colToArray(snap));
      setLoaded(l => ({ ...l, c: true }));
    });
    const unsubR = onSnapshot(collection(db, "requests"), snap => {
      setRequests(colToArray(snap));
      setLoaded(l => ({ ...l, r: true }));
    });
    return () => { unsubT(); unsubC(); unsubR(); };
  }, []);

  const isLoaded = loaded.t && loaded.c && loaded.r;
  const approvedTechs = technicians.filter(t => t.status === "approved");

  function autoMatch(req, techList) {
    const pool = techList.filter(t =>
      t.status === "approved" && t.available &&
      t.region === req.region && overlap(t.specialties, req.specialties)
    );
    return pool[0] || null;
  }

  async function submitRequest(data) {
    const docRef = await addDoc(collection(db, "requests"), {
      ...data, status: "جديد", assignedTech: null, createdAt: new Date().toISOString()
    });
    setTimeout(async () => {
      const tech = autoMatch({ ...data }, technicians);
      if (tech) {
        await updateDoc(doc(db, "requests", docRef.id), { status: "قيد المعالجة", assignedTech: tech.name });
      }
    }, 1400);
    return docRef.id;
  }

  function claimRequest(reqId, techName) {
    updateDoc(doc(db, "requests", reqId), { status: "قيد المعالجة", assignedTech: techName });
  }
  function resolveRequest(reqId) {
    updateDoc(doc(db, "requests", reqId), { status: "تم الحل" });
  }
  function approveTech(id) {
    updateDoc(doc(db, "technicians", id), { status: "approved" });
  }
  function rejectTech(id) {
    updateDoc(doc(db, "technicians", id), { status: "rejected" });
  }
  function toggleAvailable(id, current) {
    updateDoc(doc(db, "technicians", id), { available: !current });
  }
  function updateTechnician(id, patch) {
    updateDoc(doc(db, "technicians", id), patch);
  }
  function deleteTechnician(id) {
    deleteDoc(doc(db, "technicians", id));
  }
  function updateCustomer(id, patch) {
    updateDoc(doc(db, "customers", id), patch);
  }
  function deleteCustomer(id) {
    deleteDoc(doc(db, "customers", id));
  }
  async function addCustomer(c) {
    const docRef = await addDoc(collection(db, "customers"), c);
    return { id: docRef.id, ...c };
  }
  async function addTechnician(t) {
    const docRef = await addDoc(collection(db, "technicians"), t);
    return { id: docRef.id, ...t };
  }

  const shell = {
    minHeight: 560,
    background: COL_BG,
    borderRadius: 20, border: `1px solid ${COL_BORDER}`,
    color: COL_TEXT, fontFamily: "'Tajawal','Segoe UI',Tahoma,Arial,sans-serif",
    direction: "rtl", overflow: "hidden", position: "relative"
  };

  return (
    <div style={shell} dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&family=Tajawal:wght@400;500;700&display=swap');
        @keyframes pingRing { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes floatIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .amh-title { font-family: 'Cairo', 'Tajawal', sans-serif; }
        table.amh-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        table.amh-table th { text-align: right; color: ${COL_MUTED}; font-weight: 700; padding: 8px 10px; border-bottom: 1px solid ${COL_BORDER}; font-size: 12px; }
        table.amh-table td { padding: 10px; border-bottom: 1px solid ${COL_BORDER_SOFT}; vertical-align: middle; }
        table.amh-table tr:last-child td { border-bottom: none; }
        .role-card { transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; animation: floatIn 0.5s ease both; }
        .role-card:hover { transform: translateY(-4px); border-color: ${COL_ACCENT}66; box-shadow: 0 14px 28px -14px rgba(0,0,0,0.5); }
        .amh-footlink { color: ${COL_MUTED}; opacity: 0.55; transition: opacity 0.2s ease; }
        .amh-footlink:hover { opacity: 1; }
        .wa-link { color: ${COL_GREEN}; text-decoration: none; }
        .wa-link:hover { text-decoration: underline; }
      `}</style>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 22px", borderBottom: `1px solid ${COL_BORDER}`, background: "#036966"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Emblem />
          <div className="amh-title" style={{ fontWeight: 800, fontSize: 16 }}>منصة فنيي المنازل الذكية · عمان</div>
        </div>
        {view !== "landing" && (
          <button onClick={() => { setView("landing"); setCustomerSession(null); setTechnicianSession(null); setAdminIn(false); }}
            style={{ background: "transparent", border: `1px solid ${COL_BORDER}`, color: COL_MUTED, borderRadius: 10, padding: "7px 12px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <LogOut size={14} /> خروج
          </button>
        )}
      </div>

      <div style={{ padding: 22 }}>
        {!isLoaded && (
          <div style={{ textAlign: "center", padding: "60px 10px", color: COL_MUTED, fontSize: 14 }}>
            جاري تحميل البيانات...
          </div>
        )}
        {isLoaded && view === "landing" && (
          <LandingView onPick={setView} />
        )}

        {isLoaded && view === "admin" && !adminIn && (
          <AdminLogin onSuccess={() => setAdminIn(true)} />
        )}
        {isLoaded && view === "admin" && adminIn && (
          <AdminDashboard
            technicians={technicians} customers={customers} requests={requests}
            approveTech={approveTech} rejectTech={rejectTech}
            updateTechnician={updateTechnician} deleteTechnician={deleteTechnician}
            updateCustomer={updateCustomer} deleteCustomer={deleteCustomer}
          />
        )}

        {isLoaded && view === "customer" && !customerSession && (
          <CustomerAuth customers={customers} addCustomer={addCustomer} onLogin={setCustomerSession} />
        )}
        {isLoaded && view === "customer" && customerSession && (
          <CustomerPortal
            customer={customers.find(c => c.id === customerSession.id) || customerSession}
            requests={requests.filter(r => r.phone === customerSession.phone)}
            submitRequest={submitRequest}
          />
        )}

        {isLoaded && view === "technician" && !technicianSession && (
          <TechnicianAuth technicians={technicians} addTechnician={addTechnician} onLogin={setTechnicianSession} />
        )}
        {isLoaded && view === "technician" && technicianSession && (
          <TechnicianPortal
            tech={technicians.find(t => t.id === technicianSession.id) || technicianSession}
            requests={requests}
            claimRequest={claimRequest}
            resolveRequest={resolveRequest}
            toggleAvailable={toggleAvailable}
          />
        )}
      </div>
    </div>
  );
}

function LandingView({ onPick }) {
  const cards = [
    {
      key: "customer", icon: User, title: "أنا عميل", accent: COL_GREEN,
      desc: "عندك مشكلة في نظامك الذكي؟ سجّل طلبك وخلّي أقرب فني يوصلك.",
      points: ["تسجيل الطلب في دقيقة", "توجيه تلقائي لأقرب فني", "متابعة حالة الطلب لحظة بلحظة"]
    },
    {
      key: "technician", icon: Wrench, title: "أنا فني", accent: COL_BLUE,
      desc: "انضم لشبكة الفنيين واستقبل طلبات العملاء في منطقتك وتخصصاتك.",
      points: ["طلبات فقط من منطقتك", "تحكم كامل بحالة توفرك", "بدون وسطاء، تواصل مباشر"]
    }
  ];
  return (
    <div>
      <div style={{ textAlign: "center", padding: "10px 10px 6px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(227,166,87,0.16)",
          color: COL_ACCENT, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 999, marginBottom: 16
        }}>
          <Sparkles size={13} /> أول شبكة عمانية لفنيي المنازل الذكية
        </div>
        <div className="amh-title" style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.45, marginBottom: 10 }}>
          عندك مشكلة تقنية؟<br />
          <span style={{ color: COL_ACCENT }}>أقرب فني عماني</span> بيوصلك خلال دقائق
        </div>
        <div style={{ color: COL_MUTED, fontSize: 14, maxWidth: 440, margin: "0 auto" }}>
          منصة توصل العملاء بالفنيين المتخصصين في كل محافظة — كاميرات، إنذار، إضاءة ذكية، شبكات وأكثر
        </div>
      </div>

      <div style={{ margin: "20px 0 24px" }}><SaduPattern opacity={0.6} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 26 }}>
        {cards.map((c, i) => (
          <button key={c.key} className="role-card" onClick={() => onPick(c.key)} style={{
            background: COL_CARD, border: `1px solid ${COL_BORDER}`, borderRadius: 18,
            padding: "26px 22px", cursor: "pointer", textAlign: "right", color: COL_TEXT,
            display: "flex", flexDirection: "column", gap: 12, animationDelay: `${i * 0.08}s`
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `${c.accent}26`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <c.icon size={23} color={c.accent} />
            </div>
            <div className="amh-title" style={{ fontWeight: 800, fontSize: 18 }}>{c.title}</div>
            <div style={{ fontSize: 13.5, color: COL_MUTED, lineHeight: 1.7 }}>{c.desc}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "4px 0" }}>
              {c.points.map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: COL_TEXT }}>
                  <CheckCircle2 size={13} color={c.accent} /> {p}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: c.accent, fontSize: 13.5, fontWeight: 800, marginTop: 4 }}>
              ابدأ الآن <ArrowRight size={15} style={{ transform: "scaleX(-1)" }} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button className="amh-footlink" onClick={() => onPick("admin")} style={{
          background: "none", border: "none", fontSize: 12, cursor: "pointer", padding: 4
        }}>دخول فريق الإدارة</button>
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  function attempt() {
    if (username === ADMIN_USERNAME && pass === ADMIN_PASSWORD) onSuccess();
    else setErr(true);
  }

  return (
    <Card style={{ maxWidth: 380, margin: "40px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <ShieldCheck size={20} color={COL_ACCENT} />
        <div className="amh-title" style={{ fontWeight: 800, fontSize: 16 }}>دخول الإدارة</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="اسم المستخدم">
          <TextInput value={username} onChange={e => { setUsername(e.target.value); setErr(false); }} placeholder="اسم المستخدم" />
        </Field>
        <Field label="الرقم السري">
          <TextInput type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(false); }} placeholder="الرقم السري" />
        </Field>
      </div>
      {err && <div style={{ color: COL_RED, fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> بيانات الدخول غير صحيحة</div>}
      <PrimaryButton style={{ marginTop: 16, width: "100%" }} onClick={attempt}>
        دخول
      </PrimaryButton>
    </Card>
  );
}

function TechEditForm({ tech, onSave, onCancel }) {
  const [name, setName] = useState(tech.name);
  const [phone, setPhone] = useState(tech.phone);
  const [region, setRegion] = useState(tech.region);
  const [wilayat, setWilayat] = useState(tech.wilayat);
  const [specialties, setSpecialties] = useState(tech.specialties);
  const [status, setStatus] = useState(tech.status);

  function toggleSpecialty(s) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  return (
    <Card style={{ marginBottom: 12, borderColor: COL_ACCENT }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="الاسم"><TextInput value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="الهاتف"><TextInput value={phone} onChange={e => setPhone(e.target.value)} /></Field>
        <Field label="المحافظة">
          <Select value={region} onChange={e => { setRegion(e.target.value); setWilayat(WILAYAT[e.target.value][0]); }}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="الولاية">
          <Select value={wilayat} onChange={e => setWilayat(e.target.value)}>
            {WILAYAT[region].map(w => <option key={w} value={w}>{w}</option>)}
          </Select>
        </Field>
        <Field label="الحالة">
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
          </Select>
        </Field>
      </div>
      <Field label="التخصصات">
        <MultiChoice options={SPECIALTIES} selected={specialties} onToggle={toggleSpecialty} accent={COL_BLUE} />
      </Field>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <PrimaryButton onClick={() => onSave({ name, phone, region, wilayat, specialties, status })}><Save size={14} /> حفظ</PrimaryButton>
        <GhostButton tone="sand" onClick={onCancel}><X size={14} /> إلغاء</GhostButton>
      </div>
    </Card>
  );
}

function CustomerEditForm({ customer, onSave, onCancel }) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [region, setRegion] = useState(customer.region);
  const [wilayat, setWilayat] = useState(customer.wilayat);

  return (
    <Card style={{ marginBottom: 12, borderColor: COL_ACCENT }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="الاسم"><TextInput value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="الهاتف"><TextInput value={phone} onChange={e => setPhone(e.target.value)} /></Field>
        <Field label="المحافظة">
          <Select value={region} onChange={e => { setRegion(e.target.value); setWilayat(WILAYAT[e.target.value][0]); }}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="الولاية">
          <Select value={wilayat} onChange={e => setWilayat(e.target.value)}>
            {WILAYAT[region].map(w => <option key={w} value={w}>{w}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <PrimaryButton onClick={() => onSave({ name, phone, region, wilayat })}><Save size={14} /> حفظ</PrimaryButton>
        <GhostButton tone="sand" onClick={onCancel}><X size={14} /> إلغاء</GhostButton>
      </div>
    </Card>
  );
}

function AdminDashboard({
  technicians, customers, requests, approveTech, rejectTech,
  updateTechnician, deleteTechnician, updateCustomer, deleteCustomer
}) {
  const [tab, setTab] = useState("overview");
  const [editingTechId, setEditingTechId] = useState(null);
  const [confirmDelTech, setConfirmDelTech] = useState(null);
  const [editingCustId, setEditingCustId] = useState(null);
  const [confirmDelCust, setConfirmDelCust] = useState(null);

  const pending = technicians.filter(t => t.status === "pending");
  const approved = technicians.filter(t => t.status === "approved");

  const coverage = REGIONS.map(r => ({
    region: r,
    count: approved.filter(t => t.region === r).length
  }));

  const statusTone = { "جديد": "amber", "قيد المعالجة": "sand", "تم الحل": "green" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard icon={ClipboardList} label="إجمالي الطلبات" value={requests.length} />
        <StatCard icon={Hourglass} label="طلبات جديدة" value={requests.filter(r => r.status === "جديد").length} accent={COL_ACCENT} />
        <StatCard icon={BadgeCheck} label="فنيون معتمدون" value={approved.length} accent={COL_GREEN} />
        <StatCard icon={Users} label="عدد العملاء" value={customers.length} accent={COL_BLUE} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[["overview", "نظرة عامة"], ["pending", `الفنيون الجدد (${pending.length})`], ["techs", "كل الفنيين"], ["customers", "العملاء"], ["requests", "كل الطلبات"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? COL_ACCENT : "transparent", color: tab === k ? "#1B1204" : COL_MUTED,
            border: `1px solid ${tab === k ? COL_ACCENT : COL_BORDER}`, borderRadius: 999, padding: "7px 16px",
            fontSize: 13, fontWeight: 700, cursor: "pointer"
          }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <div className="amh-title" style={{ fontWeight: 800, marginBottom: 14, fontSize: 15 }}>تغطية المحافظات</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
            {coverage.map(c => (
              <div key={c.region} style={{
                background: c.count === 0 ? "rgba(240,160,141,0.12)" : "#013C3C",
                border: `1px solid ${c.count === 0 ? "#6B4038" : COL_BORDER_SOFT}`,
                borderRadius: 12, padding: "12px 14px"
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{c.region}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: c.count === 0 ? COL_RED : COL_GREEN }}>{c.count}</span>
                  <span style={{ fontSize: 11.5, color: COL_MUTED }}>فني معتمد</span>
                </div>
                {c.count === 0 && <div style={{ fontSize: 11, color: COL_RED, marginTop: 4 }}>يحتاج تعزيز</div>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "pending" && (
        <Card>
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="لا يوجد طلبات انضمام" body="كل الفنيين تمت مراجعتهم" />
          ) : (
            <table className="amh-table">
              <thead><tr><th>الاسم</th><th>الهاتف</th><th>المنطقة</th><th>التخصصات</th><th>إجراء</th></tr></thead>
              <tbody>
                {pending.map(t => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td><WaPhoneLink phone={t.phone} message={`مرحباً ${t.name}، معك فريق إدارة المنصة`} /></td>
                    <td>{t.region} - {t.wilayat}</td><td>{t.specialties.join("، ")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <GhostButton tone="green" onClick={() => approveTech(t.id)}><CheckCircle2 size={14} /> اعتماد</GhostButton>
                        <GhostButton tone="red" onClick={() => rejectTech(t.id)}><XCircle size={14} /> رفض</GhostButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "techs" && (
        <div>
          {editingTechId && (
            <TechEditForm
              tech={technicians.find(t => t.id === editingTechId)}
              onSave={patch => { updateTechnician(editingTechId, patch); setEditingTechId(null); }}
              onCancel={() => setEditingTechId(null)}
            />
          )}
          <Card>
            {technicians.length === 0 ? (
              <EmptyState icon={Users} title="لا يوجد فنيون بعد" body="سيظهرون هنا بعد التسجيل من بوابة الفني" />
            ) : (
              <table className="amh-table">
                <thead><tr><th>الاسم</th><th>الهاتف</th><th>المنطقة</th><th>التخصصات</th><th>الحالة</th><th>متوفر؟</th><th>إجراء</th></tr></thead>
                <tbody>
                  {technicians.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td><WaPhoneLink phone={t.phone} message={`مرحباً ${t.name}، معك فريق إدارة المنصة`} /></td>
                      <td>{t.region} - {t.wilayat}</td><td>{t.specialties.join("، ")}</td>
                      <td><Badge tone={t.status === "approved" ? "green" : t.status === "pending" ? "amber" : "red"}>
                        {t.status === "approved" ? "معتمد" : t.status === "pending" ? "قيد المراجعة" : "مرفوض"}
                      </Badge></td>
                      <td>{t.available ? <Badge tone="green">متاح</Badge> : <Badge tone="sand">غير متاح</Badge>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <IconButton icon={Pencil} tone="sand" title="تعديل" onClick={() => setEditingTechId(t.id)} />
                          {confirmDelTech === t.id ? (
                            <GhostButton tone="red" onClick={() => { deleteTechnician(t.id); setConfirmDelTech(null); }}>تأكيد الحذف</GhostButton>
                          ) : (
                            <IconButton icon={Trash2} tone="red" title="حذف" onClick={() => setConfirmDelTech(t.id)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {tab === "customers" && (
        <div>
          {editingCustId && (
            <CustomerEditForm
              customer={customers.find(c => c.id === editingCustId)}
              onSave={patch => { updateCustomer(editingCustId, patch); setEditingCustId(null); }}
              onCancel={() => setEditingCustId(null)}
            />
          )}
          <Card>
            {customers.length === 0 ? (
              <EmptyState icon={Users} title="لا يوجد عملاء بعد" body="سيظهرون هنا بعد التسجيل من بوابة العميل" />
            ) : (
              <table className="amh-table">
                <thead><tr><th>الاسم</th><th>الهاتف</th><th>المنطقة</th><th>الولاية</th><th>إجراء</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td><WaPhoneLink phone={c.phone} message={`مرحباً ${c.name}، معك فريق إدارة المنصة`} /></td>
                      <td>{c.region}</td><td>{c.wilayat}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <IconButton icon={Pencil} tone="sand" title="تعديل" onClick={() => setEditingCustId(c.id)} />
                          {confirmDelCust === c.id ? (
                            <GhostButton tone="red" onClick={() => { deleteCustomer(c.id); setConfirmDelCust(null); }}>تأكيد الحذف</GhostButton>
                          ) : (
                            <IconButton icon={Trash2} tone="red" title="حذف" onClick={() => setConfirmDelCust(c.id)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {tab === "requests" && (
        <Card>
          {requests.length === 0 ? (
            <EmptyState icon={ClipboardList} title="لا توجد طلبات بعد" body="ستظهر هنا طلبات العملاء فور تسجيلها" />
          ) : (
            <table className="amh-table">
              <thead><tr><th>العميل</th><th>المنطقة</th><th>المشكلة</th><th>الفني المكلف</th><th>الحالة</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>{r.customerName}</td><td>{r.region} - {r.wilayat}</td><td>{r.problem}</td>
                    <td>{r.assignedTech || "—"}</td>
                    <td><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

function CustomerAuth({ customers, addCustomer, onLogin }) {
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [found, setFound] = useState(undefined);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);

  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [wilayat, setWilayat] = useState(WILAYAT[REGIONS[0]][0]);

  function checkPhone() {
    const existing = customers.find(c => c.phone === phone.trim());
    setFound(existing || null);
    setChecking(true);
  }

  function login() {
    if (found.password === password) onLogin(found);
    else setErr(true);
  }

  async function register() {
    const c = { name, phone, password: newPassword, region, wilayat };
    const created = await addCustomer(c);
    onLogin(created);
  }

  return (
    <Card style={{ maxWidth: 440, margin: "20px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <User size={20} color={COL_GREEN} />
        <div className="amh-title" style={{ fontWeight: 800, fontSize: 16 }}>بوابة العميل</div>
      </div>

      {!checking && (
        <>
          <Field label="رقم الواتساب"><TextInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="9XXXXXXX" /></Field>
          <PrimaryButton style={{ marginTop: 14, width: "100%" }} disabled={phone.trim().length < 8} onClick={checkPhone}>متابعة</PrimaryButton>
        </>
      )}

      {checking && found && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13.5, color: COL_MUTED, margin: 0 }}>مرحبًا مجددًا <b style={{ color: COL_TEXT }}>{found.name}</b>، أدخل كلمة المرور:</p>
          <Field label="كلمة المرور"><TextInput type="password" value={password} onChange={e => { setPassword(e.target.value); setErr(false); }} placeholder="••••••" /></Field>
          {err && <div style={{ color: COL_RED, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> كلمة المرور غير صحيحة</div>}
          <PrimaryButton onClick={login}>دخول</PrimaryButton>
        </div>
      )}

      {checking && found === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: COL_MUTED, margin: 0 }}>لا يوجد حساب بهذا الرقم، أنشئ حسابك الآن:</p>
          <Field label="الاسم"><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" /></Field>
          <Field label="كلمة مرور"><TextInput type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="اختر كلمة مرور" /></Field>
          <Field label="المحافظة">
            <Select value={region} onChange={e => { setRegion(e.target.value); setWilayat(WILAYAT[e.target.value][0]); }}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="الولاية">
            <Select value={wilayat} onChange={e => setWilayat(e.target.value)}>
              {WILAYAT[region].map(w => <option key={w} value={w}>{w}</option>)}
            </Select>
          </Field>
          <PrimaryButton disabled={!name.trim() || newPassword.length < 3} onClick={register}>
            إنشاء الحساب <ArrowRight size={15} style={{ transform: "scaleX(-1)" }} />
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

function CustomerPortal({ customer, requests, submitRequest }) {
  const [showForm, setShowForm] = useState(requests.length === 0);
  const [wilayat, setWilayat] = useState(customer.wilayat);
  const [specialties, setSpecialties] = useState([]);
  const [problem, setProblem] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(null);

  const statusTone = { "جديد": "amber", "قيد المعالجة": "sand", "تم الحل": "green" };

  function toggleSpecialty(s) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSubmit() {
    if (!problem.trim() || specialties.length === 0) return;
    const id = await submitRequest({
      customerName: customer.name, phone: customer.phone, region: customer.region,
      wilayat, specialties, problem, urgent
    });
    setJustSubmitted(id);
    setProblem("");
    setSpecialties([]);
    setShowForm(false);
  }

  const activeReq = requests.find(r => r.id === justSubmitted);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="amh-title" style={{ fontWeight: 800, fontSize: 17 }}>مرحبًا، {customer.name}</div>
          <div style={{ fontSize: 12.5, color: COL_MUTED, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <MapPin size={13} /> {customer.region}
          </div>
        </div>
        <PrimaryButton onClick={() => setShowForm(s => !s)}><Plus size={15} /> طلب جديد</PrimaryButton>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 18 }}>
          <div className="amh-title" style={{ fontWeight: 800, marginBottom: 12, fontSize: 15 }}>تفاصيل الطلب</div>
          <div style={{ marginBottom: 12 }}>
            <Field label="الولاية">
              <Select value={wilayat} onChange={e => setWilayat(e.target.value)}>
                {WILAYAT[customer.region].map(w => <option key={w} value={w}>{w}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Field label="نوع/أنواع المشكلة (يمكن اختيار أكثر من نوع)">
              <MultiChoice options={SPECIALTIES} selected={specialties} onToggle={toggleSpecialty} accent={COL_GREEN} />
            </Field>
          </div>
          <div>
            <Field label="وصف المشكلة">
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
                placeholder="اشرح المشكلة بالتفصيل..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </Field>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13.5, color: COL_TEXT, cursor: "pointer" }}>
            <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} />
            الحالة عاجلة
          </label>
          <PrimaryButton style={{ marginTop: 16 }} disabled={!problem.trim() || specialties.length === 0} onClick={handleSubmit}>
            إرسال الطلب
          </PrimaryButton>
        </Card>
      )}

      {activeReq && activeReq.status === "جديد" && (
        <Card style={{ marginBottom: 18 }}><DispatchPing /></Card>
      )}

      <div className="amh-title" style={{ fontWeight: 800, marginBottom: 10, fontSize: 15 }}>طلباتي</div>
      {requests.length === 0 ? (
        <Card><EmptyState icon={ClipboardList} title="لا توجد طلبات بعد" body="أرسل أول طلب مساعدة من الزر أعلاه" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.map(r => (
            <Card key={r.id}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.problem}</div>
                  <div style={{ fontSize: 12.5, color: COL_MUTED, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span><MapPin size={12} style={{ verticalAlign: -1 }} /> {r.wilayat}</span>
                    <span>{r.specialties.join("، ")}</span>
                    {r.urgent && <Badge tone="red">عاجل</Badge>}
                  </div>
                </div>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </div>
              {r.assignedTech && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COL_BORDER_SOFT}`, fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: COL_GREEN }}>
                  <Wrench size={14} /> الفني المكلف: {r.assignedTech}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TechnicianAuth({ technicians, addTechnician, onLogin }) {
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [found, setFound] = useState(undefined);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);

  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [wilayat, setWilayat] = useState(WILAYAT[REGIONS[0]][0]);
  const [specialties, setSpecialties] = useState([]);

  function toggleSpecialty(s) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function checkPhone() {
    const existing = technicians.find(t => t.phone === phone.trim());
    setFound(existing || null);
    setChecking(true);
  }

  function login() {
    if (found.password === password) onLogin(found);
    else setErr(true);
  }

  async function register() {
    const t = { name, phone, password: newPassword, region, wilayat, specialties, status: "pending", available: true };
    const created = await addTechnician(t);
    onLogin(created);
  }

  return (
    <Card style={{ maxWidth: 460, margin: "20px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Wrench size={20} color={COL_BLUE} />
        <div className="amh-title" style={{ fontWeight: 800, fontSize: 16 }}>بوابة الفني</div>
      </div>

      {!checking && (
        <>
          <Field label="رقم الواتساب"><TextInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="9XXXXXXX" /></Field>
          <PrimaryButton style={{ marginTop: 14, width: "100%" }} disabled={phone.trim().length < 8} onClick={checkPhone}>متابعة</PrimaryButton>
        </>
      )}

      {checking && found && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13.5, color: COL_MUTED, margin: 0 }}>مرحبًا مجددًا <b style={{ color: COL_TEXT }}>{found.name}</b>، أدخل كلمة المرور:</p>
          <Field label="كلمة المرور"><TextInput type="password" value={password} onChange={e => { setPassword(e.target.value); setErr(false); }} placeholder="••••••" /></Field>
          {err && <div style={{ color: COL_RED, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> كلمة المرور غير صحيحة</div>}
          <PrimaryButton onClick={login}>دخول</PrimaryButton>
        </div>
      )}

      {checking && found === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: COL_MUTED, margin: 0 }}>لا يوجد حساب بهذا الرقم، سجّل بياناتك للانضمام:</p>
          <Field label="الاسم"><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" /></Field>
          <Field label="كلمة مرور"><TextInput type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="اختر كلمة مرور" /></Field>
          <Field label="المحافظة">
            <Select value={region} onChange={e => { setRegion(e.target.value); setWilayat(WILAYAT[e.target.value][0]); }}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="الولاية">
            <Select value={wilayat} onChange={e => setWilayat(e.target.value)}>
              {WILAYAT[region].map(w => <option key={w} value={w}>{w}</option>)}
            </Select>
          </Field>
          <Field label="التخصصات (يمكن اختيار أكثر من تخصص)">
            <MultiChoice options={SPECIALTIES} selected={specialties} onToggle={toggleSpecialty} accent={COL_BLUE} />
          </Field>
          <PrimaryButton disabled={!name.trim() || newPassword.length < 3 || specialties.length === 0} onClick={register}>
            إرسال طلب الانضمام
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

function TechnicianPortal({ tech, requests, claimRequest, resolveRequest, toggleAvailable }) {
  if (tech.status === "pending") {
    return (
      <Card style={{ maxWidth: 420, margin: "30px auto" }}>
        <EmptyState icon={Hourglass} title="طلبك قيد المراجعة" body="سيقوم فريق الإدارة بمراجعة بياناتك واعتمادها قريبًا" />
      </Card>
    );
  }
  if (tech.status === "rejected") {
    return (
      <Card style={{ maxWidth: 420, margin: "30px auto" }}>
        <EmptyState icon={XCircle} title="لم يتم اعتماد طلبك" body="تواصل مع الإدارة لمزيد من التفاصيل" />
      </Card>
    );
  }

  const open = requests.filter(r => !r.assignedTech && r.region === tech.region);
  const mine = requests.filter(r => r.assignedTech === tech.name);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div className="amh-title" style={{ fontWeight: 800, fontSize: 17 }}>مرحبًا، {tech.name}</div>
          <div style={{ fontSize: 12.5, color: COL_MUTED, marginTop: 4 }}>{tech.region} · {tech.specialties.join("، ")}</div>
        </div>
        <GhostButton tone={tech.available ? "green" : "sand"} onClick={() => toggleAvailable(tech.id, tech.available)}>
          <Power size={14} /> {tech.available ? "متاح الآن" : "غير متاح"}
        </GhostButton>
      </div>

      <div className="amh-title" style={{ fontWeight: 800, marginBottom: 10, fontSize: 15 }}>طلبات في منطقتك ({open.length})</div>
      {open.length === 0 ? (
        <Card style={{ marginBottom: 20 }}><EmptyState icon={Radar} title="لا توجد طلبات مفتوحة حاليًا" body="ستظهر هنا الطلبات الجديدة في منطقتك" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {open.map(r => (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.problem}</div>
                  <div style={{ fontSize: 12.5, color: COL_MUTED, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span><MapPin size={12} style={{ verticalAlign: -1 }} /> {r.wilayat}</span>
                    <span>{r.specialties.join("، ")}</span>
                    {r.urgent && <Badge tone="red">عاجل</Badge>}
                    {overlap(r.specialties, tech.specialties) && <Badge tone="green">يطابق تخصصك</Badge>}
                  </div>
                </div>
                <PrimaryButton onClick={() => claimRequest(r.id, tech.name)}>استلام</PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="amh-title" style={{ fontWeight: 800, marginBottom: 10, fontSize: 15 }}>طلباتي الحالية ({mine.filter(r => r.status !== "تم الحل").length})</div>
      {mine.filter(r => r.status !== "تم الحل").length === 0 ? (
        <Card><EmptyState icon={ClipboardList} title="لا توجد طلبات مستلمة" body="استلم طلبًا من القائمة أعلاه للبدء" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mine.filter(r => r.status !== "تم الحل").map(r => (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.problem}</div>
                  <div style={{ fontSize: 12.5, color: COL_MUTED, marginTop: 4 }}>{r.wilayat}</div>
                  <a className="wa-link" href={waLink(r.phone, `مرحباً ${r.customerName}، أنا الفني المسؤول عن طلبك بخصوص: ${r.problem}`)}
                    target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, fontWeight: 700 }}>
                    <MessageCircle size={15} /> {r.phone} — تواصل عبر واتساب
                  </a>
                </div>
                <GhostButton tone="green" onClick={() => resolveRequest(r.id)}><CheckCircle2 size={14} /> تم الحل</GhostButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

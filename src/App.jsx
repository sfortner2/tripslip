import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { Plus, Trash2, Pencil, Download, Route, MapPin, Settings, X, Check, AlertCircle, Car, Compass, ChevronLeft, ChevronRight, Repeat, Mail, Globe } from "lucide-react";

/* ---------- constants ---------- */

// Get a free token at mapbox.com (100k free geocoding + 100k free directions
// requests/month as of 2026 — covers real beta use, not just testing).
// Paste your PUBLIC token below — it starts with "pk.". Mapbox public tokens are
// meant to live in client-side code like this; just add a URL restriction in your
// Mapbox account (Tokens page) limiting it to your deployed domain, so it can't be
// copied and used elsewhere.
const MAPBOX_TOKEN = "pk.eyJ1Ijoic2ZvcnRuZXIyIiwiYSI6ImNtczl1c2RndTB1dmwyenByOHI5amM1NnkifQ.Cuhyt8AYqL9h5NCGwX3tfg";

/* ---------- language / translation ----------
   Covers the daily driving flow (greeting, start day, pickup, end day,
   switch gig, day-complete). Settings/onboarding/monthly summary still
   render in English for now — a good next pass once this is tested. */

const STRINGS = {
  en: {
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    whatShouldWeCallYou: "What should we call you?", firstName: "First name", notYouEditName: "not you? edit name",
    whichGigToday: "Which gig job are we tracking today?", personalDriving: "Personal driving",
    skipShowApp: "Skip — just show me the app",
    beforeYouHeadOut: "Before you head out",
    startDaySubFlex: "Enter today's starting odometer reading. You'll log one more reading when you arrive at pickup, and one more at your last drop — that's it.",
    startDaySubOther: "Enter today's starting odometer reading. You'll log one more reading when you're back home at the end of your shift — that's it.",
    startingOdometer: "Starting odometer (leaving home)", startTime: "Start time",
    scheduledBlockLength: "Scheduled block length in hours (optional)",
    scheduledBlockHelp: "If you log this, TripSlip will show you scheduled vs. actual time when the block ends.",
    vehicle: "Vehicle", selectVehicle: "Select a vehicle…",
    claimingHomeOffice: "Claiming a qualifying home office today",
    startMyDay: "Start my day", skipLogManually: "Skip — I'll log trips manually",
    arrivedAtPickup: "Arrived at pickup", pickupOdometer: "Odometer at pickup",
    odometerNow: "Odometer now", startedTodayAt: "Started today at",
    whichDistCenter: "Which distribution center?",
    whichStation: "Which station / distribution point?", selectLocation: "Select a location…",
    logArrival: "Log arrival", cancel: "Cancel",
    endDayFinalDrop: "End day / final drop", endDayBackHome: "End day — back home",
    odometerLastDrop: "Odometer at last drop", odometerEndingHome: "Ending odometer (back home)",
    endTime: "End time", worked: "worked", scheduledFor: "scheduled for", over: "over", under: "under",
    blockRanLong: "This block ran long", dontForgetReachOut: "Don't forget to reach out about payment for the extra",
    amazonWants: "Amazon Flex Support generally wants the block's starting point, starting time, and why the extra time was needed.",
    whyLonger: "Why did it take longer? (optional, goes in the email)",
    whyLongerPlaceholder: "e.g. heavy traffic, apartment complex with no gate code, unusually high stop count…",
    draftEmailSupport: "Draft email to Amazon Flex Support",
    revenueForDay: "Revenue for", optional: "optional", finishDay: "Finish day", discardDay: "Discard this day",
    switchGig: "Switch gig", switchGigSub: "Closes out your {platform} miles right where you are now — no return leg, since you're driving straight into the next gig instead of heading back. The next shift picks up from this same odometer reading.",
    odometerRightNow: "Odometer right now", timeNow: "Time now",
    revenueFromShift: "Revenue from this {platform} shift (optional)",
    milesClosedOut: "Miles closed out", startingNextGig: "Starting your next gig", whichPlatform: "Which platform?",
    switchGigsBtn: "Switch gigs", onPlatform: "on",
    dayComplete: "Day complete", niceWorkToday: "Nice work today", stillCashPositive: "Still cash-flow positive",
    cashPositiveSub: "Today's accounting loss is mostly vehicle depreciation, not money out of pocket — that's normal, not a bad day.",
    slowerDay: "A slower day",
    slowerDaySub: "One day doesn't define the month — worth watching the trend in your Monthly Summary rather than today alone.",
    revenueLogged: "revenue logged", milesToday: "miles today", accountingPL: "accounting p/l",
    hoursWorkedLabel: "worked", scheduled: "scheduled", ranOverBy: "ran over by", underBy: "under by",
    dontForget: "Don't forget", reachOutExtra: "Reach out to request payment for the extra", thisBlockTook: "this block took.",
    draftTheEmail: "Draft the email", done: "Done",
    langToggle: "ES",
    endYourDay: "End your day", home: "Home", pickup: "pickup", startedAt: "Started at",
    noDepotOrHome: "No depot or home address on file — add one under Places, or enter the return miles manually below.",
    gettingLocation: "Getting your location…",
    locating: "Locating…", calculateReturn: "Calculate return (home or depot, whichever's closer)",
    returnVia: "Return via", orEnterManually: "Or enter return miles manually",
    couldntAutoCalc: "Couldn't auto-calc the return", enterManuallyInstead: "enter it manually below instead.",
    revenueFromThisShift: "Revenue from this shift", alreadyLogged: "Already logged",
    forDate: "for", shiftAddedToThat: "this shift's amount will be added to that.",
    totalDeductibleMiles: "Total deductible miles", estDeduction: "Est. deduction (accounting)",
    revenue: "revenue", deduction: "deduction", accountingPLToday: "Accounting P/L today",
    cashPLToday: "Cash P/L today", perHourWorked: "Per hour worked", discardThisDay: "Discard this day",
  },
  es: {
    goodMorning: "Buenos días", goodAfternoon: "Buenas tardes", goodEvening: "Buenas noches",
    whatShouldWeCallYou: "¿Cómo te llamas?", firstName: "Nombre", notYouEditName: "¿no eres tú? editar nombre",
    whichGigToday: "¿Qué trabajo vas a registrar hoy?", personalDriving: "Conducción personal",
    skipShowApp: "Omitir — solo muéstrame la app",
    beforeYouHeadOut: "Antes de salir",
    startDaySubFlex: "Ingresa la lectura inicial del odómetro de hoy. Registrarás otra lectura al llegar al punto de recogida, y otra en tu última entrega — eso es todo.",
    startDaySubOther: "Ingresa la lectura inicial del odómetro de hoy. Registrarás otra lectura cuando regreses a casa al final de tu turno — eso es todo.",
    startingOdometer: "Odómetro inicial (al salir de casa)", startTime: "Hora de inicio",
    scheduledBlockLength: "Duración programada del bloque en horas (opcional)",
    scheduledBlockHelp: "Si registras esto, TripSlip te mostrará el tiempo programado frente al real cuando termine el bloque.",
    vehicle: "Vehículo", selectVehicle: "Selecciona un vehículo…",
    claimingHomeOffice: "Reclamando una oficina en casa calificada hoy",
    startMyDay: "Comenzar mi día", skipLogManually: "Omitir — registraré los viajes manualmente",
    arrivedAtPickup: "Llegada al punto de recogida", pickupOdometer: "Odómetro en la recogida",
    odometerNow: "Odómetro ahora", startedTodayAt: "Comenzó hoy en",
    whichDistCenter: "¿Qué centro de distribución?",
    whichStation: "¿Qué estación / punto de distribución?", selectLocation: "Selecciona una ubicación…",
    logArrival: "Registrar llegada", cancel: "Cancelar",
    endDayFinalDrop: "Terminar día / última entrega", endDayBackHome: "Terminar día — de vuelta en casa",
    odometerLastDrop: "Odómetro en la última entrega", odometerEndingHome: "Odómetro final (de vuelta en casa)",
    endTime: "Hora de finalización", worked: "trabajado", scheduledFor: "programado para", over: "de más", under: "de menos",
    blockRanLong: "Este bloque se extendió", dontForgetReachOut: "No olvides comunicarte para pedir el pago por el tiempo extra de",
    amazonWants: "Amazon Flex Support generalmente pide el punto de inicio del bloque, la hora de inicio, y por qué se necesitó tiempo extra.",
    whyLonger: "¿Por qué tardó más? (opcional, se incluye en el correo)",
    whyLongerPlaceholder: "ej. tráfico pesado, edificio sin código de acceso, número inusual de paradas…",
    draftEmailSupport: "Redactar correo a Amazon Flex Support",
    revenueForDay: "Ingresos del", optional: "opcional", finishDay: "Terminar día", discardDay: "Descartar este día",
    switchGig: "Cambiar de trabajo", switchGigSub: "Cierra tus millas de {platform} justo donde estás ahora — sin tramo de regreso, ya que vas directo al siguiente trabajo en lugar de volver. El siguiente turno continúa desde esta misma lectura de odómetro.",
    odometerRightNow: "Odómetro en este momento", timeNow: "Hora actual",
    revenueFromShift: "Ingresos de este turno de {platform} (opcional)",
    milesClosedOut: "Millas cerradas", startingNextGig: "Comenzando tu siguiente trabajo", whichPlatform: "¿Qué plataforma?",
    switchGigsBtn: "Cambiar de trabajo", onPlatform: "en",
    dayComplete: "Día completado", niceWorkToday: "Buen trabajo hoy", stillCashPositive: "Sigues positivo en efectivo",
    cashPositiveSub: "La pérdida contable de hoy es principalmente depreciación del vehículo, no dinero que salió de tu bolsillo — eso es normal, no un mal día.",
    slowerDay: "Un día más lento",
    slowerDaySub: "Un día no define el mes — vale la pena observar la tendencia en tu Resumen Mensual en lugar de solo hoy.",
    revenueLogged: "de ingresos registrados", milesToday: "millas hoy", accountingPL: "p/l contable",
    hoursWorkedLabel: "trabajado", scheduled: "programado", ranOverBy: "se excedió por", underBy: "quedó por debajo por",
    dontForget: "No olvides", reachOutExtra: "Comunícate para pedir el pago por el tiempo extra de", thisBlockTook: "que tomó este bloque.",
    draftTheEmail: "Redactar el correo", done: "Listo",
    langToggle: "EN",
    endYourDay: "Termina tu día", home: "Casa", pickup: "recogida", startedAt: "Comenzó en",
    noDepotOrHome: "No hay dirección de depósito ni de casa registrada — agrega una en Lugares, o ingresa las millas de regreso manualmente abajo.",
    gettingLocation: "Obteniendo tu ubicación…",
    locating: "Localizando…", calculateReturn: "Calcular regreso (casa o depósito, lo que esté más cerca)",
    returnVia: "Regreso vía", orEnterManually: "O ingresa las millas de regreso manualmente",
    couldntAutoCalc: "No se pudo calcular el regreso automáticamente", enterManuallyInstead: "ingrésalo manualmente abajo.",
    revenueFromThisShift: "Ingresos de este turno", alreadyLogged: "Ya se registraron",
    forDate: "para el", shiftAddedToThat: "el monto de este turno se sumará a eso.",
    totalDeductibleMiles: "Millas deducibles totales", estDeduction: "Deducción estimada (contable)",
    revenue: "ingresos", deduction: "deducción", accountingPLToday: "P/L contable de hoy",
    cashPLToday: "P/L en efectivo de hoy", perHourWorked: "Por hora trabajada", discardThisDay: "Descartar este día",
  },
};

const LanguageContext = createContext({ lang: "en", t: (k) => STRINGS.en[k] || k, toggleLang: () => {} });

function useT() {
  return useContext(LanguageContext);
}

const PLATFORMS = [
  { id: "amazonflex", label: "Amazon Flex", color: "#00A8E1" },
  { id: "uber", label: "Uber", color: "#2FC7AC" },
  { id: "lyft", label: "Lyft", color: "#F5A623" },
  { id: "doordash", label: "DoorDash", color: "#E85C4A" },
  { id: "instacart", label: "Instacart", color: "#4FA6E8" },
  { id: "grubhub", label: "Grubhub", color: "#9B6FE0" },
  { id: "personal", label: "Personal", color: "#9C9385" },
  { id: "other", label: "Other", color: "#6B6459" },
];

// IRS optional standard mileage rate, business use. 2026 had a mid-year change.
const RATE_TIERS = [
  { from: "2026-07-01", rate: 0.76 },
  { from: "2026-01-01", rate: 0.725 },
  { from: "2025-01-01", rate: 0.70 },
];

function rateForDate(dateStr, customRate) {
  if (customRate != null) return customRate;
  const t = RATE_TIERS.find((r) => dateStr >= r.from) || RATE_TIERS[RATE_TIERS.length - 1];
  return t.rate;
}

// Of the IRS full per-mile rate, a portion is depreciation — a real cost, but not
// cash leaving your pocket day to day. The IRS set this at 35¢/mi for 2026 (Notice 2026-10).
// No separate figure was published alongside the July 2026 mid-year rate bump, so this
// is applied as an estimate there too — it's editable in Settings.
const DEFAULT_DEPRECIATION_PER_MILE = 0.35;

function cashRateForDate(dateStr, settings) {
  const full = rateForDate(dateStr, settings.customRate);
  const dep = settings.depreciationRate != null ? settings.depreciationRate : DEFAULT_DEPRECIATION_PER_MILE;
  return Math.max(0, full - dep);
}

function platformMeta(id) {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[PLATFORMS.length - 1];
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Decimal hours between two "HH:MM" clock times, wrapping past midnight if the end
// time is earlier than the start time (e.g. a block that runs past 12am).
function hoursBetween(startHHMM, endHHMM) {
  if (!startHHMM || !endHHMM) return null;
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  if (!isFinite(sh) || !isFinite(sm) || !isFinite(eh) || !isFinite(em)) return null;
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

function formatHours(h) {
  if (h == null || !isFinite(h)) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function vehicleLabel(v) {
  if (!v) return "";
  return v.nickname ? v.nickname : `${v.year || ""} ${v.make || ""} ${v.model || ""}`.trim();
}

function overtimeMailtoLink({ date, scheduledHours, hoursWorked, pickupLocation, startTime, reason }) {
  const overage = hoursWorked - scheduledHours;
  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const subject = `Extra time required to complete block on ${dateLabel}`;
  const body =
    `Hi,\n\n` +
    `My Amazon Flex block on ${dateLabel} was scheduled for ${scheduledHours.toFixed(2)} hours but took ${hoursWorked.toFixed(2)} hours to complete — ${overage.toFixed(2)} hours longer than scheduled.\n\n` +
    `Block starting point: ${pickupLocation || "[enter station]"}\n` +
    `Block starting time: ${startTime || "[enter start time]"}\n\n` +
    `Reason extra time was needed: ${reason && reason.trim() ? reason.trim() : "[explain what caused the delay]"}\n\n` +
    `I'd like to request payment for the additional time. Please let me know what's needed on my end.\n\n` +
    `Thanks,\n`;
  return `mailto:amazonflex-support@amazon.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ---------- storage ----------
   Uses the browser's own localStorage — works on any real hosting (Vercel, Netlify,
   GitHub Pages, etc.), not just inside Claude's preview. Data lives on-device, per
   browser. Swap these functions out later if you move to a real account/cloud backend. */

function lsGet(key) {
  try {
    const v = localStorage.getItem(key);
    return v != null ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}
function lsDelete(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

async function loadTrips() {
  return lsGet("tripslip:trips") || [];
}
async function saveTrips(trips) {
  lsSet("tripslip:trips", trips);
}
async function loadSettings() {
  const fallback = { customRate: null, depreciationRate: null, homeOfficeDefault: false, homeAddress: "", onboardingComplete: false, userName: "" };
  return lsGet("tripslip:settings") || fallback;
}
async function saveSettings(s) {
  lsSet("tripslip:settings", s);
}
async function loadRevenue() {
  return lsGet("tripslip:revenue") || {};
}
async function saveRevenue(rev) {
  lsSet("tripslip:revenue", rev);
}
async function loadPlaces() {
  return lsGet("tripslip:places") || [];
}
async function savePlaces(places) {
  lsSet("tripslip:places", places);
}
async function loadVehicles() {
  return lsGet("tripslip:vehicles") || [];
}
async function saveVehicles(vehicles) {
  lsSet("tripslip:vehicles", vehicles);
}
async function loadActiveDay() {
  return lsGet("tripslip:activeday");
}
async function saveActiveDay(day) {
  if (day) lsSet("tripslip:activeday", day);
  else lsDelete("tripslip:activeday");
}

/* ---------- geocoding / routing ---------- */

async function geocode(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?limit=1&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("geocode failed");
  const data = await res.json();
  if (!data.features || !data.features[0]) throw new Error(`Couldn't find "${address}"`);
  const [lon, lat] = data.features[0].center;
  return { lat, lon };
}

async function routeMiles(a, b) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("routing failed");
  const data = await res.json();
  if (!data.routes || !data.routes[0]) throw new Error("no route found");
  return data.routes[0].distance / 1609.344;
}

async function reverseGeocode(lat, lon) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("reverse geocode failed");
  const data = await res.json();
  if (!data.features || !data.features[0]) throw new Error("no address found for this location");
  return data.features[0].place_name;
}

function getCurrentAddress() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location isn't available in this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          resolve(addr);
        } catch (e) {
          reject(e);
        }
      },
      () => reject(new Error("Location permission denied")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/* ---------- odometer ---------- */

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    function tick(ts) {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function useFlip(value) {
  const [flip, setFlip] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setFlip(true);
      const t = setTimeout(() => setFlip(false), 320);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return flip;
}

function Odometer({ value, digits = 6, decimals = 1, glow = "#F5A623" }) {
  const fixed = Math.max(0, value).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const padded = intPart.padStart(digits, "0");
  const chars = padded.split("");
  const flip = useFlip(fixed);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#0D1015",
        border: "1px solid #262A31",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: flip
          ? `inset 0 2px 6px rgba(0,0,0,0.6), 0 0 26px ${glow}88, 0 0 4px ${glow}`
          : "inset 0 2px 6px rgba(0,0,0,0.6)",
        transition: "box-shadow 320ms ease",
      }}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 32,
            fontWeight: 700,
            width: 22,
            textAlign: "center",
            color: glow,
            display: "inline-block",
            borderRight: i < chars.length - 1 ? "1px solid #232B38" : "none",
            transform: flip ? "translateY(-3px) scale(1.05)" : "translateY(0) scale(1)",
            transition: "transform 260ms cubic-bezier(.34,1.4,.64,1)",
            textShadow: flip ? `0 0 14px ${glow}` : `0 0 8px ${glow}66`,
          }}
        >
          {c}
        </span>
      ))}
      {decimals > 0 && (
        <>
          <span style={{ color: "#4A5058", fontFamily: "'Space Mono', monospace", fontSize: 24, margin: "0 1px" }}>.</span>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 24,
              fontWeight: 700,
              color: glow,
              width: 18,
              textAlign: "center",
              display: "inline-block",
              textShadow: `0 0 8px ${glow}66`,
            }}
          >
            {decPart}
          </span>
        </>
      )}
    </div>
  );
}

/* ---------- main app ---------- */

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("tripslip:lang") || "en");
  const [trips, setTrips] = useState([]);
  const [settings, setSettings] = useState({ customRate: null, depreciationRate: null, homeOfficeDefault: false, homeAddress: "", onboardingComplete: false });
  const [revenue, setRevenue] = useState({}); // { "YYYY-MM-DD": amount }
  const [places, setPlaces] = useState([]); // [{ id, code, label, address, type }]
  const [vehicles, setVehicles] = useState([]); // [{ id, year, make, model, datePlacedInService, nickname }]
  const [loaded, setLoaded] = useState(false);
  const [monthFilter, setMonthFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaces, setShowPlaces] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showStartDay, setShowStartDay] = useState(false);
  const [showPickupArrival, setShowPickupArrival] = useState(false);
  const [showEndDay, setShowEndDay] = useState(false);
  const [showSwitchGig, setShowSwitchGig] = useState(false);
  const [activeGigPlatform, setActiveGigPlatform] = useState("");
  const [activeDay, setActiveDay] = useState(null);
  const [dayComplete, setDayComplete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, s, r, p, v, ad] = await Promise.all([loadTrips(), loadSettings(), loadRevenue(), loadPlaces(), loadVehicles(), loadActiveDay()]);
      setTrips(t);
      setSettings(s);
      setRevenue(r);
      setPlaces(p);
      setVehicles(v);
      setActiveDay(ad);
      setLoaded(true);
      if (!s.onboardingComplete) setShowOnboarding(true); // first-run guided setup
      else setShowGreeting(true); // returning user — greet + ask which gig job today
    })();
  }, []);

  useEffect(() => {
    if (loaded) saveTrips(trips);
  }, [trips, loaded]);

  useEffect(() => {
    if (loaded) saveSettings(settings);
  }, [settings, loaded]);

  useEffect(() => {
    if (loaded) saveRevenue(revenue);
  }, [revenue, loaded]);

  useEffect(() => {
    if (loaded) savePlaces(places);
  }, [places, loaded]);

  useEffect(() => {
    if (loaded) saveVehicles(vehicles);
  }, [vehicles, loaded]);

  useEffect(() => {
    if (loaded) saveActiveDay(activeDay);
  }, [activeDay, loaded]);

  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function addPlace(place) {
    setPlaces((prev) => [...prev, { id: uid(), ...place }]);
  }
  function deletePlace(id) {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }
  function addVehicle(vehicle) {
    setVehicles((prev) => [...prev, { id: uid(), ...vehicle }]);
  }
  function deleteVehicle(id) {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  function setDayRevenue(date, amount) {
    setRevenue((prev) => ({ ...prev, [date]: amount }));
  }

  function addDayRevenue(date, amount) {
    setRevenue((prev) => ({ ...prev, [date]: (prev[date] || 0) + amount }));
  }

  function deleteDayRevenue(date) {
    setRevenue((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }

  // Group everything by month for the P&L summary — independent of the trip-log filters above.
  const monthlySummaries = useMemo(() => {
    const map = {};
    const ensure = (mk) => {
      if (!map[mk]) map[mk] = { month: mk, miles: 0, accountingCost: 0, cashCost: 0, revenue: 0, hours: 0, days: {} };
      return map[mk];
    };
    trips.forEach((t) => {
      const mk = monthKey(t.date);
      const entry = ensure(mk);
      const m = t.roundTrip ? t.miles * 2 : t.miles;
      const fullRate = rateForDate(t.date, settings.customRate);
      const cashRate = cashRateForDate(t.date, settings);
      entry.miles += m;
      entry.accountingCost += m * fullRate;
      entry.cashCost += m * cashRate;
      if (t.hoursWorked) entry.hours += t.hoursWorked;
      if (!entry.days[t.date]) entry.days[t.date] = { date: t.date, miles: 0, accountingCost: 0, cashCost: 0, revenue: 0, hours: 0 };
      entry.days[t.date].miles += m;
      entry.days[t.date].accountingCost += m * fullRate;
      entry.days[t.date].cashCost += m * cashRate;
      if (t.hoursWorked) entry.days[t.date].hours += t.hoursWorked;
    });
    Object.entries(revenue).forEach(([date, amt]) => {
      const mk = monthKey(date);
      const entry = ensure(mk);
      entry.revenue += amt;
      if (!entry.days[date]) entry.days[date] = { date, miles: 0, accountingCost: 0, cashCost: 0, revenue: 0, hours: 0 };
      entry.days[date].revenue += amt;
    });
    return Object.values(map)
      .map((e) => ({
        ...e,
        accountingPL: e.revenue - e.accountingCost,
        cashPL: e.revenue - e.cashCost,
        days: Object.values(e.days).sort((a, b) => (a.date < b.date ? 1 : -1)),
      }))
      .sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [trips, revenue, settings]);

  const months = useMemo(() => {
    const set = new Set(trips.map((t) => monthKey(t.date)));
    return Array.from(set).sort().reverse();
  }, [trips]);

  const filtered = useMemo(() => {
    return trips
      .filter((t) => monthFilter === "all" || monthKey(t.date) === monthFilter)
      .filter((t) => platformFilter === "all" || t.platform === platformFilter)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [trips, monthFilter, platformFilter]);

  const totals = useMemo(() => {
    let miles = 0;
    let deduction = 0;
    const byPlatform = {};
    filtered.forEach((t) => {
      const m = t.roundTrip ? t.miles * 2 : t.miles;
      const rate = rateForDate(t.date, settings.customRate);
      miles += m;
      deduction += m * rate;
      byPlatform[t.platform] = (byPlatform[t.platform] || 0) + m;
    });
    return { miles, deduction, byPlatform };
  }, [filtered, settings.customRate]);

  function upsertTrip(trip) {
    setTrips((prev) => {
      const exists = prev.some((t) => t.id === trip.id);
      if (exists) return prev.map((t) => (t.id === trip.id ? trip : t));
      return [trip, ...prev];
    });
  }

  function deleteTrip(id) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  function exportCSV() {
    const rows = [[
      "Date", "From", "To", "Round Trip", "Platform", "Vehicle", "Purpose", "Miles", "Rate", "Deduction",
      "Method", "Home Office", "Pickup Location", "Home Leg Method", "Home Odometer", "Pickup Odometer", "Drop Odometer",
      "Return Method", "Return Via", "Return Odometer/Miles", "Drop Pin Address",
      "Start Time", "End Time", "Hours Worked", "Scheduled Hours",
    ]];
    trips
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .forEach((t) => {
        const m = t.roundTrip ? t.miles * 2 : t.miles;
        const rate = rateForDate(t.date, settings.customRate);
        const returnVal =
          t.returnMode === "gps"
            ? (t.returnAutoMiles != null ? `${t.returnAutoMiles.toFixed(1)}mi (gps)` : "")
            : (t.returnVia === "home" ? t.returnHomeOdo : t.returnDepotOdo);
        const vehicle = vehicles.find((v) => v.id === t.vehicleId);
        rows.push([
          t.date,
          t.from || "",
          t.to || "",
          t.roundTrip ? "Yes" : "No",
          platformMeta(t.platform).label,
          vehicle ? vehicleLabel(vehicle) : "",
          (t.purpose || "").replace(/,/g, ";"),
          m.toFixed(1),
          rate.toFixed(3),
          (m * rate).toFixed(2),
          t.method || "manual",
          t.method === "odometer" ? (t.homeOffice ? "Yes" : "No") : "",
          t.method === "odometer" ? (t.pickupLocation || "") : "",
          t.method === "odometer" ? (t.homeLegMode || "") : "",
          t.method === "odometer" && t.startHomeOdo != null ? t.startHomeOdo.toFixed(1) : (t.method === "odometer" && t.homeLegAutoMiles != null ? `auto:${t.homeLegAutoMiles.toFixed(1)}mi` : ""),
          t.method === "odometer" && t.pickupOdo != null ? t.pickupOdo.toFixed(1) : "",
          t.method === "odometer" && t.dropOdo != null ? t.dropOdo.toFixed(1) : "",
          t.method === "odometer" ? (t.returnMode || "") : "",
          t.method === "odometer" ? (t.returnVia || "") : "",
          t.method === "odometer" && returnVal != null ? (typeof returnVal === "number" ? returnVal.toFixed(1) : returnVal) : "",
          t.method === "odometer" ? (t.dropPinAddress || "") : "",
          t.startTime || "",
          t.endTime || "",
          t.hoursWorked != null ? t.hoursWorked.toFixed(2) : "",
          t.scheduledHours != null ? t.scheduledHours.toFixed(2) : "",
        ]);
      });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tripslip-mileage-${todayStr()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function t(key) {
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  }
  function toggleLang() {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("tripslip:lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F2EC",
        color: "#201C16",
        fontFamily: "'IBM Plex Sans', sans-serif",
        paddingBottom: 60,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .mono { font-family: 'Space Mono', monospace; }
        input, select, textarea, button { font-family: inherit; }
        input::placeholder, textarea::placeholder { color: #9C9385; }
        input[type="text"], input[type="date"], input[type="number"], select, textarea {
          background: #FFFFFF; border: 1px solid #E2DED4; color: #201C16;
          border-radius: 6px; padding: 9px 11px; font-size: 14px; width: 100%;
          outline: none; transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        input:focus, select:focus, textarea:focus { border-color: #F5A623; box-shadow: 0 0 0 3px rgba(245,166,35,0.15); }
        .chip { cursor: pointer; user-select: none; transition: transform 120ms ease, box-shadow 120ms ease; }
        .chip:hover { transform: translateY(-1px); }
        .btn-primary {
          background: linear-gradient(135deg, #F5A623, #E08A1E); color: #201C16; border: none; border-radius: 7px;
          padding: 11px 18px; font-weight: 700; font-size: 14px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: filter 150ms ease, transform 150ms ease, box-shadow 150ms ease;
          box-shadow: 0 4px 14px -4px rgba(245,166,35,0.55);
        }
        .btn-primary:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 8px 20px -4px rgba(245,166,35,0.65); }
        .btn-primary:active { transform: translateY(0); }
        .btn-ghost {
          background: transparent; color: #6B6459; border: 1px solid #E2DED4; border-radius: 6px;
          padding: 10px 14px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          transition: border-color 120ms ease, color 120ms ease, transform 120ms ease;
        }
        .btn-ghost:hover { border-color: #9C9385; color: #201C16; transform: translateY(-1px); }
        .ticket-edge {
          background-image: repeating-linear-gradient(to right, #E2DED4 0, #E2DED4 8px, transparent 8px, transparent 16px);
          height: 1px; width: 100%;
        }
        .road-dash {
          height: 3px; width: 100%; border-radius: 2px;
          background-image: repeating-linear-gradient(to right, #F5A623 0, #F5A623 18px, transparent 18px, transparent 32px);
          opacity: 0.55;
        }
        .card-pop {
          transition: transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease, border-color 200ms ease;
        }
        .card-pop:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px -12px rgba(32,28,22,0.18);
          border-color: #D9D3C6 !important;
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise-in { animation: riseIn 480ms cubic-bezier(.2,.8,.2,1) both; }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-pop { animation: modalPop 220ms cubic-bezier(.2,.8,.2,1) both; }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
        @media (max-width: 720px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .trip-row { grid-template-columns: 1fr !important; row-gap: 6px; }
        }
      `}</style>

      {/* header */}
      <div style={{ borderBottom: "1px solid #E2DED4", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 7, background: "linear-gradient(135deg, #F5A623, #E08A1E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px -2px rgba(245,166,35,0.5)" }}>
            <Car size={19} color="#201C16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>TRIPSLIP</div>
            <div style={{ fontSize: 11, color: "#9C9385", letterSpacing: 0.5 }}>MILEAGE LOG FOR GIG DRIVERS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={toggleLang} title="Switch language / Cambiar idioma">
            <Globe size={15} /> {t("langToggle")}
          </button>
          <button className="btn-ghost" onClick={() => setShowOnboarding(true)}>
            <Compass size={15} /> Setup guide
          </button>
          <button className="btn-ghost" onClick={() => setShowPlaces(true)}>
            <MapPin size={15} /> Places
          </button>
          <button className="btn-ghost" onClick={() => setShowVehicles(true)}>
            <Car size={15} /> Vehicles
          </button>
          <button className="btn-ghost" onClick={() => setShowSettings(true)}>
            <Settings size={15} /> Rate
          </button>
          <button className="btn-ghost" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 0" }}>
        {/* filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ width: "auto", minWidth: 150 }}>
            <option value="all">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* dashboard cluster */}
        <div
          className="rise-in"
          style={{
            background: "radial-gradient(circle at 15% 20%, rgba(245,166,35,0.14), transparent 55%), radial-gradient(circle at 85% 80%, rgba(47,199,172,0.12), transparent 55%), #FFFFFF",
            border: "1px solid #E2DED4",
            borderRadius: 16,
            padding: "22px 22px 18px",
            marginBottom: 22,
          }}
        >
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#6B6459", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>Total miles</div>
              <Odometer value={totals.miles} digits={6} decimals={1} glow="#F5A623" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B6459", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>Est. deduction</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, color: "#2FC7AC", fontWeight: 700 }}>$</span>
                <Odometer value={totals.deduction} digits={5} decimals={2} glow="#2FC7AC" />
              </div>
            </div>
          </div>
          <div className="road-dash" style={{ marginTop: 18 }} />
        </div>

        {/* platform breakdown */}
        {Object.keys(totals.byPlatform).length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
            {Object.entries(totals.byPlatform)
              .sort((a, b) => b[1] - a[1])
              .map(([pid, m]) => {
                const meta = platformMeta(pid);
                return (
                  <div key={pid} style={{ display: "flex", alignItems: "center", gap: 7, background: "#FFFFFF", border: `1px solid ${meta.color}44`, borderRadius: 20, padding: "6px 12px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color }} />
                    <span style={{ fontSize: 12.5, color: "#201C16" }}>{meta.label}</span>
                    <span style={{ fontSize: 12.5, color: "#6B6459", fontFamily: "'Space Mono', monospace" }}>{m.toFixed(1)}mi</span>
                  </div>
                );
              })}
          </div>
        )}

        {/* educational callout */}
        <InfoCallout />

        {/* daily revenue quick add */}
        <RevenueQuickAdd revenue={revenue} onSet={setDayRevenue} onDelete={deleteDayRevenue} />

        {/* monthly summary */}
        <div style={{ marginBottom: 30 }}>
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: showSummary ? 14 : 0 }}
            onClick={() => setShowSummary((s) => !s)}
          >
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: "#9C9385", textTransform: "uppercase" }}>Monthly summary</div>
            <span style={{ fontSize: 12, color: "#6B6459" }}>{showSummary ? "Hide ▾" : "Show ▸"}</span>
          </div>
          {showSummary && (
            monthlySummaries.length === 0 ? (
              <div style={{ color: "#9C9385", fontSize: 14, padding: "20px 0", textAlign: "center", border: "1px dashed #E2DED4", borderRadius: 10 }}>
                Log a trip or a day's revenue to see your monthly profit/loss here.
              </div>
            ) : (
              monthlySummaries.map((m) => <MonthCard key={m.month} summary={m} />)
            )
          )}
        </div>

        {/* active day banner */}
        {activeDay && (
          <div className="rise-in" style={{ background: "#FFFFFF", border: "1px solid #F5A62355", borderRadius: 10, padding: 18, marginBottom: 22 }}>
            {activeDay.date !== todayStr() ? (
              <>
                <div style={{ fontSize: 13, color: "#E85C4A", marginBottom: 10 }}>
                  You have an unfinished day from {new Date(activeDay.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} — finish it up or discard it.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {activeDay.platform === "amazonflex" && activeDay.pickupOdo == null ? (
                    <button className="btn-primary" onClick={() => setShowPickupArrival(true)}>Log pickup arrival</button>
                  ) : (
                    <button className="btn-primary" onClick={() => setShowEndDay(true)}>Finish that day</button>
                  )}
                  <button className="btn-ghost" onClick={() => setActiveDay(null)}>Discard it</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 1, color: "#F5A623", textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
                      <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5A623", display: "inline-block" }} />
                      Day in progress
                    </div>
                    <div style={{ fontSize: 13.5, color: "#6B6459" }}>
                      Started at <span className="mono" style={{ color: "#201C16" }}>{activeDay.startOdo.toFixed(1)} mi</span>
                      {activeDay.pickupOdo != null && (
                        <> · arrived at pickup <span className="mono" style={{ color: "#201C16" }}>{activeDay.pickupOdo.toFixed(1)} mi</span></>
                      )}
                      {activeDay.pickupLocation ? ` (${activeDay.pickupLocation})` : ""} · {platformMeta(activeDay.platform).label}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {activeDay.platform === "amazonflex" && activeDay.pickupOdo == null ? (
                      <button className="btn-primary" onClick={() => setShowPickupArrival(true)}>
                        <MapPin size={15} /> Log arrival at pickup
                      </button>
                    ) : (
                      <>
                        <button className="btn-primary" onClick={() => setShowEndDay(true)}>
                          <MapPin size={15} /> {activeDay.platform === "amazonflex" ? "End day / final drop" : "End day — back home"}
                        </button>
                        <button className="btn-ghost" onClick={() => setShowSwitchGig(true)}>
                          <Repeat size={14} /> Switch to another gig
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* new trip trigger / form */}
        {!showForm ? (
          <button className="btn-primary" style={{ marginBottom: 30 }} onClick={() => { setEditingId(null); setShowForm(true); }}>
            <Plus size={16} /> New trip
          </button>
        ) : (
          <TripForm
            key={editingId || "new"}
            initial={editingId ? trips.find((t) => t.id === editingId) : null}
            settings={settings}
            places={places}
            vehicles={vehicles}
            trips={trips}
            revenue={revenue}
            defaultPlatform={activeGigPlatform}
            onSavePlace={addPlace}
            onSaveRevenue={setDayRevenue}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
            onSave={(trip) => { upsertTrip(trip); setShowForm(false); setEditingId(null); }}
          />
        )}

        {/* trip log */}
        <div style={{ marginTop: 34 }}>
          <div style={{ fontSize: 12, letterSpacing: 1.5, color: "#9C9385", textTransform: "uppercase", marginBottom: 14 }}>Trip log — {filtered.length} trip{filtered.length === 1 ? "" : "s"}</div>
          {filtered.length === 0 ? (
            <div style={{ color: "#9C9385", fontSize: 14, padding: "30px 0", textAlign: "center", border: "1px dashed #E2DED4", borderRadius: 10 }}>
              No trips logged yet. Add your first one above.
            </div>
          ) : (
            <div>
              {filtered.map((t, i) => (
                <TripRow
                  key={t.id}
                  trip={t}
                  index={filtered.length - i}
                  rate={rateForDate(t.date, settings.customRate)}
                  vehicles={vehicles}
                  onEdit={() => { setEditingId(t.id); setShowForm(true); }}
                  onDelete={() => deleteTrip(t.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #E2DED4", textAlign: "center" }}>
          <div style={{ fontSize: 11.5, color: "#9C9385", lineHeight: 1.5 }}>
            TripSlip is not an accounting firm and doesn't provide tax advice — for anything tax-related, talk to a
            qualified tax professional.
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => { setSettings((prev) => ({ ...prev, ...s })); setShowSettings(false); }}
        />
      )}

      {showPlaces && (
        <PlacesModal
          places={places}
          homeAddress={settings.homeAddress}
          onSetHome={(addr) => setSettings((s) => ({ ...s, homeAddress: addr }))}
          onAddPlace={addPlace}
          onDeletePlace={deletePlace}
          onClose={() => setShowPlaces(false)}
        />
      )}

      {showVehicles && (
        <VehiclesModal
          vehicles={vehicles}
          onAddVehicle={addVehicle}
          onDeleteVehicle={deleteVehicle}
          onClose={() => setShowVehicles(false)}
        />
      )}

      {showGreeting && (
        <GreetingScreen
          userName={settings.userName}
          onSetName={(name) => updateSettings({ userName: name })}
          onSelect={(platformId) => {
            setActiveGigPlatform(platformId);
            setShowGreeting(false);
            if (!activeDay || activeDay.date !== todayStr()) setShowStartDay(true);
          }}
          onSkip={() => setShowGreeting(false)}
        />
      )}

      {showStartDay && (
        <StartDayScreen
          settings={settings}
          vehicles={vehicles}
          platform={activeGigPlatform}
          onStart={(day) => { setActiveDay(day); setShowStartDay(false); }}
          onSkip={() => setShowStartDay(false)}
        />
      )}

      {showPickupArrival && (
        <PickupArrivalModal
          activeDay={activeDay}
          places={places}
          onLogArrival={({ pickupOdo, pickupLocation }) => {
            setActiveDay((prev) => ({ ...prev, pickupOdo, pickupLocation }));
            setShowPickupArrival(false);
          }}
          onCancel={() => setShowPickupArrival(false)}
        />
      )}

      {showEndDay && (
        <EndDayModal
          activeDay={activeDay}
          settings={settings}
          places={places}
          existingRevenue={revenue[activeDay?.date] ?? ""}
          onFinish={(trip, revenueAmount) => {
            upsertTrip(trip);
            if (revenueAmount != null) addDayRevenue(activeDay.date, revenueAmount);
            const fullRate = rateForDate(trip.date, settings.customRate);
            const cashRate = cashRateForDate(trip.date, settings);
            const deduction = trip.miles * fullRate;
            const cashDeduction = trip.miles * cashRate;
            const dayRevenueTotal = (revenue[activeDay.date] || 0) + (revenueAmount || 0);
            setDayComplete({
              date: trip.date,
              miles: trip.miles,
              revenue: dayRevenueTotal,
              accountingPL: dayRevenueTotal - deduction,
              cashPL: dayRevenueTotal - cashDeduction,
              platform: trip.platform,
              hoursWorked: trip.hoursWorked,
              scheduledHours: trip.scheduledHours,
              pickupLocation: trip.pickupLocation,
              startTime: trip.startTime,
              overtimeReason: trip.overtimeReason,
            });
            setActiveDay(null);
            setShowEndDay(false);
          }}
          onCancel={() => setShowEndDay(false)}
          onDiscardDay={() => { setActiveDay(null); setShowEndDay(false); }}
        />
      )}

      {showSwitchGig && (
        <SwitchGigModal
          activeDay={activeDay}
          settings={settings}
          existingRevenue={revenue[activeDay?.date] ?? ""}
          onSwitch={(trip, revenueAmount, nextDay) => {
            upsertTrip(trip);
            if (revenueAmount != null) addDayRevenue(activeDay.date, revenueAmount);
            setActiveDay(nextDay);
            setShowSwitchGig(false);
          }}
          onCancel={() => setShowSwitchGig(false)}
        />
      )}

      {dayComplete && (
        <DayCompleteReveal data={dayComplete} onDone={() => setDayComplete(null)} />
      )}

      {showOnboarding && (
        <OnboardingModal
          settings={settings}
          places={places}
          vehicles={vehicles}
          onUpdateSettings={updateSettings}
          onAddPlace={addPlace}
          onDeletePlace={deletePlace}
          onAddVehicle={addVehicle}
          onDeleteVehicle={deleteVehicle}
          onClose={() => { updateSettings({ onboardingComplete: true }); setShowOnboarding(false); setShowGreeting(true); }}
        />
      )}
    </div>
    </LanguageContext.Provider>
  );
}

/* ---------- info callout ---------- */

function InfoCallout() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #F5A62355", borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertCircle size={16} color="#F5A623" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, color: "#201C16", fontWeight: 600, marginBottom: 4 }}>
            A daily "loss" here often isn't a real loss
          </div>
          <div style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.55 }}>
            This app shows two profit/loss numbers: <b style={{ color: "#201C16" }}>Accounting P/L</b> uses the full IRS
            per-mile cost (which bakes in vehicle depreciation — a real cost, but not money leaving your wallet that
            day), and <b style={{ color: "#201C16" }}>Cash P/L</b> estimates just your out-of-pocket costs (gas,
            maintenance, wear). It's normal to see Accounting P/L dip negative on slow days even when your actual cash
            flow is positive — that's the depreciation showing up, not your driving getting worse.
            {open && (
              <div style={{ marginTop: 10 }}>
                Judging your performance off any single day's Accounting P/L can be misleading and discouraging. A
                slow Tuesday doesn't erase a strong week. Look at trends across a full month, and weigh Cash P/L
                alongside Accounting P/L — depreciation matters for taxes and for knowing your true replacement cost,
                but it isn't a signal that today went badly. The default cash-cost estimate assumes 35¢/mile of the
                IRS rate is depreciation; adjust it in Settings if you know your own vehicle costs more precisely.
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ background: "none", border: "none", color: "#F5A623", fontSize: 12.5, marginTop: 8, cursor: "pointer", padding: 0 }}
          >
            {open ? "Show less" : "Read more"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- daily revenue quick add ---------- */

function RevenueQuickAdd({ revenue, onSet, onDelete }) {
  const [date, setDate] = useState(todayStr());
  const [amount, setAmount] = useState("");

  function handleAdd() {
    const amt = parseFloat(amount);
    if (!date || isNaN(amt) || amt < 0) return;
    onSet(date, amt);
    setAmount("");
  }

  const recent = Object.entries(revenue)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 5);

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 18, marginBottom: 22 }}>
      <div style={{ fontSize: 12, letterSpacing: 1.5, color: "#9C9385", textTransform: "uppercase", marginBottom: 12 }}>
        Log daily revenue
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: recent.length ? 14 : 0 }}>
        <div style={{ width: 160 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ width: 140 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Revenue ($)</label>
          <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <button className="btn-primary" onClick={handleAdd}><Plus size={15} /> Save</button>
      </div>
      {recent.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {recent.map(([d, amt]) => (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: "#6B6459" }}>
              <span>{new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", color: "#2FC7AC" }}>${amt.toFixed(2)}</span>
              <button onClick={() => onDelete(d)} className="btn-ghost" style={{ padding: 4 }}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- monthly summary card ---------- */

function MonthCard({ summary }) {
  const [expanded, setExpanded] = useState(false);
  const { month, miles, revenue, accountingPL, cashPL, hours, days } = summary;
  const hourlyRate = hours > 0 ? accountingPL / hours : null;

  return (
    <div className="card-pop" style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{monthLabel(month)}</div>
        <div style={{ fontSize: 12, color: "#9C9385", fontFamily: "'Space Mono', monospace" }}>{miles.toFixed(1)} mi · ${revenue.toFixed(2)} rev{hours > 0 ? ` · ${formatHours(hours)}` : ""}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
        <PLBox label="Accounting P/L" value={accountingPL} sub="revenue − full IRS cost" />
        <PLBox label="Cash P/L" value={cashPL} sub="revenue − est. out-of-pocket" />
      </div>
      <div style={{ fontSize: 11, color: "#9C9385", marginBottom: 12 }}>
        ${revenue.toFixed(2)} revenue logged this month
        {hourlyRate != null && <span> · avg <b style={{ color: hourlyRate >= 0 ? "#2FC7AC" : "#E85C4A" }}>${hourlyRate.toFixed(2)}/hr</b></span>}
      </div>
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{ background: "none", border: "none", color: "#6B6459", fontSize: 12, cursor: "pointer", padding: 0 }}
      >
        {expanded ? "Hide daily breakdown ▾" : "Show daily breakdown ▸"}
      </button>
      {expanded && (
        <div style={{ marginTop: 12, borderTop: "1px solid #E2DED4", paddingTop: 10 }}>
          {days.map((d) => {
            const dPL = d.revenue - d.accountingCost;
            const dCashPL = d.revenue - d.cashCost;
            const flagged = dPL < 0 && dCashPL >= 0;
            return (
              <div key={d.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid #E2DED4" }}>
                <span style={{ color: "#6B6459", width: 70 }}>{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span style={{ color: "#9C9385", fontFamily: "'Space Mono', monospace", width: 70, textAlign: "right" }}>{d.miles.toFixed(1)}mi</span>
                <span style={{ color: "#9C9385", fontFamily: "'Space Mono', monospace", width: 70, textAlign: "right" }}>${d.revenue.toFixed(2)}</span>
                <span style={{ color: dPL < 0 ? "#E85C4A" : "#2FC7AC", fontFamily: "'Space Mono', monospace", width: 70, textAlign: "right" }}>
                  ${dPL.toFixed(2)}
                </span>
                {flagged && (
                  <span style={{ fontSize: 11, color: "#F5A623", marginLeft: 8 }} title="Accounting loss, but cash-flow positive — mostly depreciation, not a bad day">
                    ⓘ cash+
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PLBox({ label, value, sub }) {
  const positive = value >= 0;
  return (
    <div style={{ background: "#F5F2EC", border: `1px solid ${positive ? "#2FC7AC33" : "#E85C4A33"}`, borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 10.5, color: "#6B6459", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 19, fontWeight: 700, color: positive ? "#2FC7AC" : "#E85C4A" }}>
        {positive ? "" : "-"}${Math.abs(value).toFixed(2)}
      </div>
      <div style={{ fontSize: 10.5, color: "#9C9385", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

/* ---------- trip row ---------- */

function TripRow({ trip, index, rate, vehicles, onEdit, onDelete }) {
  const meta = platformMeta(trip.platform);
  const miles = trip.roundTrip ? trip.miles * 2 : trip.miles;
  const deduction = miles * rate;
  const vehicle = vehicles && vehicles.length > 1 ? vehicles.find((v) => v.id === trip.vehicleId) : null;
  return (
    <div>
      <div className="ticket-edge" />
      <div className="trip-row" style={{ display: "grid", gridTemplateColumns: "50px 90px 1fr 90px 90px 80px 70px", alignItems: "center", gap: 10, padding: "13px 4px" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#9C9385" }}>#{String(index).padStart(3, "0")}</span>
        <span style={{ fontSize: 13, color: "#6B6459" }}>{new Date(trip.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span style={{ fontSize: 13.5, color: "#201C16", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {trip.method === "odometer"
            ? `${trip.homeOffice && trip.legHomeMiles ? "home → " : ""}${trip.pickupLocation || "pickup"} → drop → ${trip.returnVia === "home" ? "home" : "depot"} (${(trip.legRouteMiles || 0).toFixed(1)}${trip.homeLegCounted ? ` +${trip.homeLegCounted.toFixed(1)}` : ""} + ${(trip.returnMiles || 0).toFixed(1)}mi)`
            : trip.from && trip.to
            ? `${trip.from} → ${trip.to}${trip.roundTrip ? " (RT)" : ""}`
            : (trip.purpose || "—")}
          {vehicle && <span style={{ color: "#9C9385" }}> · {vehicleLabel(vehicle)}</span>}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color }} />
          {meta.label}
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, textAlign: "right" }}>{miles.toFixed(1)}mi</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#2FC7AC", textAlign: "right" }}>${deduction.toFixed(2)}</span>
        <span style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button onClick={onEdit} className="btn-ghost" style={{ padding: 6 }}><Pencil size={13} /></button>
          <button onClick={onDelete} className="btn-ghost" style={{ padding: 6 }}><Trash2 size={13} /></button>
        </span>
      </div>
    </div>
  );
}

/* ---------- saved-place helpers ---------- */

function QuickFillSelect({ places, homeAddress, onPick, labelMode }) {
  if (!homeAddress && (!places || places.length === 0)) return null;
  const amazonPlaces = (places || []).filter((p) => p.type === "amazon");
  const otherPlaces = (places || []).filter((p) => p.type !== "amazon");
  return (
    <select
      value=""
      onChange={(e) => {
        const v = e.target.value;
        if (!v) return;
        if (v === "__home__") onPick(labelMode ? "Home" : homeAddress);
        else {
          const p = places.find((pl) => pl.id === v);
          if (p) onPick(labelMode ? p.code : p.address);
        }
        e.target.value = "";
      }}
      style={{ width: "auto", fontSize: 11, padding: "3px 6px", color: "#6B6459" }}
    >
      <option value="">Quick fill…</option>
      {homeAddress && (
        <optgroup label="Home">
          <option value="__home__">Home</option>
        </optgroup>
      )}
      {amazonPlaces.length > 0 && (
        <optgroup label="Amazon locations">
          {amazonPlaces.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
        </optgroup>
      )}
      {otherPlaces.length > 0 && (
        <optgroup label="Other">
          {otherPlaces.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
        </optgroup>
      )}
    </select>
  );
}

function SaveAddressButton({ address, onSave }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState("amazon");

  if (!address || !address.trim()) return null;

  function handleSave() {
    if (!code.trim()) return;
    onSave({ code: code.trim(), label: code.trim(), address: address.trim(), type });
    setCode("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "#9C9385", fontSize: 11, cursor: "pointer", padding: "4px 0" }}>
        + Save as place
      </button>
    );
  }
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code, e.g. DLT3" style={{ fontSize: 12, padding: "6px 8px" }} />
        <button type="button" className="btn-ghost" style={{ padding: "6px 10px" }} onClick={handleSave}><Check size={12} /></button>
        <button type="button" className="btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setOpen(false)}><X size={12} /></button>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span onClick={() => setType("amazon")} className="chip" style={{ fontSize: 11, padding: "4px 9px", borderRadius: 20, border: `1px solid ${type === "amazon" ? "#F5A623" : "#E2DED4"}`, color: type === "amazon" ? "#F5A623" : "#6B6459" }}>
          Amazon distribution center
        </span>
        <span onClick={() => setType("other")} className="chip" style={{ fontSize: 11, padding: "4px 9px", borderRadius: 20, border: `1px solid ${type === "other" ? "#F5A623" : "#E2DED4"}`, color: type === "other" ? "#F5A623" : "#6B6459" }}>
          Other
        </span>
      </div>
    </div>
  );
}

/* ---------- trip form ---------- */

function TripForm({ initial, settings, places, vehicles, trips, revenue, defaultPlatform, onSavePlace, onSaveRevenue, onCancel, onSave }) {
  const [date, setDate] = useState(initial?.date || todayStr());
  const [from, setFrom] = useState(initial?.from || "");
  const [to, setTo] = useState(initial?.to || "");
  const [roundTrip, setRoundTrip] = useState(initial?.roundTrip || false);
  const [platform, setPlatform] = useState(initial?.platform || defaultPlatform || "amazonflex");
  const [purpose, setPurpose] = useState(initial?.purpose || "");
  const [miles, setMiles] = useState(initial?.miles?.toString() || "");
  const [mode, setMode] = useState(initial?.method || "auto");
  const [calcState, setCalcState] = useState({ status: "idle", message: "" });
  const [vehicleId, setVehicleId] = useState(initial?.vehicleId || (vehicles && vehicles.length === 1 ? vehicles[0].id : ""));
  const [dayRevenue, setDayRevenue] = useState(() => {
    const existing = revenue?.[initial?.date || todayStr()];
    return existing != null ? String(existing) : "";
  });

  // odometer mode fields — three plain readings (home, pickup, drop), plus an
  // auto-calculated return leg (home or depot, whichever's closer) with a manual fallback.
  const [homeOffice, setHomeOffice] = useState(initial?.homeOffice ?? settings?.homeOfficeDefault ?? false);
  const [pickupLocation, setPickupLocation] = useState(initial?.pickupLocation || initial?.startLocation || "");
  const [startHomeOdo, setStartHomeOdo] = useState(initial?.startHomeOdo?.toString() || "");
  const [pickupOdo, setPickupOdo] = useState(initial?.pickupOdo?.toString() || "");
  const [dropOdo, setDropOdo] = useState(initial?.dropOdo?.toString() || "");
  const [returnDepotOdo, setReturnDepotOdo] = useState(initial?.returnDepotOdo?.toString() || "");
  const [returnHomeOdo, setReturnHomeOdo] = useState(initial?.returnHomeOdo?.toString() || "");
  const [returnAutoMiles, setReturnAutoMiles] = useState(initial?.returnAutoMiles?.toString() || "");
  const [returnAutoVia, setReturnAutoVia] = useState(initial?.returnVia && initial?.returnMode === "gps" ? initial.returnVia : null);
  const [dropCalc, setDropCalc] = useState({ status: "idle", message: "" });

  // If the pickup location matches a saved place, we know its address — which lets us
  // auto-calculate the return leg by GPS instead of asking for another odometer reading.
  const selectedPickupPlace = useMemo(() => {
    return (places || []).find((p) => p.address === pickupLocation || p.code === pickupLocation) || null;
  }, [places, pickupLocation]);

  async function handleCalcReturn() {
    const canAutoReturn = !!(selectedPickupPlace?.address || settings?.homeAddress);
    if (!canAutoReturn) {
      setDropCalc({ status: "error", message: "No depot or home address on file — add one under Places, or enter the return odometer manually below." });
      return;
    }
    setDropCalc({ status: "loading", message: "Getting your location…" });
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Location isn't available in this browser")); return; }
        navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("Location permission denied")), { enableHighAccuracy: true, timeout: 10000 });
      });
      const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      const candidates = [];
      if (selectedPickupPlace?.address) {
        const depotCoord = await geocode(selectedPickupPlace.address);
        candidates.push({ via: "depot", miles: await routeMiles(here, depotCoord) });
      }
      if (settings?.homeAddress) {
        const homeCoord = await geocode(settings.homeAddress);
        candidates.push({ via: "home", miles: await routeMiles(here, homeCoord) });
      }
      if (!candidates.length) throw new Error("no depot or home address to route back to");
      const chosen = homeOffice
        ? candidates.find((c) => c.via === "home") || candidates.sort((a, b) => a.miles - b.miles)[0]
        : candidates.sort((a, b) => a.miles - b.miles)[0];
      setReturnAutoMiles(chosen.miles.toFixed(1));
      setReturnAutoVia(chosen.via);
      setDropCalc({ status: "done", message: `Return via ${chosen.via}: ${chosen.miles.toFixed(1)} mi` });
    } catch (e) {
      setDropCalc({ status: "error", message: `Couldn't auto-calc the return (${e.message}). Enter it manually below.` });
    }
  }

  async function handleCalc() {
    if (!from.trim() || !to.trim()) {
      setCalcState({ status: "error", message: "Enter both a start and end address." });
      return;
    }
    setCalcState({ status: "loading", message: "Looking up route…" });
    try {
      const a = await geocode(from);
      const b = await geocode(to);
      const dist = await routeMiles(a, b);
      setMiles(dist.toFixed(1));
      setCalcState({ status: "done", message: `Route found: ${dist.toFixed(1)} mi` });
    } catch (e) {
      setCalcState({ status: "error", message: `Auto-calc unavailable (${e.message}). Enter miles manually below.` });
    }
  }

  // Three checkpoints plus a return: home (start of day) → pickup/distribution point → final
  // drop → back to home or depot. The home→pickup leg only counts toward the deduction if
  // you're claiming a qualifying home office (otherwise it's a normal commute). The
  // pickup→drop leg — the actual delivery route — always counts. The return leg goes home
  // (if home office) or to whichever of depot/home is the shorter drive back.
  const odo = useMemo(() => {
    const s = parseFloat(startHomeOdo);
    const p = parseFloat(pickupOdo);
    const d = parseFloat(dropOdo);
    const rd = parseFloat(returnDepotOdo);
    const rh = parseFloat(returnHomeOdo);

    const legHome = isFinite(s) && isFinite(p) && p >= s ? p - s : null;
    const legRoute = isFinite(p) && isFinite(d) && d >= p ? d - p : null;

    let returnLeg = null;
    let returnVia = null;
    if (isFinite(parseFloat(returnAutoMiles))) {
      returnLeg = parseFloat(returnAutoMiles);
      returnVia = returnAutoVia;
    } else if (homeOffice) {
      if (isFinite(rh) && isFinite(d) && rh >= d) {
        returnLeg = rh - d;
        returnVia = "home";
      }
    } else {
      const candidates = [];
      if (isFinite(rd) && isFinite(d) && rd >= d) candidates.push({ via: "depot", miles: rd - d });
      if (isFinite(rh) && isFinite(d) && rh >= d) candidates.push({ via: "home", miles: rh - d });
      if (candidates.length) {
        candidates.sort((a, b) => a.miles - b.miles);
        returnLeg = candidates[0].miles;
        returnVia = candidates[0].via;
      }
    }
    const homeLegCounted = homeOffice && legHome != null ? legHome : 0;
    const total = homeLegCounted + (legRoute || 0) + (returnLeg || 0);
    return { legHome, legRoute, returnLeg, returnVia, homeLegCounted, total };
  }, [startHomeOdo, pickupOdo, dropOdo, returnDepotOdo, returnHomeOdo, homeOffice, returnAutoMiles, returnAutoVia]);

  function saveRevenueIfEntered() {
    if (onSaveRevenue && dayRevenue !== "" && isFinite(parseFloat(dayRevenue))) {
      onSaveRevenue(date, parseFloat(dayRevenue));
    }
  }

  function handleSubmit() {
    if (mode === "odometer") {
      if (!date || !odo.total || odo.total <= 0) return;
      saveRevenueIfEntered();
      onSave({
        id: initial?.id || uid(),
        date,
        from: "",
        to: "",
        roundTrip: false,
        platform,
        purpose,
        vehicleId: vehicleId || null,
        miles: odo.total,
        method: "odometer",
        homeOffice,
        pickupLocation,
        homeLegMode: "odometer",
        homeLegAutoMiles: null,
        startHomeOdo: startHomeOdo ? parseFloat(startHomeOdo) : null,
        pickupOdo: parseFloat(pickupOdo) || null,
        dropOdo: parseFloat(dropOdo) || null,
        returnDepotOdo: returnDepotOdo ? parseFloat(returnDepotOdo) : null,
        returnHomeOdo: returnHomeOdo ? parseFloat(returnHomeOdo) : null,
        returnMode: returnAutoMiles ? "gps" : "manual",
        returnAutoMiles: returnAutoMiles ? parseFloat(returnAutoMiles) : null,
        dropPinAddress: null,
        legHomeMiles: odo.legHome,
        legRouteMiles: odo.legRoute,
        returnMiles: odo.returnLeg,
        returnVia: odo.returnVia,
        homeLegCounted: odo.homeLegCounted,
        // carried forward to prefill tomorrow's pickup odometer reading
        endOdometer: (parseFloat(dropOdo) || null) != null && odo.returnLeg != null ? parseFloat(dropOdo) + odo.returnLeg : null,
      });
      return;
    }
    const m = parseFloat(miles);
    if (!date || isNaN(m) || m <= 0) return;
    saveRevenueIfEntered();
    onSave({
      id: initial?.id || uid(),
      date,
      from: mode === "auto" ? from : "",
      to: mode === "auto" ? to : "",
      roundTrip,
      platform,
      purpose,
      vehicleId: vehicleId || null,
      miles: m,
      method: mode,
    });
  }

  // Live preview: whatever mode is active, work out the miles it currently represents,
  // so a revenue figure entered here can show today's profit/loss before saving.
  const currentMiles = mode === "odometer" ? odo.total : (parseFloat(miles) || 0) * (roundTrip ? 2 : 1);
  const previewRate = rateForDate(date, settings?.customRate);
  const previewDeduction = currentMiles * previewRate;
  const previewRevenueNum = parseFloat(dayRevenue);
  const previewPL = isFinite(previewRevenueNum) ? previewRevenueNum - previewDeduction : null;

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 20, marginBottom: 30, position: "relative" }}>
      <div className="ticket-edge" style={{ position: "absolute", top: -1, left: 0 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: 1.5, color: "#9C9385", textTransform: "uppercase" }}>{initial ? "Edit trip" : "New trip"}</div>
        <button onClick={onCancel} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {vehicles && vehicles.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Vehicle</label>
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Select a vehicle…</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span onClick={() => setMode("auto")} className="chip" style={{ fontSize: 12.5, padding: "6px 12px", borderRadius: 20, border: `1px solid ${mode === "auto" ? "#F5A623" : "#E2DED4"}`, color: mode === "auto" ? "#F5A623" : "#6B6459" }}>
          Auto-calc from addresses
        </span>
        <span onClick={() => setMode("manual")} className="chip" style={{ fontSize: 12.5, padding: "6px 12px", borderRadius: 20, border: `1px solid ${mode === "manual" ? "#F5A623" : "#E2DED4"}`, color: mode === "manual" ? "#F5A623" : "#6B6459" }}>
          Manual miles
        </span>
        <span onClick={() => setMode("odometer")} className="chip" style={{ fontSize: 12.5, padding: "6px 12px", borderRadius: 20, border: `1px solid ${mode === "odometer" ? "#F5A623" : "#E2DED4"}`, color: mode === "odometer" ? "#F5A623" : "#6B6459" }}>
          Odometer log (multi-drop)
        </span>
      </div>

      {mode === "auto" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 11, color: "#6B6459" }}><MapPin size={11} style={{ verticalAlign: -1 }} /> From</label>
              <QuickFillSelect places={places} homeAddress={settings?.homeAddress} onPick={setFrom} />
            </div>
            <input type="text" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="123 Main St, Springfield" />
            <SaveAddressButton address={from} onSave={onSavePlace} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 11, color: "#6B6459" }}><MapPin size={11} style={{ verticalAlign: -1 }} /> To</label>
              <QuickFillSelect places={places} homeAddress={settings?.homeAddress} onPick={setTo} />
            </div>
            <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="456 Oak Ave, Springfield" />
            <SaveAddressButton address={to} onSave={onSavePlace} />
          </div>
        </div>
      )}

      {mode === "odometer" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, color: "#6B6459", lineHeight: 1.5, marginBottom: 14, background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: 12 }}>
            For multi-drop routes (Amazon Flex and similar): log your odometer when you leave home, when you arrive
            at pickup, and at your last drop. The app then calculates your way back automatically — home or depot,
            whichever's closer (or always home if you're claiming a qualifying home office; confirm your own
            eligibility with a tax professional, IRS Pub. 587).
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={homeOffice} onChange={(e) => setHomeOffice(e.target.checked)} style={{ width: "auto" }} />
            Claiming a deductible home office for this trip
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Odometer — leaving home</label>
              <input type="number" step="0.1" value={startHomeOdo} onChange={(e) => setStartHomeOdo(e.target.value)} placeholder="e.g. 40201.0" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Odometer — arriving at pickup</label>
              <input type="number" step="0.1" value={pickupOdo} onChange={(e) => setPickupOdo(e.target.value)} placeholder="e.g. 40213.5" />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 11, color: "#6B6459" }}>Which distribution center? (optional)</label>
              <QuickFillSelect places={places} homeAddress={settings?.homeAddress} onPick={setPickupLocation} labelMode />
            </div>
            <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. DLT3" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Odometer at final drop</label>
            <input type="number" step="0.1" value={dropOdo} onChange={(e) => setDropOdo(e.target.value)} placeholder="e.g. 40261.2" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: "#9C9385", lineHeight: 1.5, marginBottom: 10 }}>
              Calculate the way back — home or depot, whichever's closer — automatically from your current location.
            </p>
            <button className="btn-ghost" type="button" onClick={handleCalcReturn}>
              <MapPin size={13} /> {dropCalc.status === "loading" ? "Locating…" : "Calculate return"}
            </button>
            {dropCalc.message && (
              <div style={{ fontSize: 12, color: dropCalc.status === "error" ? "#E85C4A" : "#2FC7AC", marginTop: 8 }}>{dropCalc.message}</div>
            )}
          </div>

          {!returnAutoMiles && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#6B6459", marginBottom: 6 }}>Or enter the return odometer manually:</div>
              {homeOffice ? (
                <div>
                  <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Return odometer (arriving home)</label>
                  <input type="number" step="0.1" value={returnHomeOdo} onChange={(e) => setReturnHomeOdo(e.target.value)} placeholder="e.g. 40269.6" />
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Return odometer (back at depot)</label>
                    <input type="number" step="0.1" value={returnDepotOdo} onChange={(e) => setReturnDepotOdo(e.target.value)} placeholder="optional" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Return odometer (arriving home)</label>
                    <input type="number" step="0.1" value={returnHomeOdo} onChange={(e) => setReturnHomeOdo(e.target.value)} placeholder="optional" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: 12 }}>
            <span style={{ color: "#6B6459" }}>
              Home→pickup: <b style={{ color: homeOffice ? "#201C16" : "#9C9385", fontFamily: "'Space Mono', monospace" }}>{odo.legHome != null ? odo.legHome.toFixed(1) : "—"} mi</b>
              {!homeOffice && odo.legHome != null && <span style={{ color: "#9C9385" }}> (not counted — no home office)</span>}
            </span>
            <span style={{ color: "#6B6459" }}>Pickup→drop: <b style={{ color: "#201C16", fontFamily: "'Space Mono', monospace" }}>{odo.legRoute != null ? odo.legRoute.toFixed(1) : "—"} mi</b></span>
            <span style={{ color: "#6B6459" }}>
              Return{odo.returnVia ? ` (via ${odo.returnVia})` : ""}: <b style={{ color: "#201C16", fontFamily: "'Space Mono', monospace" }}>{odo.returnLeg != null ? odo.returnLeg.toFixed(1) : "—"} mi</b>
            </span>
            <span style={{ color: "#F5A623" }}>Total deductible: <b style={{ fontFamily: "'Space Mono', monospace" }}>{odo.total.toFixed(1)} mi</b></span>
          </div>
        </div>
      )}

      {mode !== "odometer" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6459", cursor: "pointer" }}>
            <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} style={{ width: "auto" }} />
            Round trip (double the miles)
          </label>
          {mode === "auto" && (
            <button className="btn-ghost" onClick={handleCalc} type="button">
              <Route size={14} /> {calcState.status === "loading" ? "Calculating…" : "Calculate route"}
            </button>
          )}
        </div>
      )}

      {calcState.message && (
        <div style={{ fontSize: 12.5, color: calcState.status === "error" ? "#E85C4A" : "#2FC7AC", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          {calcState.status === "error" ? <AlertCircle size={13} /> : <Check size={13} />}
          {calcState.message}
        </div>
      )}

      {mode !== "odometer" && (
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Miles</label>
            <input type="number" step="0.1" min="0" value={miles} onChange={(e) => setMiles(e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Business purpose</label>
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. DoorDash delivery run" />
          </div>
        </div>
      )}

      {mode === "odometer" && (
        <div style={{ marginBottom: 16, marginTop: 12 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Business purpose</label>
          <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Amazon Flex block" />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Revenue for {date} (optional)</label>
        <input type="number" step="0.01" min="0" value={dayRevenue} onChange={(e) => setDayRevenue(e.target.value)} placeholder="0.00" />
        <div style={{ fontSize: 11, color: "#9C9385", marginTop: 5 }}>
          Sets that date's total revenue — if you've logged other trips the same day, this replaces what was there, it doesn't add to it.
        </div>
      </div>

      {currentMiles > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <span style={{ color: "#6B6459" }}>Deduction: <b style={{ color: "#201C16", fontFamily: "'Space Mono', monospace" }}>${previewDeduction.toFixed(2)}</b></span>
          {previewPL != null && (
            <span style={{ color: "#6B6459" }}>
              P/L: <b style={{ color: previewPL >= 0 ? "#2FC7AC" : "#E85C4A", fontFamily: "'Space Mono', monospace" }}>
                {previewPL >= 0 ? "" : "-"}${Math.abs(previewPL).toFixed(2)}
              </b>
              <span style={{ color: "#9C9385" }}> (${previewRevenueNum.toFixed(2)} rev − ${previewDeduction.toFixed(2)} ded.)</span>
            </span>
          )}
        </div>
      )}

      <button className="btn-primary" onClick={handleSubmit}>
        <Check size={16} /> {initial ? "Save changes" : "Add trip"}
      </button>
    </div>
  );
}

/* ---------- switch gig modal (transition straight from one gig into another) ---------- */

function SwitchGigModal({ activeDay, settings, existingRevenue, onSwitch, onCancel }) {
  const { t } = useT();
  const isFlex = activeDay?.platform === "amazonflex";
  const [currentOdo, setCurrentOdo] = useState("");
  const [switchTime, setSwitchTime] = useState(nowTimeStr());
  const [revenue, setRevenue] = useState("");
  const [nextPlatform, setNextPlatform] = useState("");

  const c = parseFloat(currentOdo);
  const hoursWorked = hoursBetween(activeDay?.startTime, switchTime);
  const legHome = isFlex && activeDay ? Math.max(0, activeDay.pickupOdo - activeDay.startOdo) : null;
  const homeLegCounted = isFlex && activeDay?.homeOffice && legHome != null ? legHome : 0;
  const legRoute = isFlex && isFinite(c) && activeDay ? Math.max(0, c - activeDay.pickupOdo) : null;
  const simpleTotal = !isFlex && isFinite(c) && activeDay ? Math.max(0, c - activeDay.startOdo) : null;
  const totalMiles = isFlex ? (legRoute != null ? homeLegCounted + legRoute : null) : simpleTotal;

  const canSwitch = totalMiles != null && totalMiles > 0 && nextPlatform;

  function handleSwitch() {
    if (!canSwitch) return;
    const trip = {
      id: uid(),
      date: activeDay.date,
      from: "",
      to: "",
      roundTrip: false,
      platform: activeDay.platform,
      purpose: "Ended early — switched to another gig",
      vehicleId: activeDay.vehicleId,
      miles: totalMiles,
      method: "odometer",
      homeOffice: isFlex ? activeDay.homeOffice : true,
      pickupLocation: activeDay.pickupLocation,
      homeLegMode: "odometer",
      homeLegAutoMiles: null,
      startHomeOdo: activeDay.startOdo,
      pickupOdo: isFlex ? activeDay.pickupOdo : null,
      dropOdo: c,
      returnDepotOdo: null,
      returnHomeOdo: null,
      returnMode: "n/a",
      returnAutoMiles: null,
      dropPinAddress: null,
      legHomeMiles: isFlex ? legHome : 0,
      legRouteMiles: isFlex ? legRoute : simpleTotal,
      returnMiles: 0,
      returnVia: null,
      homeLegCounted: isFlex ? homeLegCounted : simpleTotal,
      endOdometer: c,
      startTime: activeDay.startTime || null,
      endTime: switchTime,
      hoursWorked,
      scheduledHours: isFlex ? (activeDay.scheduledHours || null) : null,
    };
    const revenueAmount = isFinite(parseFloat(revenue)) ? parseFloat(revenue) : null;
    const nextDay = {
      date: activeDay.date,
      platform: nextPlatform,
      vehicleId: activeDay.vehicleId,
      homeOffice: activeDay.homeOffice,
      pickupLocation: "",
      pickupOdo: null,
      startOdo: c,
      startTime: switchTime,
      scheduledHours: null,
    };
    onSwitch(trip, revenueAmount, nextDay);
  }

  if (!activeDay) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 65, overflowY: "auto" }}>
      <div className="modal-pop" style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 420, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#201C16", textTransform: "uppercase" }}>{t("switchGig")}</div>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>
        <p style={{ fontSize: 12.5, color: "#9C9385", marginBottom: 18, lineHeight: 1.5 }}>
          {t("switchGigSub").replace("{platform}", platformMeta(activeDay.platform).label)}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("odometerRightNow")}</label>
            <input type="number" step="0.1" value={currentOdo} onChange={(e) => setCurrentOdo(e.target.value)} placeholder="e.g. 40240.5" style={{ fontSize: 16, textAlign: "center" }} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("timeNow")}</label>
            <input type="time" value={switchTime} onChange={(e) => setSwitchTime(e.target.value)} />
          </div>
        </div>
        {hoursWorked != null && (
          <div style={{ fontSize: 12, color: "#9C9385", marginBottom: 14 }}>{formatHours(hoursWorked)} {t("onPlatform")} {platformMeta(activeDay.platform).label}</div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("revenueFromShift").replace("{platform}", platformMeta(activeDay.platform).label)}</label>
          <input type="number" step="0.01" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="0.00" />
        </div>

        {totalMiles != null && (
          <div style={{ background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12.5, color: "#6B6459", display: "flex", justifyContent: "space-between" }}>
            <span>{t("milesClosedOut")}</span>
            <span className="mono" style={{ color: "#F5A623" }}>{totalMiles.toFixed(1)} mi</span>
          </div>
        )}

        <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("startingNextGig")}</label>
        <select value={nextPlatform} onChange={(e) => setNextPlatform(e.target.value)} style={{ marginBottom: 18 }}>
          <option value="">{t("whichPlatform")}</option>
          {PLATFORMS.filter((p) => p.id !== activeDay.platform && p.id !== "personal" && p.id !== "other").map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        <button className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: canSwitch ? 1 : 0.5 }} disabled={!canSwitch} onClick={handleSwitch}>
          <Repeat size={16} /> {t("switchGigsBtn")}
        </button>
      </div>
    </div>
  );
}

/* ---------- day complete reveal (the payoff moment after finishing a shift) ---------- */

function DayCompleteReveal({ data, onDone }) {
  const { t } = useT();
  const milesAnim = useCountUp(data.miles);
  const plAnim = useCountUp(Math.abs(data.accountingPL));
  const hourlyRate = data.hoursWorked ? data.accountingPL / data.hoursWorked : null;
  const hourlyAnim = useCountUp(hourlyRate != null ? Math.abs(hourlyRate) : 0);
  const positive = data.accountingPL >= 0;
  const cashPositive = data.cashPL >= 0;
  const reassurance = !positive && cashPositive;

  let headline, sub;
  if (positive) {
    headline = t("niceWorkToday");
    sub = `${platformMeta(data.platform).label} · $${data.revenue.toFixed(2)} ${t("revenueLogged")}`;
  } else if (reassurance) {
    headline = t("stillCashPositive");
    sub = t("cashPositiveSub");
  } else {
    headline = t("slowerDay");
    sub = t("slowerDaySub");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#F5F2EC", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div className="rise-in" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 11.5, letterSpacing: 2, color: "#9C9385", textTransform: "uppercase", marginBottom: 16 }}>{t("dayComplete")}</div>
        <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 6 }}>{headline}</div>
        <p style={{ fontSize: 13.5, color: "#6B6459", marginBottom: 30, lineHeight: 1.55 }}>{sub}</p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Odometer value={milesAnim} digits={4} decimals={1} glow="#F5A623" />
        </div>
        <div style={{ fontSize: 11, color: "#9C9385", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 30 }}>{t("milesToday")}</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: positive ? "#2FC7AC" : "#E85C4A", fontFamily: "'Space Mono', monospace" }}>{positive ? "+" : "-"}$</span>
          <Odometer value={plAnim} digits={3} decimals={2} glow={positive ? "#2FC7AC" : "#E85C4A"} />
        </div>
        <div style={{ fontSize: 11, color: "#9C9385", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: hourlyRate != null ? 30 : 34 }}>{t("accountingPL")}</div>

        {hourlyRate != null && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: hourlyRate >= 0 ? "#2FC7AC" : "#E85C4A", fontFamily: "'Space Mono', monospace" }}>{hourlyRate >= 0 ? "" : "-"}$</span>
              <Odometer value={hourlyAnim} digits={2} decimals={2} glow={hourlyRate >= 0 ? "#2FC7AC" : "#E85C4A"} />
              <span style={{ fontSize: 15, color: "#6B6459", fontFamily: "'Space Mono', monospace" }}>/hr</span>
            </div>
            <div style={{ fontSize: 11, color: "#9C9385", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
              {formatHours(data.hoursWorked)} {t("hoursWorkedLabel")}
            </div>
            {data.scheduledHours && (
              <div style={{ fontSize: 12, color: data.hoursWorked > data.scheduledHours ? "#E85C4A" : "#2FC7AC", marginBottom: data.hoursWorked > data.scheduledHours ? 14 : 22 }}>
                {t("scheduled")} {data.scheduledHours}h — {data.hoursWorked > data.scheduledHours ? t("ranOverBy") : t("underBy")} {formatHours(Math.abs(data.hoursWorked - data.scheduledHours))}
              </div>
            )}
            {data.scheduledHours && data.hoursWorked > data.scheduledHours && (
              <div style={{ background: "#FDF3E7", border: "1px solid #F5A62355", borderRadius: 8, padding: 12, marginBottom: 22, textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AlertCircle size={15} color="#E08A1E" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, color: "#201C16", fontWeight: 600, marginBottom: 4 }}>{t("dontForget")}</div>
                  <div style={{ fontSize: 12, color: "#6B6459", lineHeight: 1.5, marginBottom: 8 }}>
                    {t("reachOutExtra")} {formatHours(data.hoursWorked - data.scheduledHours)} {t("thisBlockTook")}
                  </div>
                  <a
                    href={overtimeMailtoLink({
                      date: data.date,
                      scheduledHours: data.scheduledHours,
                      hoursWorked: data.hoursWorked,
                      pickupLocation: data.pickupLocation,
                      startTime: data.startTime,
                      reason: data.overtimeReason,
                    })}
                    className="btn-ghost"
                    style={{ textDecoration: "none", display: "inline-flex" }}
                  >
                    <Mail size={13} /> {t("draftTheEmail")}
                  </a>
                </div>
              </div>
            )}
            {!data.scheduledHours && <div style={{ marginBottom: 22 }} />}
          </>
        )}

        <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }} onClick={onDone}>
          <Check size={17} /> {t("done")}
        </button>
      </div>
    </div>
  );
}

/* ---------- pickup arrival modal (second checkpoint of the day) ---------- */

function PickupArrivalModal({ activeDay, places, onLogArrival, onCancel }) {
  const { t } = useT();
  const [pickupOdo, setPickupOdo] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const canSave = pickupOdo && parseFloat(pickupOdo) >= (activeDay?.startOdo || 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 65, overflowY: "auto" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 420, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#201C16", textTransform: "uppercase" }}>{t("arrivedAtPickup")}</div>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>
        <p style={{ fontSize: 12.5, color: "#9C9385", marginBottom: 18 }}>{t("startedTodayAt")} {activeDay?.startOdo.toFixed(1)} mi</p>

        <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("odometerNow")}</label>
        <input
          type="number"
          step="0.1"
          value={pickupOdo}
          onChange={(e) => setPickupOdo(e.target.value)}
          placeholder="e.g. 40213.5"
          style={{ marginBottom: 14, fontSize: 16, textAlign: "center" }}
          autoFocus
        />

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <label style={{ fontSize: 11, color: "#6B6459" }}>{t("whichDistCenter")}</label>
            <QuickFillSelect places={places} homeAddress={null} onPick={setPickupLocation} />
          </div>
          <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. DLT3" />
        </div>

        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", opacity: canSave ? 1 : 0.5 }}
          disabled={!canSave}
          onClick={() => canSave && onLogArrival({ pickupOdo: parseFloat(pickupOdo), pickupLocation })}
        >
          <Check size={16} /> {t("logArrival")}
        </button>
      </div>
    </div>
  );
}

/* ---------- end day modal (third checkpoint — closes the day out automatically) ---------- */

function EndDayModal({ activeDay, settings, places, existingRevenue, onFinish, onCancel, onDiscardDay }) {
  const { t } = useT();
  const isFlex = activeDay?.platform === "amazonflex";
  const [dropOdo, setDropOdo] = useState("");
  const [endTime, setEndTime] = useState(nowTimeStr());
  const [delayReason, setDelayReason] = useState("");
  const [returnMiles, setReturnMiles] = useState(null);
  const [returnVia, setReturnVia] = useState(null);
  const [manualReturnMiles, setManualReturnMiles] = useState("");
  const [dropCalc, setDropCalc] = useState({ status: "idle", message: "" });
  const [revenue, setRevenue] = useState("");

  const hoursWorked = hoursBetween(activeDay?.startTime, endTime);

  const selectedPickupPlace = useMemo(
    () => (places || []).find((p) => p.address === activeDay?.pickupLocation || p.code === activeDay?.pickupLocation) || null,
    [places, activeDay]
  );

  const d = parseFloat(dropOdo);

  // Amazon Flex: three checkpoints (home, pickup, drop) plus a calculated return leg.
  const legHome = isFlex && activeDay ? Math.max(0, activeDay.pickupOdo - activeDay.startOdo) : null;
  const legRoute = isFlex && isFinite(d) && activeDay ? Math.max(0, d - activeDay.pickupOdo) : null;
  const homeLegCounted = isFlex && activeDay?.homeOffice && legHome != null ? legHome : 0;
  const finalReturnMiles = returnMiles != null ? returnMiles : (parseFloat(manualReturnMiles) || null);

  // Everything else (Uber, Lyft, DoorDash, Instacart, Grubhub): one continuous round
  // trip from home back to home — the whole loop counts, no legs to split out.
  const simpleTotal = !isFlex && isFinite(d) && activeDay ? Math.max(0, d - activeDay.startOdo) : null;

  const totalMiles = isFlex
    ? (legRoute != null ? homeLegCounted + legRoute + (finalReturnMiles || 0) : null)
    : simpleTotal;

  async function handleMarkFinalDrop() {
    const canAutoReturn = !!(selectedPickupPlace?.address || settings?.homeAddress);
    if (!canAutoReturn) {
      setDropCalc({ status: "error", message: t("noDepotOrHome") });
      return;
    }
    setDropCalc({ status: "loading", message: t("gettingLocation") });
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Location isn't available in this browser")); return; }
        navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("Location permission denied")), { enableHighAccuracy: true, timeout: 10000 });
      });
      const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      const candidates = [];
      if (selectedPickupPlace?.address) {
        const depotCoord = await geocode(selectedPickupPlace.address);
        candidates.push({ via: "depot", miles: await routeMiles(here, depotCoord) });
      }
      if (settings?.homeAddress) {
        const homeCoord = await geocode(settings.homeAddress);
        candidates.push({ via: "home", miles: await routeMiles(here, homeCoord) });
      }
      if (!candidates.length) throw new Error("no depot or home address to route back to");
      const chosen = activeDay.homeOffice
        ? candidates.find((c) => c.via === "home") || candidates.sort((a, b) => a.miles - b.miles)[0]
        : candidates.sort((a, b) => a.miles - b.miles)[0];
      setReturnMiles(chosen.miles);
      setReturnVia(chosen.via);
      setDropCalc({ status: "done", message: `${t("returnVia")} ${chosen.via}: ${chosen.miles.toFixed(1)} mi` });
    } catch (e) {
      setDropCalc({ status: "error", message: `${t("couldntAutoCalc")} (${e.message}) — ${t("enterManuallyInstead")}` });
    }
  }

  const fullRate = activeDay ? rateForDate(activeDay.date, settings.customRate) : 0;
  const cashRate = activeDay ? cashRateForDate(activeDay.date, settings) : 0;
  const accountingDeduction = totalMiles != null ? totalMiles * fullRate : null;
  const cashDeduction = totalMiles != null ? totalMiles * cashRate : null;
  const rev = parseFloat(revenue);
  const accountingPL = isFinite(rev) && accountingDeduction != null ? rev - accountingDeduction : null;
  const cashPL = isFinite(rev) && cashDeduction != null ? rev - cashDeduction : null;

  function handleFinish() {
    if (totalMiles == null || totalMiles <= 0) return;
    const trip = {
      id: uid(),
      date: activeDay.date,
      from: "",
      to: "",
      roundTrip: false,
      platform: activeDay.platform,
      purpose: "",
      vehicleId: activeDay.vehicleId,
      miles: totalMiles,
      method: "odometer",
      homeOffice: isFlex ? activeDay.homeOffice : true,
      pickupLocation: activeDay.pickupLocation,
      homeLegMode: "odometer",
      homeLegAutoMiles: null,
      startHomeOdo: activeDay.startOdo,
      pickupOdo: isFlex ? activeDay.pickupOdo : null,
      dropOdo: d,
      returnDepotOdo: isFlex && returnVia === "depot" ? finalReturnMiles : null,
      returnHomeOdo: isFlex && returnVia === "home" ? finalReturnMiles : null,
      returnMode: isFlex ? (returnMiles != null ? "gps" : "manual") : "n/a",
      returnAutoMiles: isFlex ? returnMiles : null,
      dropPinAddress: null,
      legHomeMiles: isFlex ? legHome : 0,
      legRouteMiles: isFlex ? legRoute : simpleTotal,
      returnMiles: isFlex ? finalReturnMiles : 0,
      returnVia: isFlex ? returnVia : null,
      homeLegCounted: isFlex ? homeLegCounted : simpleTotal,
      endOdometer: isFlex ? d + (finalReturnMiles || 0) : d,
      startTime: activeDay.startTime || null,
      endTime,
      hoursWorked,
      scheduledHours: isFlex ? (activeDay.scheduledHours || null) : null,
      overtimeReason: isFlex ? (delayReason || null) : null,
    };
    onFinish(trip, isFinite(rev) ? rev : null);
  }

  if (!activeDay) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 65, overflowY: "auto" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 440, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#201C16", textTransform: "uppercase" }}>{t("endYourDay")}</div>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>
        <p style={{ fontSize: 12.5, color: "#9C9385", marginBottom: 18 }}>
          {isFlex
            ? `${t("home")} ${activeDay.startOdo.toFixed(1)} mi → ${t("pickup")} ${activeDay.pickupOdo.toFixed(1)} mi${activeDay.pickupLocation ? ` (${activeDay.pickupLocation})` : ""}`
            : `${t("startedAt")} ${activeDay.startOdo.toFixed(1)} mi`}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>
              {isFlex ? t("odometerLastDrop") : t("odometerEndingHome")}
            </label>
            <input type="number" step="0.1" value={dropOdo} onChange={(e) => setDropOdo(e.target.value)} placeholder="e.g. 40261.2" style={{ fontSize: 16, textAlign: "center" }} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("endTime")}</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        {hoursWorked != null && (
          <div style={{ fontSize: 12, color: "#9C9385", marginBottom: 14 }}>
            {formatHours(hoursWorked)} {t("worked")}{activeDay.scheduledHours ? ` · ${t("scheduledFor")} ${activeDay.scheduledHours}h` : ""}
            {activeDay.scheduledHours && (
              <span style={{ color: hoursWorked > activeDay.scheduledHours ? "#E85C4A" : "#2FC7AC" }}>
                {" "}({hoursWorked > activeDay.scheduledHours ? "+" : ""}{formatHours(Math.abs(hoursWorked - activeDay.scheduledHours))} {hoursWorked > activeDay.scheduledHours ? t("over") : t("under")})
              </span>
            )}
          </div>
        )}

        {isFlex && activeDay.scheduledHours && hoursWorked > activeDay.scheduledHours && (
          <div style={{ background: "#FDF3E7", border: "1px solid #F5A62355", borderRadius: 8, padding: 12, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertCircle size={15} color="#E08A1E" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: "#201C16", fontWeight: 600, marginBottom: 4 }}>{t("blockRanLong")}</div>
              <div style={{ fontSize: 12, color: "#6B6459", lineHeight: 1.5, marginBottom: 8 }}>
                {t("dontForgetReachOut")} {formatHours(hoursWorked - activeDay.scheduledHours)}.{" "}
                {t("amazonWants")}
              </div>
              <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 4 }}>{t("whyLonger")}</label>
              <textarea
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder={t("whyLongerPlaceholder")}
                rows={2}
                style={{ marginBottom: 10, resize: "vertical" }}
              />
              <a
                href={overtimeMailtoLink({
                  date: activeDay.date,
                  scheduledHours: activeDay.scheduledHours,
                  hoursWorked,
                  pickupLocation: activeDay.pickupLocation,
                  startTime: activeDay.startTime,
                  reason: delayReason,
                })}
                className="btn-ghost"
                style={{ textDecoration: "none", display: "inline-flex" }}
              >
                <Mail size={13} /> {t("draftEmailSupport")}
              </a>
            </div>
          </div>
        )}


        {isFlex && (
          <>
            <button className="btn-ghost" type="button" onClick={handleMarkFinalDrop} style={{ marginBottom: 10 }}>
              <MapPin size={13} /> {dropCalc.status === "loading" ? t("locating") : t("calculateReturn")}
            </button>
            {dropCalc.message && (
              <div style={{ fontSize: 12, color: dropCalc.status === "error" ? "#E85C4A" : "#2FC7AC", marginBottom: 10 }}>{dropCalc.message}</div>
            )}
            {returnMiles == null && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("orEnterManually")}</label>
                <input type="number" step="0.1" value={manualReturnMiles} onChange={(e) => setManualReturnMiles(e.target.value)} placeholder="optional" />
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("revenueFromThisShift")}</label>
          <input type="number" step="0.01" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="0.00" />
          {existingRevenue !== "" && existingRevenue != null && Number(existingRevenue) !== 0 && (
            <div style={{ fontSize: 11.5, color: "#9C9385", marginTop: 6 }}>
              {t("alreadyLogged")} ${Number(existingRevenue).toFixed(2)} {t("forDate")} {activeDay.date} — {t("shiftAddedToThat")}
            </div>
          )}
        </div>

        {totalMiles != null && (
          <div style={{ background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6459", marginBottom: 6 }}>
              <span>{t("totalDeductibleMiles")}</span>
              <span className="mono" style={{ color: "#F5A623" }}>{totalMiles.toFixed(1)} mi</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6459", marginBottom: 6 }}>
              <span>{t("estDeduction")}</span>
              <span className="mono">${accountingDeduction.toFixed(2)}</span>
            </div>
            {accountingPL != null && (
              <>
                <div style={{ borderTop: "1px dashed #E2DED4", margin: "10px 0" }} />
                <div style={{ fontSize: 11, color: "#9C9385", marginBottom: 8 }}>
                  ${rev.toFixed(2)} {t("revenue")} − ${accountingDeduction.toFixed(2)} {t("deduction")}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700 }}>
                  <span>{t("accountingPLToday")}</span>
                  <span className="mono" style={{ color: accountingPL >= 0 ? "#2FC7AC" : "#E85C4A" }}>
                    {accountingPL >= 0 ? "" : "-"}${Math.abs(accountingPL).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6459", marginTop: 4 }}>
                  <span>{t("cashPLToday")}</span>
                  <span className="mono" style={{ color: cashPL >= 0 ? "#2FC7AC" : "#E85C4A" }}>
                    {cashPL >= 0 ? "" : "-"}${Math.abs(cashPL).toFixed(2)}
                  </span>
                </div>
                {hoursWorked != null && hoursWorked > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6459", marginTop: 4 }}>
                    <span>{t("perHourWorked")}</span>
                    <span className="mono" style={{ color: accountingPL >= 0 ? "#2FC7AC" : "#E85C4A" }}>
                      ${(accountingPL / hoursWorked).toFixed(2)}/hr
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: totalMiles ? 1 : 0.5 }} disabled={!totalMiles} onClick={handleFinish}>
          <Check size={16} /> {t("finishDay")}
        </button>
        <button onClick={onDiscardDay} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: "#9C9385", fontSize: 12, cursor: "pointer", marginTop: 12 }}>
          {t("discardThisDay")}
        </button>
      </div>
    </div>
  );
}

/* ---------- start day screen (single odometer reading kicks off the whole day) ---------- */

function StartDayScreen({ settings, vehicles, platform, onStart, onSkip }) {
  const { t } = useT();
  const [startOdo, setStartOdo] = useState("");
  const [startTime, setStartTime] = useState(nowTimeStr());
  const [scheduledHours, setScheduledHours] = useState("");
  const [homeOffice, setHomeOffice] = useState(settings?.homeOfficeDefault || false);
  const [vehicleId, setVehicleId] = useState(vehicles && vehicles.length === 1 ? vehicles[0].id : "");
  const isFlex = platform === "amazonflex";

  const canStart = startOdo && parseFloat(startOdo) >= 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#F5F2EC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 65, overflowY: "auto" }}>
      <div style={{ maxWidth: 420, width: "100%", margin: "20px 0" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Route size={22} color="#201C16" strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>{t("beforeYouHeadOut")}</div>
        <p style={{ fontSize: 13.5, color: "#6B6459", textAlign: "center", lineHeight: 1.55, marginBottom: 26 }}>
          {isFlex ? t("startDaySubFlex") : t("startDaySubOther")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("startingOdometer")}</label>
            <input
              type="number"
              step="0.1"
              value={startOdo}
              onChange={(e) => setStartOdo(e.target.value)}
              placeholder="e.g. 40201.0"
              style={{ fontSize: 18, textAlign: "center" }}
              autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("startTime")}</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
        </div>

        {isFlex && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("scheduledBlockLength")}</label>
            <input type="number" step="0.25" min="0" value={scheduledHours} onChange={(e) => setScheduledHours(e.target.value)} placeholder="e.g. 3.5" />
            <div style={{ fontSize: 11, color: "#9C9385", marginTop: 5 }}>
              {t("scheduledBlockHelp")}
            </div>
          </div>
        )}

        {vehicles && vehicles.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>{t("vehicle")}</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">{t("selectVehicle")}</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>)}
            </select>
          </div>
        )}

        {isFlex && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 24, cursor: "pointer" }}>
            <input type="checkbox" checked={homeOffice} onChange={(e) => setHomeOffice(e.target.checked)} style={{ width: "auto" }} />
            {t("claimingHomeOffice")}
          </label>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, opacity: canStart ? 1 : 0.5 }}
          disabled={!canStart}
          onClick={() => canStart && onStart({
            date: todayStr(),
            platform,
            vehicleId: vehicleId || null,
            homeOffice,
            pickupLocation: "",
            pickupOdo: null,
            startOdo: parseFloat(startOdo),
            startTime,
            scheduledHours: scheduledHours ? parseFloat(scheduledHours) : null,
          })}
        >
          <Check size={17} /> {t("startMyDay")}
        </button>
        <button onClick={onSkip} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: "#9C9385", fontSize: 12.5, cursor: "pointer", marginTop: 14 }}>
          {t("skipLogManually")}
        </button>
      </div>
    </div>
  );
}

/* ---------- greeting screen (shown on open — "which gig job today?") ---------- */

function greetingWord(t) {
  const h = new Date().getHours();
  if (h < 12) return t("goodMorning");
  if (h < 18) return t("goodAfternoon");
  return t("goodEvening");
}

function GreetingScreen({ userName, onSetName, onSelect, onSkip }) {
  const { t } = useT();
  const [name, setName] = useState(userName || "");
  const [editingName, setEditingName] = useState(!userName);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#F5F2EC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 70 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <Car size={24} color="#201C16" strokeWidth={2.5} />
        </div>

        {editingName ? (
          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{greetingWord(t)}!</div>
            <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 6 }}>{t("whatShouldWeCallYou")}</label>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("firstName")}
                style={{ maxWidth: 220 }}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) { onSetName(name.trim()); setEditingName(false); } }}
              />
              <button className="btn-primary" onClick={() => { if (name.trim()) { onSetName(name.trim()); setEditingName(false); } }}>
                <Check size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 30 }}>
            <div className="mono" style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.3 }}>
              {greetingWord(t)}, {userName}
            </div>
            <button
              onClick={() => setEditingName(true)}
              style={{ background: "none", border: "none", color: "#9C9385", fontSize: 12, cursor: "pointer", marginTop: 6, padding: 0 }}
            >
              {t("notYouEditName")}
            </button>
          </div>
        )}

        {!editingName && (
          <>
            <div style={{ fontSize: 15, color: "#6B6459", marginBottom: 20 }}>{t("whichGigToday")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
              {PLATFORMS.filter((p) => p.id !== "personal" && p.id !== "other").map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9, justifyContent: "center",
                    background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 8,
                    padding: "14px 10px", color: "#201C16", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    transition: "border-color 150ms ease, transform 150ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2DED4"; }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <button onClick={() => onSelect("personal")} style={{ background: "none", border: "none", color: "#9C9385", fontSize: 12.5, cursor: "pointer" }}>
                {t("personalDriving")}
              </button>
              <button onClick={onSkip} style={{ background: "none", border: "none", color: "#9C9385", fontSize: 12.5, cursor: "pointer" }}>
                {t("skipShowApp")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- onboarding walkthrough ---------- */

const ONBOARDING_STEPS = ["Welcome", "Disclaimer", "Home address", "Distribution points", "Vehicles", "Rate defaults", "You're set"];

function OnboardingModal({ settings, places, vehicles, onUpdateSettings, onAddPlace, onDeletePlace, onAddVehicle, onDeleteVehicle, onClose }) {
  const [step, setStep] = useState(0);
  const last = ONBOARDING_STEPS.length - 1;

  function next() {
    if (step === last) onClose();
    else setStep((s) => s + 1);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 60, overflowY: "auto" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 460, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {ONBOARDING_STEPS.map((_, i) => (
              <span key={i} style={{ width: 22, height: 3, borderRadius: 2, background: i <= step ? "#F5A623" : "#E2DED4" }} />
            ))}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>
        <div style={{ fontSize: 11, color: "#9C9385", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
          Step {step + 1} of {ONBOARDING_STEPS.length} — {ONBOARDING_STEPS[step]}
        </div>

        {step === 0 && <OnboardWelcome settings={settings} onUpdateSettings={onUpdateSettings} />}
        {step === 1 && <OnboardDisclaimer />}
        {step === 2 && <OnboardHome settings={settings} onUpdateSettings={onUpdateSettings} />}
        {step === 3 && <OnboardPlaces places={places} onAddPlace={onAddPlace} onDeletePlace={onDeletePlace} />}
        {step === 4 && <OnboardVehicles vehicles={vehicles} onAddVehicle={onAddVehicle} onDeleteVehicle={onDeleteVehicle} />}
        {step === 5 && <OnboardRates settings={settings} onUpdateSettings={onUpdateSettings} />}
        {step === 6 && <OnboardDone />}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          <button className="btn-ghost" onClick={back} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={14} /> Back
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {step < last && (
              <button className="btn-ghost" onClick={onClose}>Skip setup</button>
            )}
            <button className="btn-primary" onClick={next}>
              {step === last ? "Start tracking" : "Next"} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardWelcome({ settings, onUpdateSettings }) {
  const [name, setName] = useState(settings?.userName || "");
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Welcome to TripSlip</div>
      <p style={{ fontSize: 13.5, color: "#6B6459", lineHeight: 1.6, marginBottom: 10 }}>
        TripSlip logs your driving miles, works out your IRS deduction, and shows a monthly profit/loss picture built
        for gig work — including the difference between an "accounting loss" (which includes vehicle depreciation)
        and your actual cash flow.
      </p>
      <p style={{ fontSize: 13.5, color: "#6B6459", lineHeight: 1.6, marginBottom: 16 }}>
        This quick setup gets your home address, any regular pickup points (like an Amazon distribution center), and
        your rate preferences in place — takes about a minute, and you can change any of it later.
      </p>
      <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>What should we call you?</label>
      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); onUpdateSettings({ userName: e.target.value }); }}
        placeholder="First name"
      />
    </div>
  );
}

function OnboardDisclaimer() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#F5F2EC", border: "1px solid #E85C4A44", borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <AlertCircle size={16} color="#E85C4A" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>TripSlip isn't an accounting firm</div>
          <p style={{ fontSize: 13.5, color: "#6B6459", lineHeight: 1.6 }}>
            Everything in this app — mileage rates, deduction estimates, home-office logic, profit/loss numbers — is
            a calculator built on general rules, not personalized tax advice. It doesn't know your full tax
            situation, and it can't tell you whether a home office, a rate, or a filing choice is right for you.
          </p>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: "#6B6459", lineHeight: 1.6 }}>
        For anything tax-related — what you can deduct, how to file, whether you qualify for a home office — please
        talk to a qualified tax professional. TripSlip is here to make tracking and organizing your numbers easier,
        not to replace that advice.
      </p>
    </div>
  );
}

function OnboardHome({ settings, onUpdateSettings }) {
  const [home, setHome] = useState(settings.homeAddress || "");
  const [locState, setLocState] = useState({ status: "idle", message: "" });

  async function useCurrentLocation() {
    setLocState({ status: "loading", message: "Getting your location…" });
    try {
      const addr = await getCurrentAddress();
      setHome(addr);
      onUpdateSettings({ homeAddress: addr });
      setLocState({ status: "done", message: "Filled in — double check it before moving on." });
    } catch (e) {
      setLocState({ status: "error", message: `${e.message}. Paste the address from Apple Maps or Google Maps instead.` });
    }
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.55, marginBottom: 14 }}>
        If you claim a qualifying home office, drives to and from home can count as business miles. Browsers can't
        pull a saved address out of Apple Maps or Google Maps directly — paste it in, or use your current location if
        you're home right now.
      </p>
      <input
        type="text"
        value={home}
        onChange={(e) => { setHome(e.target.value); onUpdateSettings({ homeAddress: e.target.value }); }}
        placeholder="Paste from Maps, e.g. 413 Goodman Rd, Concord, NC"
        style={{ marginBottom: 10 }}
      />
      <button className="btn-ghost" type="button" onClick={useCurrentLocation}>
        <MapPin size={13} /> {locState.status === "loading" ? "Locating…" : "Use current location"}
      </button>
      {locState.message && (
        <div style={{ fontSize: 12, color: locState.status === "error" ? "#E85C4A" : "#2FC7AC", marginTop: 8 }}>{locState.message}</div>
      )}
      <div style={{ fontSize: 12, color: "#9C9385", marginTop: 12 }}>Optional — you can skip this and add it later under Places.</div>
    </div>
  );
}

function OnboardPlaces({ places, onAddPlace, onDeletePlace }) {
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("amazon");

  function parseAndAdd() {
    let c = code.trim();
    let a = address.trim();
    const dash = c.match(/^(\S+)\s*[-–]\s*(.+)$/);
    if (!a && dash) {
      c = dash[1];
      a = dash[2];
    }
    if (!c || !a) return;
    onAddPlace({ code: c, label: c, address: a, type });
    setCode("");
    setAddress("");
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.55, marginBottom: 14 }}>
        Add any warehouse, station, or depot you drive to regularly — you'll be able to pick these by code instead of
        retyping the address every time.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8, marginBottom: 8 }}>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="DLT3" />
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="413 Goodman Rd, Concord, NC" />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <span onClick={() => setType("amazon")} className="chip" style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: `1px solid ${type === "amazon" ? "#F5A623" : "#E2DED4"}`, color: type === "amazon" ? "#F5A623" : "#6B6459" }}>
          Amazon distribution center
        </span>
        <span onClick={() => setType("other")} className="chip" style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: `1px solid ${type === "other" ? "#F5A623" : "#E2DED4"}`, color: type === "other" ? "#F5A623" : "#6B6459" }}>
          Other location
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#9C9385", marginBottom: 10 }}>
        Tip: paste the whole thing in the code field, e.g. "DLT3 - 413 Goodman Rd Concord, NC"
      </div>
      <button className="btn-primary" type="button" onClick={parseAndAdd}>
        <Plus size={14} /> Add place
      </button>
      {places.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {places.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: "8px 10px" }}>
              <div>
                <div style={{ fontSize: 12.5, color: "#F5A623", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                  {p.code} {p.type === "amazon" && <span style={{ fontSize: 10, color: "#00A8E1", fontWeight: 400, marginLeft: 4 }}>Amazon</span>}
                </div>
                <div style={{ fontSize: 12, color: "#6B6459" }}>{p.address}</div>
              </div>
              <button onClick={() => onDeletePlace(p.id)} className="btn-ghost" style={{ padding: 6 }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12, color: "#9C9385", marginTop: 12 }}>Optional — skip this and add more anytime under Places.</div>
    </div>
  );
}

function OnboardVehicles({ vehicles, onAddVehicle, onDeleteVehicle }) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [datePlacedInService, setDatePlacedInService] = useState("");
  const [nickname, setNickname] = useState("");

  function handleAdd() {
    if (!year.trim() || !make.trim() || !model.trim()) return;
    onAddVehicle({ year: year.trim(), make: make.trim(), model: model.trim(), datePlacedInService, nickname: nickname.trim() });
    setYear("");
    setMake("");
    setModel("");
    setDatePlacedInService("");
    setNickname("");
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.55, marginBottom: 14 }}>
        Add the vehicle(s) you drive for gig work, including the date you started using each one for business — the
        IRS standard mileage method requires that. With more than one vehicle, you'll pick which one you used on
        each trip.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", gap: 8, marginBottom: 8 }}>
        <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
        <input type="text" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make" />
        <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 10.5, color: "#9C9385", display: "block", marginBottom: 4 }}>Date placed in service</label>
          <input type="date" value={datePlacedInService} onChange={(e) => setDatePlacedInService(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 10.5, color: "#9C9385", display: "block", marginBottom: 4 }}>Nickname (optional)</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Work car" />
        </div>
      </div>
      <button className="btn-primary" type="button" onClick={handleAdd}>
        <Plus size={14} /> Add vehicle
      </button>
      {vehicles.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {vehicles.map((v) => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: "8px 10px" }}>
              <div>
                <div style={{ fontSize: 12.5, color: "#F5A623", fontWeight: 700 }}>{vehicleLabel(v)}</div>
                <div style={{ fontSize: 12, color: "#6B6459" }}>
                  {v.year} {v.make} {v.model}{v.datePlacedInService ? ` · in service ${v.datePlacedInService}` : ""}
                </div>
              </div>
              <button onClick={() => onDeleteVehicle(v.id)} className="btn-ghost" style={{ padding: 6 }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12, color: "#9C9385", marginTop: 12 }}>Optional — skip this and add vehicles anytime under Vehicles.</div>
    </div>
  );
}

function OnboardRates({ settings, onUpdateSettings }) {
  const [useCustom, setUseCustom] = useState(settings.customRate != null);
  const [rate, setRate] = useState(settings.customRate != null ? settings.customRate.toString() : "0.76");
  const [homeOfficeDefault, setHomeOfficeDefault] = useState(settings.homeOfficeDefault || false);

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.55, marginBottom: 14 }}>
        By default, deductions use the current IRS business-use rate for each trip's date (76¢/mi as of July 2026).
        Most drivers can leave this alone.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={useCustom}
          onChange={(e) => { setUseCustom(e.target.checked); onUpdateSettings({ customRate: e.target.checked ? parseFloat(rate) || 0 : null }); }}
          style={{ width: "auto" }}
        />
        Use a custom flat rate instead
      </label>
      {useCustom && (
        <input
          type="number"
          step="0.001"
          value={rate}
          onChange={(e) => { setRate(e.target.value); onUpdateSettings({ customRate: parseFloat(e.target.value) || 0 }); }}
          placeholder="0.76"
          style={{ marginBottom: 14 }}
        />
      )}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={homeOfficeDefault}
          onChange={(e) => { setHomeOfficeDefault(e.target.checked); onUpdateSettings({ homeOfficeDefault: e.target.checked }); }}
          style={{ width: "auto" }}
        />
        I regularly claim a qualifying home office
      </label>
      <div style={{ fontSize: 12, color: "#9C9385", marginTop: 12 }}>
        This just pre-checks the home-office box on new odometer-log trips — you can override it per trip.
      </div>
    </div>
  );
}

function OnboardDone() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>You're set</div>
      <p style={{ fontSize: 13.5, color: "#6B6459", lineHeight: 1.6, marginBottom: 12 }}>
        Three ways to log a trip: paste addresses for an auto-calculated route, type a manual mile total, or use the
        odometer log for multi-drop routes like Amazon Flex.
      </p>
      <p style={{ fontSize: 13.5, color: "#6B6459", lineHeight: 1.6 }}>
        Log a day's revenue alongside your miles to see Accounting P/L and Cash P/L side by side — a slow day on
        paper often isn't a slow day in your bank account, and the monthly summary is where that becomes clear.
      </p>
    </div>
  );
}

/* ---------- vehicles modal ---------- */

function VehiclesModal({ vehicles, onAddVehicle, onDeleteVehicle, onClose }) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [datePlacedInService, setDatePlacedInService] = useState("");
  const [nickname, setNickname] = useState("");

  function handleAdd() {
    if (!year.trim() || !make.trim() || !model.trim()) return;
    onAddVehicle({ year: year.trim(), make: make.trim(), model: model.trim(), datePlacedInService, nickname: nickname.trim() });
    setYear("");
    setMake("");
    setModel("");
    setDatePlacedInService("");
    setNickname("");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50, overflowY: "auto" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 440, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#201C16", textTransform: "uppercase" }}>Your vehicles</div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>
        <p style={{ fontSize: 12.5, color: "#9C9385", lineHeight: 1.5, marginBottom: 18 }}>
          The IRS standard mileage method requires you to track the date you started using each vehicle for
          business — add that here alongside the basics. If you drive more than one vehicle, you'll get a vehicle
          picker on each trip; with just one, it's used automatically.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
          <input type="text" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make (e.g. Honda)" />
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model (e.g. Civic)" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 10.5, color: "#9C9385", display: "block", marginBottom: 4 }}>Date placed in service</label>
            <input type="date" value={datePlacedInService} onChange={(e) => setDatePlacedInService(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 10.5, color: "#9C9385", display: "block", marginBottom: 4 }}>Nickname (optional)</label>
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Work car" />
          </div>
        </div>
        <button className="btn-primary" type="button" onClick={handleAdd}>
          <Plus size={14} /> Add vehicle
        </button>

        {vehicles.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {vehicles.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: "8px 10px" }}>
                <div>
                  <div style={{ fontSize: 12.5, color: "#F5A623", fontWeight: 700 }}>{vehicleLabel(v)}</div>
                  <div style={{ fontSize: 12, color: "#6B6459" }}>
                    {v.year} {v.make} {v.model}{v.datePlacedInService ? ` · in service ${v.datePlacedInService}` : ""}
                  </div>
                </div>
                <button onClick={() => onDeleteVehicle(v.id)} className="btn-ghost" style={{ padding: 6 }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- places modal (home address + saved distribution points) ---------- */

function PlacesModal({ places, homeAddress, onSetHome, onAddPlace, onDeletePlace, onClose }) {
  const [home, setHome] = useState(homeAddress || "");
  const [locState, setLocState] = useState({ status: "idle", message: "" });
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("amazon");

  async function useCurrentLocation() {
    setLocState({ status: "loading", message: "Getting your location…" });
    try {
      const addr = await getCurrentAddress();
      setHome(addr);
      setLocState({ status: "done", message: "Filled in from your current location — double check it before saving." });
    } catch (e) {
      setLocState({ status: "error", message: `${e.message}. Paste the address from Apple Maps or Google Maps instead.` });
    }
  }

  function parseAndAdd() {
    let c = code.trim();
    let a = address.trim();
    // support pasting the whole "DLT3 - 413 Goodman Rd Concord, NC" in the code field
    const dash = c.match(/^(\S+)\s*[-–]\s*(.+)$/);
    if (!a && dash) {
      c = dash[1];
      a = dash[2];
    }
    if (!c || !a) return;
    onAddPlace({ code: c, label: c, address: a, type });
    setCode("");
    setAddress("");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50, overflowY: "auto" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 440, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#201C16", textTransform: "uppercase" }}>Your places</div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>
        <p style={{ fontSize: 12.5, color: "#9C9385", lineHeight: 1.5, marginBottom: 18 }}>
          Browsers can't pull a saved "Home" address directly out of Apple Maps or Google Maps — there's no public API
          for that. Paste it in from either app, or use your current location if you're home right now.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Home address</label>
          <input type="text" value={home} onChange={(e) => setHome(e.target.value)} placeholder="Paste from Maps, e.g. 413 Goodman Rd, Concord, NC" style={{ marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn-ghost" type="button" onClick={useCurrentLocation}>
              <MapPin size={13} /> {locState.status === "loading" ? "Locating…" : "Use current location"}
            </button>
            <button className="btn-primary" type="button" onClick={() => onSetHome(home)}>
              <Check size={14} /> Save home address
            </button>
          </div>
          {locState.message && (
            <div style={{ fontSize: 12, color: locState.status === "error" ? "#E85C4A" : "#2FC7AC", marginTop: 8 }}>{locState.message}</div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #E2DED4", paddingTop: 16 }}>
          <label style={{ fontSize: 11, color: "#6B6459", display: "block", marginBottom: 5 }}>Add a distribution point / common address</label>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8, marginBottom: 8 }}>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="DLT3" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="413 Goodman Rd, Concord, NC" />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span onClick={() => setType("amazon")} className="chip" style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: `1px solid ${type === "amazon" ? "#F5A623" : "#E2DED4"}`, color: type === "amazon" ? "#F5A623" : "#6B6459" }}>
              Amazon distribution center
            </span>
            <span onClick={() => setType("other")} className="chip" style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: `1px solid ${type === "other" ? "#F5A623" : "#E2DED4"}`, color: type === "other" ? "#F5A623" : "#6B6459" }}>
              Other location
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#9C9385", marginBottom: 10 }}>
            Tip: you can also paste the whole thing in the code field, e.g. "DLT3 - 413 Goodman Rd Concord, NC"
          </div>
          <button className="btn-primary" type="button" onClick={parseAndAdd}>
            <Plus size={14} /> Add place
          </button>

          {places.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {places.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F5F2EC", border: "1px solid #E2DED4", borderRadius: 8, padding: "8px 10px" }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: "#F5A623", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                      {p.code} {p.type === "amazon" && <span style={{ fontSize: 10, color: "#00A8E1", fontWeight: 400, marginLeft: 4 }}>Amazon</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B6459" }}>{p.address}</div>
                  </div>
                  <button onClick={() => onDeletePlace(p.id)} className="btn-ghost" style={{ padding: 6 }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- settings modal ---------- */

function SettingsModal({ settings, onClose, onSave }) {
  const [useCustom, setUseCustom] = useState(settings.customRate != null);
  const [rate, setRate] = useState(settings.customRate != null ? settings.customRate.toString() : "0.76");
  const [useCustomDep, setUseCustomDep] = useState(settings.depreciationRate != null);
  const [depRate, setDepRate] = useState(
    settings.depreciationRate != null ? settings.depreciationRate.toString() : DEFAULT_DEPRECIATION_PER_MILE.toString()
  );
  const [homeOfficeDefault, setHomeOfficeDefault] = useState(settings.homeOfficeDefault || false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50, overflowY: "auto" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2DED4", borderRadius: 10, padding: 22, maxWidth: 380, width: "100%", margin: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#201C16", textTransform: "uppercase" }}>Rate settings</div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}><X size={14} /></button>
        </div>

        <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.5, marginBottom: 14 }}>
          By default, deductions use the IRS business-use rate for the trip's date (72.5¢/mi Jan–Jun 2026, 76¢/mi from Jul 2026 on). Override it below if you use a different rate.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} style={{ width: "auto" }} />
          Use a custom flat rate
        </label>
        {useCustom && (
          <input type="number" step="0.001" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.76" style={{ marginBottom: 14 }} />
        )}

        <div style={{ borderTop: "1px solid #E2DED4", margin: "16px 0", paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.5, marginBottom: 14 }}>
            Cash P/L subtracts an estimated non-cash depreciation portion (default 35¢/mi) from the IRS rate to
            approximate your actual out-of-pocket cost per mile. If you know your own vehicle's costs more precisely,
            set it here.
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={useCustomDep} onChange={(e) => setUseCustomDep(e.target.checked)} style={{ width: "auto" }} />
            Use a custom depreciation estimate ($/mi)
          </label>
          {useCustomDep && (
            <input type="number" step="0.001" value={depRate} onChange={(e) => setDepRate(e.target.value)} placeholder="0.35" style={{ marginBottom: 14 }} />
          )}
        </div>

        <div style={{ borderTop: "1px solid #E2DED4", margin: "16px 0", paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: "#6B6459", lineHeight: 1.5, marginBottom: 14 }}>
            If you regularly claim a qualifying home office, new odometer-log trips will default to counting
            home-to-drop mileage as business miles. You can always override this per trip.
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={homeOfficeDefault} onChange={(e) => setHomeOfficeDefault(e.target.checked)} style={{ width: "auto" }} />
            Default to claiming a home office for new odometer-log trips
          </label>
        </div>

        <button
          className="btn-primary"
          onClick={() =>
            onSave({
              customRate: useCustom ? parseFloat(rate) || 0 : null,
              depreciationRate: useCustomDep ? parseFloat(depRate) || 0 : null,
              homeOfficeDefault,
            })
          }
        >
          <Check size={16} /> Save
        </button>
      </div>
    </div>
  );
}

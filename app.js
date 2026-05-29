/*
  ╔══════════════════════════════════════════════════════╗
  ║  BimDex – app.js                                     ║
  ║                                                      ║
  ║  Diese Datei ist die LOGIK der App.                  ║
  ║  Sie beschreibt was passiert wenn der Nutzer         ║
  ║  etwas tut – Foto aufnehmen, Bim eintragen,          ║
  ║  löschen, filtern, ein- und ausloggen.               ║
  ║                                                      ║
  ║  Aufbau:                                             ║
  ║  1. Supabase verbinden                               ║
  ║  2. Daten definieren (alle 62 Bims)                  ║
  ║  3. Globale Variablen                                ║
  ║  4. Login / Logout                                   ║
  ║  5. Foto aufnehmen & verkleinern                     ║
  ║  6. Bim eintragen                                    ║
  ║  7. Einträge laden                                   ║
  ║  8. Eintrag löschen                                  ║
  ║  9. Anzeige aktualisieren                            ║
  ║  10. Meilensteine & Toast                            ║
  ╚══════════════════════════════════════════════════════╝
*/


/* ════════════════════════════════════════════════════════
   1. SUPABASE VERBINDEN

   Supabase ist unsere Cloud-Datenbank.
   URL = Adresse unseres Projekts
   KEY = öffentlicher Zugriffsschlüssel (kein Geheimnis)

   supabase.createClient() startet die Verbindung und
   gibt uns ein Objekt "sb" zurück mit dem wir alles
   machen: Daten lesen/schreiben, Login, Fotos hochladen.
════════════════════════════════════════════════════════ */

const SUPABASE_URL = "https://sgjjyjgbxrylrcofgpxg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnamp5amdieHJ5bHJjb2ZncHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzkzNDIsImV4cCI6MjA5NTIxNTM0Mn0.OOr0tfDp3uunEd-8Y4sQRlo9SDdieJi7HB_ydr36Om0";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* ════════════════════════════════════════════════════════
   2. ALLE 62 BIMS DEFINIEREN

   Array.from({length: 33}, (_, i) => ...) erstellt
   eine Liste von 33 Objekten.
   String(i+1).padStart(3,"0") = Zahl mit führenden Nullen:
   1 → "001", 12 → "012", 33 → "033"

   Serie A: Nummern 001-033 (alte Cityrunner, orange/weiss)
   Serie B: Nummern 060-088 (neue Cityrunner, grau/orange)
════════════════════════════════════════════════════════ */

const SERIE_A = Array.from({ length: 33 }, (_, i) => ({
  num: String(i + 1).padStart(3, "0"),
  serie: "A"
}));

const SERIE_B = Array.from({ length: 29 }, (_, i) => ({
  num: String(i + 60).padStart(3, "0"),
  serie: "B"
}));

// Alle 62 Bims in einer Liste zusammenführen
const ALLE_BIMS = [...SERIE_A, ...SERIE_B];

// Meilensteine: bei welchem Prozentsatz was angezeigt wird
const MEILENSTEINE = {
  25:  { emoji: "🌱", titel: "25% geschafft!",  text: "Du hast ein Viertel aller Linzer Bims entdeckt!" },
  50:  { emoji: "⚡", titel: "Halbzeit!",         text: "Die Hälfte aller 62 Garnituren sind in deinem Sammelpass!" },
  75:  { emoji: "🔥", titel: "75%!",              text: "Du bist ein echter Bim-Jäger – nur noch 15 fehlen!" },
  100: { emoji: "🏆", titel: "Vollständig!",      text: "Unglaublich – du hast alle 62 Linzer Bims entdeckt!" }
};


/* ════════════════════════════════════════════════════════
   3. GLOBALE VARIABLEN

   Diese Variablen sind überall im Code zugänglich.
   Sie speichern den aktuellen Zustand der App.
════════════════════════════════════════════════════════ */

let aktiverNutzer    = null;   // Der eingeloggte Benutzer (oder null)
let aktiveFotoDatei  = null;   // Das gewählte Foto (noch nicht hochgeladen)
let alleEintraege    = [];     // Alle Bim-Einträge aus der Datenbank
let aktiverFilter    = "alle"; // Welcher Filter gerade aktiv ist
let aktiveAuthAktion = "login"; // "login" oder "register"

// Bereits erreichte Meilensteine (damit sie nicht doppelt erscheinen)
const erreichterMeilenstein = new Set();

// Lokaler Cache für Foto-URLs – verhindert unnötiges Nachladen
const fotoCache = {};


/* ════════════════════════════════════════════════════════
   4. LOGIN / LOGOUT

   zeigSeite() wechselt zwischen Login-Seite und App.
   Dazu wird die CSS-Klasse "aktiv" gesetzt/entfernt.
════════════════════════════════════════════════════════ */

function zeigSeite(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("aktiv"));
  document.getElementById(id).classList.add("aktiv");
}

// Wechselt zwischen "Anmelden" und "Registrieren" Tab
function authTab(aktion, btn) {
  aktiveAuthAktion = aktion;
  document.querySelectorAll(".auth-tab").forEach(b => b.classList.remove("aktiv"));
  btn.classList.add("aktiv");
  document.getElementById("auth-btn").textContent =
    aktion === "login" ? "Anmelden" : "Registrieren";
  document.getElementById("auth-error").textContent = "";
  document.getElementById("auth-erfolg").textContent = "";
  document.getElementById("auth-erfolg").style.display = "none";

  // "Passwort vergessen" nur beim Login anzeigen, nicht bei Registrierung
  document.getElementById("btn-passwort-vergessen").style.display =
    aktion === "login" ? "inline" : "none";
}

/*
  passwortVergessen() schickt eine E-Mail mit einem Reset-Link.
  Supabase erledigt den Rest automatisch – wir müssen nur die
  E-Mail-Adresse kennen. Der Nutzer klickt auf den Link in der
  E-Mail und kann ein neues Passwort setzen.
*/
async function passwortVergessen() {
  const email = document.getElementById("auth-email").value.trim();
  const errEl    = document.getElementById("auth-error");
  const erfolgEl = document.getElementById("auth-erfolg");

  errEl.textContent = "";
  erfolgEl.style.display = "none";

  if (!email) {
    errEl.textContent = "Bitte zuerst deine E-Mail eingeben.";
    return;
  }

  // Supabase schickt eine Reset-E-Mail mit einem Link
  // redirectTo = wohin der Nutzer nach dem Reset weitergeleitet wird
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });

  if (error) {
    errEl.textContent = "Fehler: " + error.message;
  } else {
    // Erfolgsmeldung anzeigen
    erfolgEl.textContent = "✓ Reset-Link wurde an " + email + " gesendet. Bitte prüf dein Postfach!";
    erfolgEl.style.display = "block";
  }
}

// Wird aufgerufen wenn der Nutzer auf "Anmelden" oder "Registrieren" klickt
async function authAktion() {
  const email   = document.getElementById("auth-email").value.trim();
  const passwort = document.getElementById("auth-passwort").value;
  const errEl   = document.getElementById("auth-error");
  const btn     = document.getElementById("auth-btn");

  errEl.textContent = "";
  if (!email || !passwort) {
    errEl.textContent = "Bitte E-Mail und Passwort eingeben.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "...";

  // Je nach Tab: anmelden oder registrieren
  let fehler;
  if (aktiveAuthAktion === "login") {
    ({ error: fehler } = await sb.auth.signInWithPassword({ email, password: passwort }));
  } else {
    ({ error: fehler } = await sb.auth.signUp({ email, password: passwort }));
  }

  if (fehler) {
    // Englische Fehlermeldungen auf Deutsch übersetzen
    const uebersetzungen = {
      "Invalid login credentials":                    "E-Mail oder Passwort falsch.",
      "User already registered":                      "E-Mail bereits registriert.",
      "Password should be at least 6 characters":     "Passwort muss mind. 6 Zeichen haben.",
    };
    errEl.textContent = uebersetzungen[fehler.message] || fehler.message;
    btn.disabled = false;
    btn.textContent = aktiveAuthAktion === "login" ? "Anmelden" : "Registrieren";
  }
}

/*
  onAuthStateChange = Supabase ruft diese Funktion automatisch auf
  wenn sich der Login-Status ändert (einloggen, ausloggen, Seite neu laden).

  event = was gerade passiert ist ("SIGNED_IN", "SIGNED_OUT", etc.)
  session = die aktuelle Sitzung (enthält Nutzer-Daten oder ist null)
*/
sb.auth.onAuthStateChange((event, session) => {
  if (session) {
    // Nutzer ist eingeloggt
    aktiverNutzer = session.user;
    document.getElementById("user-email").textContent = aktiverNutzer.email;
    zeigSeite("seite-app");
    ladeEintraege();
  } else {
    // Niemand eingeloggt
    aktiverNutzer = null;
    alleEintraege = [];
    zeigSeite("seite-auth");
  }
});

async function abmelden() {
  await sb.auth.signOut();
  // onAuthStateChange wird automatisch aufgerufen und zeigt die Login-Seite
}


/* ════════════════════════════════════════════════════════
   5. FOTO AUFNEHMEN & VERKLEINERN

   bildVerkleinern() zeichnet das Foto auf einem
   unsichtbaren Canvas (digitale Leinwand) neu –
   maximal 1200px breit, 80% JPEG-Qualität.
   Ein 8MB Handy-Foto wird so auf ~200-400KB reduziert.

   return new Promise() = wir warten bis das Bild
   fertig verkleinert ist bevor wir weitermachen.
════════════════════════════════════════════════════════ */

function bildVerkleinern(datei) {
  return new Promise(resolve => {
    const img    = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.onload = () => {
        const canvas   = document.createElement("canvas");
        const maxBreite = 1200;
        const scale    = Math.min(1, maxBreite / img.width); // Nie größer als Original

        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;

        // Foto auf Canvas zeichnen (verkleinert)
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

        // Canvas als JPEG-Datei exportieren (80% Qualität)
        canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.8);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(datei);
  });
}

// Wird aufgerufen wenn der Nutzer ein Foto aufnimmt oder auswählt
async function fotoGewaehlt(input) {
  const datei  = input.files[0];
  if (!datei) return;

  const fotoBtn = document.getElementById("btn-foto");
  fotoBtn.textContent = "⏳ Wird verkleinert...";

  // Foto verkleinern – wir warten bis es fertig ist (await)
  aktiveFotoDatei = await bildVerkleinern(datei);

  // Vorschau anzeigen
  const vorschau = document.getElementById("foto-vorschau");
  vorschau.src          = URL.createObjectURL(aktiveFotoDatei);
  vorschau.style.display = "block";

  fotoBtn.classList.add("hat-foto");
  fotoBtn.textContent = "✓ Foto aufgenommen";
}


/* ════════════════════════════════════════════════════════
   5b. UPLOAD-FORTSCHRITTSBALKEN

   Supabase gibt uns keine echten Upload-Fortschrittsdaten,
   also simulieren wir einen Fortschritt.
   Der Balken wächst zufällig bis 90%, springt dann
   auf 100% wenn der Upload wirklich fertig ist.
════════════════════════════════════════════════════════ */

function starteUploadBalken() {
  const wrap = document.getElementById("upload-bar-wrap");
  const bar  = document.getElementById("upload-bar");
  wrap.style.display = "block";
  bar.style.width    = "0%";

  let pct = 0;
  const interval = setInterval(() => {
    pct = Math.min(90, pct + Math.random() * 15);
    bar.style.width = pct + "%";
    if (pct >= 90) clearInterval(interval);
  }, 200);

  // Gibt Funktionen zurück um den Balken von außen zu steuern
  return {
    fertig: () => {
      clearInterval(interval);
      bar.style.width = "100%";
      setTimeout(() => { wrap.style.display = "none"; }, 600);
    }
  };
}


/* ════════════════════════════════════════════════════════
   6. BIM EINTRAGEN

   Zwei Fälle:
   A) Erste Sichtung: Foto hochladen + Eintrag anlegen
   B) Wiedersehen: Nur den Zähler erhöhen

   Optimistic Update = wir zeigen die Änderung sofort
   an, noch bevor Supabase antwortet. Das macht die App
   flüssiger. Falls Supabase einen Fehler zurückgibt,
   laden wir die Daten neu.
════════════════════════════════════════════════════════ */

async function addBim() {
  const numRaw  = document.getElementById("inp-num").value.trim();
  const ort     = document.getElementById("inp-ort").value.trim();
  const errEl   = document.getElementById("form-error-2");
  const btn     = document.getElementById("btn-add");
  errEl.textContent = "";

  // ── Validierung ──
  if (!numRaw) {
    errEl.textContent = "Bitte eine Garniturnummer eingeben!";
    return;
  }

  const numStr = String(parseInt(numRaw)).padStart(3, "0");

  if (!ALLE_BIMS.find(b => b.num === numStr)) {
    errEl.textContent = "Diese Garniturnummer existiert in Linz nicht.";
    return;
  }

  const vorhandener = alleEintraege.find(e => e.num === numStr);
  const istNeu      = !vorhandener;

  if (istNeu && !aktiveFotoDatei) {
    errEl.textContent = "Beim ersten Spotting bitte ein Foto aufnehmen!";
    return;
  }

  btn.disabled    = true;
  btn.textContent = istNeu ? "📤 Wird hochgeladen..." : "Wird gespeichert...";

  let uploadBalken = null;

  try {

    if (istNeu) {
      // ── FALL A: Erste Sichtung ──

      uploadBalken = starteUploadBalken();

      // Schritt 1: Foto zu Supabase Storage hochladen
      // Pfad: nutzer-id/garniturnummer_zeitstempel.jpg
      const dateiName = `${aktiverNutzer.id}/${numStr}_${Date.now()}.jpg`;
      const { error: uploadFehler } = await sb.storage
        .from("fotos")
        .upload(dateiName, aktiveFotoDatei);

      if (uploadFehler) throw uploadFehler;
      uploadBalken.fertig();

      // Schritt 2: Öffentliche URL des Fotos holen
      const { data: urlData } = sb.storage.from("fotos").getPublicUrl(dateiName);
      const fotoUrl = urlData.publicUrl;

      // Im lokalen Cache speichern (verhindert Nachladen)
      fotoCache[numStr] = fotoUrl;

      // Schritt 3: Optimistic Update – Eintrag sofort anzeigen
      // mit temporärer ID bis Supabase die echte zurückgibt
      const tempEintrag = {
        id:        "temp-" + Date.now(),
        num:       numStr,
        ort:       ort,
        foto_url:  fotoUrl,
        datum:     new Date().toLocaleDateString("de-AT"),
        spottings: 1,
        nutzer_id: aktiverNutzer.id
      };
      alleEintraege = [...alleEintraege, tempEintrag]
        .sort((a, b) => a.num.localeCompare(b.num));
      render();

      // Schritt 4: Wirklich in Supabase speichern
      const { data: dbDaten, error: dbFehler } = await sb
        .from("bims")
        .insert({
          num:       numStr,
          ort:       ort,
          foto_url:  fotoUrl,
          datum:     new Date().toLocaleDateString("de-AT"),
          spottings: 1,
          nutzer_id: aktiverNutzer.id
        })
        .select()    // Gibt den gespeicherten Eintrag zurück
        .single();   // Wir erwarten genau einen Eintrag

      if (dbFehler) throw dbFehler;

      // Temporäre ID durch echte Supabase-ID ersetzen
      alleEintraege = alleEintraege.map(e =>
        e.id === tempEintrag.id ? dbDaten : e
      );

    } else {
      // ── FALL B: Wiedersehen – nur Zähler erhöhen ──

      const neueAnzahl = (vorhandener.spottings || 1) + 1;

      // Optimistic Update
      alleEintraege = alleEintraege.map(e =>
        e.id === vorhandener.id ? { ...e, spottings: neueAnzahl } : e
      );
      render();

      // In Supabase speichern
      const { error: dbFehler } = await sb
        .from("bims")
        .update({ spottings: neueAnzahl })
        .eq("id", vorhandener.id);  // eq = "equals" – nur dieser Eintrag

      if (dbFehler) throw dbFehler;
    }

    // ── Erfolg: Toast + Meilenstein prüfen ──
    zeigeToast(numStr, istNeu);
    pruefeMeilenstein();
    schliesseModal();

  } catch (fehler) {
    errEl.textContent = "Fehler: " + fehler.message;
    if (uploadBalken) uploadBalken.fertig();
    await ladeEintraege();
  }

  btn.disabled    = false;
  btn.textContent = "Eintragen ✓";
}

// ── MODAL ÖFFNEN / SCHLIESSEN ──
function oeffneModal() {
  // Immer bei Schritt 1 starten
  document.getElementById("modal-schritt-1").classList.remove("versteckt");
  document.getElementById("modal-schritt-2").classList.add("versteckt");
  document.getElementById("inp-num").value = "";
  document.getElementById("form-error-1").textContent = "";
  document.getElementById("modal").classList.add("offen");
  // Kurz warten damit Animation fertig ist, dann Fokus setzen
  setTimeout(() => document.getElementById("inp-num").focus(), 100);
}

function schliesseModal() {
  document.getElementById("modal").classList.remove("offen");
  modalZuruecksetzen();
}

function modalZurueck() {
  document.getElementById("modal-schritt-2").classList.add("versteckt");
  document.getElementById("modal-schritt-1").classList.remove("versteckt");
  document.getElementById("form-error-1").textContent = "";
  setTimeout(() => document.getElementById("inp-num").focus(), 100);
}

/*
  modalWeiter() prüft die eingegebene Nummer.
  Zwei Fälle:
  A) Bim noch nicht gefunden → Schritt 2 (Foto)
  B) Bim schon im Sammelpass → direkt Zähler erhöhen, kein Foto nötig
*/
async function modalWeiter() {
  const numRaw = document.getElementById("inp-num").value.trim();
  const errEl  = document.getElementById("form-error-1");
  errEl.textContent = "";

  if (!numRaw) { errEl.textContent = "Bitte eine Nummer eingeben."; return; }
  const numStr = String(parseInt(numRaw)).padStart(3, "0");
  if (!ALLE_BIMS.find(b => b.num === numStr)) {
    errEl.textContent = "Diese Nummer existiert in Linz nicht (001–033 oder 060–088).";
    return;
  }

  const vorhandener = alleEintraege.find(e => e.num === numStr);

  if (vorhandener) {
    // ── FALL B: Schon gefunden – direkt Zähler erhöhen ──
    // Wir brauchen kein Foto, also direkt speichern
    const neueAnzahl = (vorhandener.spottings || 1) + 1;
    alleEintraege = alleEintraege.map(e =>
      e.id === vorhandener.id ? { ...e, spottings: neueAnzahl } : e
    );
    render();
    schliesseModal();
    zeigeToast(numStr, false);

    await sb.from("bims").update({ spottings: neueAnzahl }).eq("id", vorhandener.id);

  } else {
    // ── FALL A: Erste Sichtung – weiter zu Schritt 2 (Foto) ──
    document.getElementById("modal-schritt-1").classList.add("versteckt");
    document.getElementById("modal-schritt-2").classList.remove("versteckt");
    document.getElementById("modal-s2-titel").textContent = "📸 Bim #" + numStr + " – erste Sichtung!";
    document.getElementById("form-error-2").textContent = "";
    // Foto-Button zurücksetzen
    const fotoBtn = document.getElementById("btn-foto");
    fotoBtn.classList.remove("hat-foto");
    fotoBtn.textContent = "📷 Foto aufnehmen";
    document.getElementById("foto-vorschau").style.display = "none";
    aktiveFotoDatei = null;
  }
}

// Setzt alle Modal-Felder zurück nach dem Eintragen
function modalZuruecksetzen() {
  document.getElementById("inp-num").value        = "";
  document.getElementById("inp-ort").value        = "";
  document.getElementById("inp-foto").value       = "";
  document.getElementById("foto-vorschau").style.display = "none";
  const fotoBtn = document.getElementById("btn-foto");
  if (fotoBtn) { fotoBtn.classList.remove("hat-foto"); fotoBtn.textContent = "📷 Foto aufnehmen"; }
  document.getElementById("form-error-1").textContent = "";
  document.getElementById("form-error-2").textContent = "";
  aktiveFotoDatei = null;
}


/* ════════════════════════════════════════════════════════
   7. EINTRÄGE LADEN

   Lädt alle Bim-Einträge des eingeloggten Nutzers
   aus der Supabase-Datenbank.

   Während des Ladens: Skeleton-Animation
   Nach dem Laden: render() aktualisiert die Anzeige
════════════════════════════════════════════════════════ */

async function ladeEintraege() {
  zeigSkeleton(); // Platzhalter anzeigen während geladen wird

  const { data, error } = await sb
    .from("bims")
    .select("*")                          // Alle Spalten
    .eq("nutzer_id", aktiverNutzer.id)    // Nur eigene Einträge
    .order("num");                        // Sortiert nach Nummer

  if (error) {
    console.error("Ladefehler:", error);
    return;
  }

  alleEintraege = data;

  // Foto-URLs in den Cache laden
  data.forEach(e => {
    if (e.foto_url) fotoCache[e.num] = e.foto_url;
  });

  render();
}

// Zeigt animierte Platzhalter-Karten während geladen wird
function zeigSkeleton() {
  const skelettKarten = Array.from({ length: 12 }, () => `
    <div class="skeleton-karte">
      <div class="skeleton skeleton-foto"></div>
      <div class="skeleton skeleton-num"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
  `).join("");

  document.getElementById("grid-wrap").innerHTML = `
    <div class="serie-label">Wird geladen...</div>
    <div class="grid">${skelettKarten}</div>
  `;
}


/* ════════════════════════════════════════════════════════
   8. EINTRAG LÖSCHEN

   Prüft zuerst ob die ID noch temporär ist (dann
   ist der Eintrag noch nicht richtig gespeichert).

   Danach: Optimistic Update (sofort entfernen),
   dann wirklich aus Supabase löschen.
════════════════════════════════════════════════════════ */

async function deleteBim(id, num) {
  // Noch nicht vollständig gespeichert – kurz warten
  if (String(id).startsWith("temp-")) {
    alert("Bitte einen Moment warten – der Eintrag wird noch gespeichert.");
    return;
  }

  if (!confirm("Bim #" + num + " wirklich aus dem Sammelpass entfernen?")) return;

  // Optimistic Update: sofort aus der Liste entfernen
  // String() stellt sicher dass Zahlen und Text-IDs verglichen werden können
  alleEintraege = alleEintraege.filter(e => String(e.id) !== String(id));
  delete fotoCache[num];
  render();

  // Aus Supabase löschen
  const { error } = await sb.from("bims").delete().eq("id", id);
  if (error) {
    alert("Fehler beim Löschen: " + error.message);
    await ladeEintraege(); // Bei Fehler neu laden
  }
}


/* ════════════════════════════════════════════════════════
   9. ANZEIGE AKTUALISIEREN

   render() ist die wichtigste Funktion –
   sie liest den aktuellen Zustand (alleEintraege,
   aktiverFilter) und baut daraus die komplette
   Benutzeroberfläche neu auf.

   karteHTML() erstellt den HTML-Code für eine
   einzelne Bim-Karte.
════════════════════════════════════════════════════════ */

function setFilter(f, btn) {
  aktiverFilter = f;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("aktiv"));
  btn.classList.add("aktiv");
  render();
}

function render() {
  // ── Statistik aktualisieren ──
  const gefundenNummern = new Set(alleEintraege.map(e => e.num));
  const total = gefundenNummern.size;
  const pct   = Math.round((total / 62) * 100);

  // Zahlen kurz "poppen" wenn sie sich ändern
  const sTot = document.getElementById("s-total");
  const sMis = document.getElementById("s-missing");
  if (sTot.textContent !== String(total)) {
    sTot.classList.remove("pop");
    void sTot.offsetWidth;
    sTot.classList.add("pop");
  }
  sTot.textContent = total;
  sMis.textContent = 62 - total;
  document.getElementById("progress-bar").style.width  = pct + "%";
  document.getElementById("progress-label").textContent =
    `${total} von 62 Garnituren entdeckt (${pct}%)`;

  // ── Filter anwenden ──
  let liste = ALLE_BIMS;
  if (aktiverFilter === "gefunden") liste = ALLE_BIMS.filter(b =>  gefundenNummern.has(b.num));
  if (aktiverFilter === "offen")    liste = ALLE_BIMS.filter(b => !gefundenNummern.has(b.num));

  // ── Nach Serien aufteilen ──
  const serieA = liste.filter(b => b.serie === "A");
  const serieB = liste.filter(b => b.serie === "B");

  // ── HTML zusammenbauen ──
  let html = "";

  if (serieA.length > 0) {
    html += `
      <div class="serie-label">Serie A · 001–033 · Cityrunner alt (orange/weiss)</div>
      <div class="grid">${serieA.map(karteHTML).join("")}</div>
    `;
  }

  if (serieB.length > 0) {
    html += `
      <div class="serie-label" style="margin-top:1.5rem">
        Serie B · 060–088 · Cityrunner neu (grau/orange)
      </div>
      <div class="grid">${serieB.map(karteHTML).join("")}</div>
    `;
  }

  if (!html) {
    html = `<div style="text-align:center;padding:2rem;font-family:Space Mono,monospace;
                        font-size:13px;color:var(--txt2)">
              Keine Bims in dieser Ansicht.
            </div>`;
  }

  document.getElementById("grid-wrap").innerHTML = html;
}

// Erstellt den HTML-Code für eine einzelne Bim-Karte
function karteHTML(bim) {
  // Suchen ob diese Bim schon gefunden wurde
  const eintrag = alleEintraege.find(x => x.num === bim.num);

  if (eintrag) {
    // ── Gefundene Karte ──
    const fotoUrl = fotoCache[bim.num] || eintrag.foto_url;
    const serieLabel = bim.serie === "A" ? "🟠 alt" : "⬜ neu";

    return `
      <div class="bim-card gefunden">
        <button class="btn-del"
                onclick="deleteBim('${eintrag.id}', '${bim.num}')"
                title="Löschen">✕</button>

        ${fotoUrl
          ? `<img class="bim-card-foto laden"
                  src="${fotoUrl}"
                  alt="Bim ${bim.num}"
                  onload="this.classList.remove('laden')" />`
          : ""}

        <div class="bim-card-num">#${bim.num}</div>
        <div class="bim-card-serie">${serieLabel}</div>

        ${eintrag.ort
          ? `<div class="bim-card-ort">${eintrag.ort}</div>`
          : ""}

        <div class="bim-card-date">${eintrag.datum || ""}</div>

        ${eintrag.spottings > 1
          ? `<div class="bim-card-spotted">👁 ${eintrag.spottings}x gesehen</div>`
          : ""}
      </div>
    `;

  } else {
    // ── Noch nicht gefundene Karte ──
    const serieLabel = bim.serie === "A" ? "🟠 alt" : "⬜ neu";

    return `
      <div class="bim-card offen" onclick="wackeln(this)">
        <div class="bim-card-placeholder">🚋</div>
        <div class="bim-card-num">#${bim.num}</div>
        <div class="bim-card-serie">${serieLabel}</div>
      </div>
    `;
  }
}

// Wackel-Animation für noch nicht gefundene Karten
function wackeln(el) {
  el.classList.remove("wackeln");
  void el.offsetWidth; // Erzwingt dass der Browser die Animation neu startet
  el.classList.add("wackeln");
}


/* ════════════════════════════════════════════════════════
   10. MEILENSTEINE & TOAST

   pruefeMeilenstein() schaut nach jedem neuen Eintrag
   ob ein Meilenstein erreicht wurde.

   zeigeToast() zeigt kurz eine grüne Benachrichtigung
   oben im Bild – verschwindet nach 3 Sekunden automatisch.
════════════════════════════════════════════════════════ */

function pruefeMeilenstein() {
  const total = new Set(alleEintraege.map(e => e.num)).size;
  const pct   = Math.round((total / 62) * 100);

  for (const [schwelle, info] of Object.entries(MEILENSTEINE)) {
    if (pct >= parseInt(schwelle) && !erreichterMeilenstein.has(schwelle)) {
      erreichterMeilenstein.add(schwelle);
      zeigMeilenstein(info);
      break; // Nur einen Meilenstein auf einmal anzeigen
    }
  }
}

function zeigMeilenstein(info) {
  document.getElementById("ms-emoji").textContent = info.emoji;
  document.getElementById("ms-titel").textContent = info.titel;
  document.getElementById("ms-text").textContent  = info.text;
  document.getElementById("meilenstein").classList.add("sichtbar");
}

function schliesseMeilenstein() {
  document.getElementById("meilenstein").classList.remove("sichtbar");
}

function zeigeToast(numStr, istNeu) {
  document.getElementById("toast-titel").textContent =
    istNeu ? "🚋 Neue Bim entdeckt!" : "👀 Nochmals gesehen!";
  document.getElementById("toast-sub").textContent = "Bim #" + numStr;

  const toast = document.getElementById("toast");
  toast.classList.add("sichtbar");
  setTimeout(() => toast.classList.remove("sichtbar"), 3000);
}


/* ════════════════════════════════════════════════════════
   TASTATUR-SHORTCUT
   Enter-Taste = Bim eintragen (nur wenn App sichtbar)
════════════════════════════════════════════════════════ */

document.addEventListener("keydown", e => {
  const modalOffen = document.getElementById("modal").classList.contains("offen");
  const schritt2   = !document.getElementById("modal-schritt-2").classList.contains("versteckt");

  if (e.key === "Enter") {
    if (modalOffen && schritt2) {
      addBim();  // Enter in Schritt 2 = Eintragen
    } else if (modalOffen) {
      modalWeiter();  // Enter in Schritt 1 = Weiter
    }
  }

  if (e.key === "Escape" && modalOffen) schliesseModal();
});

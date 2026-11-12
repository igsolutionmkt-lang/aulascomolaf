// Ligação à AgendaIG: as marcações são feitas na agenda do Olaf e os
// serviços/preços do site vêm de lá (o que ele mudar no painel aparece aqui).
// SLUG: o endereço dele na AgendaIG (agendaig.com/<slug>). Vazio = ainda sem agenda.
const AGENDAIG = {
  base: "https://agendaig.com",
  slug: "aulas-em-alemao",
  // Chave pública (anon) da AgendaIG: a mesma que a página de reservas usa no navegador.
  supabaseUrl: "https://ktanbezgduvoqqekzstv.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YW5iZXpnZHV2b3FxZWt6c3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjUzNTAsImV4cCI6MjA5ODI0MTM1MH0.vC49RYNue-gFeV1zX4Aatfb4s-f2EH2WyS7Lrcd1IQM",
};
const AGENDAIG_URL = AGENDAIG.slug ? `${AGENDAIG.base}/${AGENDAIG.slug}` : AGENDAIG.base;
const WHATSAPP_NUMBER = "351965797608"; // ex.: "3519XXXXXXXX" (sem + nem espaços)

const lessons = {
  work: {
    target: "Ich möchte mich auf diese Stelle bewerben.",
    pt: {
      source: "Gostaria de me candidatar a esta vaga.",
      explanation: "“Sich bewerben auf” é como se diz candidatar-se a uma vaga. A preposição muda conforme o contexto, por isso pratica-se dentro de uma frase real.",
      track: "Percurso sugerido: trabalho e entrevistas"
    },
    en: {
      source: "I would like to apply for this position.",
      explanation: "“Sich bewerben auf” is how you say apply for a job. The preposition changes with context, so you practise it inside a real sentence.",
      track: "Suggested path: work and interviews"
    },
    de: {
      source: "Gostaria de me candidatar a esta vaga.",
      explanation: "„Sich bewerben auf“ heißt, sich auf eine Stelle zu bewerben. Die Präposition hängt vom Kontext ab, deshalb üben wir sie in einem echten Satz.",
      track: "Empfohlener Kurs: Arbeit und Vorstellungsgespräche"
    }
  },
  life: {
    target: "Ich möchte einen Termin vereinbaren.",
    pt: {
      source: "Gostaria de marcar uma consulta.",
      explanation: "“Einen Termin vereinbaren” serve para o médico, as Finanças, o banco ou o senhorio. Uma estrutura, dezenas de situações do dia a dia.",
      track: "Percurso sugerido: viver na Alemanha"
    },
    en: {
      source: "I would like to make an appointment.",
      explanation: "“Einen Termin vereinbaren” works for the doctor, the tax office, the bank or the landlord. One structure, dozens of everyday situations.",
      track: "Suggested path: living in Germany"
    },
    de: {
      source: "Gostaria de marcar uma consulta.",
      explanation: "„Einen Termin vereinbaren“ passt für Arzt, Finanzamt, Bank oder Vermieter. Eine Struktur, Dutzende Alltagssituationen.",
      track: "Empfohlener Kurs: Leben in Deutschland"
    }
  },
  start: {
    target: "Können Sie das bitte langsamer wiederholen?",
    pt: {
      source: "Pode repetir mais devagar, por favor?",
      explanation: "A primeira frase que vale a pena saber: dá-lhe controlo da conversa. Pede tempo e repetição sem ter de mudar de língua.",
      track: "Percurso sugerido: alemão do zero"
    },
    en: {
      source: "Could you repeat that more slowly, please?",
      explanation: "The first sentence worth knowing: it puts you in control. You ask for time and repetition without switching language.",
      track: "Suggested path: German from zero"
    },
    de: {
      source: "Pode repetir mais devagar, por favor?",
      explanation: "Der erste Satz, der sich lohnt: Er gibt Ihnen die Kontrolle. Sie bitten um Zeit und Wiederholung, ohne die Sprache zu wechseln.",
      track: "Empfohlener Kurs: Deutsch von null"
    }
  }
};

const bridgePhrases = [
  { pt: "Onde fica a estação?", en: "Where is the station?", target: "Wo ist der Bahnhof?", note: { pt: "Situação: chegar a uma cidade nova", en: "Situation: arriving in a new city", de: "Situation: Ankunft in einer neuen Stadt" } },
  { pt: "Tenho uma entrevista amanhã.", en: "I have an interview tomorrow.", target: "Ich habe morgen ein Vorstellungsgespräch.", note: { pt: "Situação: procurar trabalho", en: "Situation: job hunting", de: "Situation: Jobsuche" } },
  { pt: "Queria alugar um apartamento.", en: "I'd like to rent a flat.", target: "Ich möchte eine Wohnung mieten.", note: { pt: "Situação: encontrar casa", en: "Situation: finding a home", de: "Situation: Wohnungssuche" } },
  { pt: "Pode falar mais devagar?", en: "Could you speak more slowly?", target: "Können Sie langsamer sprechen?", note: { pt: "Situação: primeira semana", en: "Situation: your first week", de: "Situation: die erste Woche" } }
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// cada língua tem a sua página (/, /en/ e /de/); o texto fixo já vem traduzido no HTML
const lang = ["en", "de"].includes(document.documentElement.lang) ? document.documentElement.lang : "pt";
// na página alemã a frase de partida mostra-se em português (o público dele no Porto)
const baseLang = lang === "de" ? "pt" : lang;
let goal = "work";
let bridgeIndex = 0;

/* ---------- mini-aula ---------- */
function renderLesson(animate) {
  const l = lessons[goal];
  const c = l[lang];
  const sheet = document.querySelector(".sheet");
  const apply = () => {
    document.getElementById("phrase-source").textContent = c.source;
    document.getElementById("phrase-target").textContent = l.target;
    document.getElementById("phrase-explanation").textContent = c.explanation;
    document.getElementById("phrase-track").textContent = c.track;
    sheet.classList.remove("is-swapping");
  };
  if (animate && !reduceMotion) {
    sheet.classList.add("is-swapping");
    setTimeout(apply, 260);
  } else apply();
}

function setGoal(next, animate = true) {
  if (!lessons[next]) return;
  goal = next;
  document.querySelectorAll("[data-goal]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.goal === next)));
  document.querySelectorAll('input[name="goal"]').forEach((r) => { r.checked = r.value === next; });
  renderLesson(animate);
}

document.querySelectorAll("[data-goal]").forEach((b) => b.addEventListener("click", () => setGoal(b.dataset.goal)));
document.querySelectorAll('input[name="goal"]').forEach((r) => r.addEventListener("change", () => setGoal(r.value, false)));
document.querySelectorAll("[data-goal-link]").forEach((a) => a.addEventListener("click", () => setGoal(a.dataset.goalLink, false)));

/* ouvir em alemão (voz do navegador) */
const listen = document.getElementById("listen");
if (!("speechSynthesis" in window)) {
  listen.hidden = true;
} else {
  listen.addEventListener("click", () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(lessons[goal].target);
    u.lang = "de-DE";
    u.rate = 0.85;
    const voice = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("de"));
    if (voice) u.voice = voice;
    u.onstart = () => listen.classList.add("is-playing");
    u.onend = u.onerror = () => listen.classList.remove("is-playing");
    speechSynthesis.speak(u);
  });
}

/* ---------- cartão PT → DE do topo ---------- */
const bPt = document.getElementById("bridge-pt");
const bDe = document.getElementById("bridge-de");
const bNote = document.getElementById("bridge-note");
const dots = [...document.querySelectorAll(".bridge__dots i")];
const BRIDGE_MS = 4200;

function paintBridge() {
  const p = bridgePhrases[bridgeIndex];
  bPt.textContent = p[baseLang];
  bDe.textContent = p.target;
  bNote.textContent = p.note[lang];
  dots.forEach((d, i) => {
    d.classList.toggle("is-done", i < bridgeIndex);
    d.classList.remove("is-on");
    if (i === bridgeIndex) { void d.offsetWidth; d.classList.add("is-on"); }
  });
}

function nextBridge() {
  bPt.classList.add("is-out");
  setTimeout(() => bDe.classList.add("is-out"), 120);
  bNote.classList.add("is-out");
  setTimeout(() => {
    bridgeIndex = (bridgeIndex + 1) % bridgePhrases.length;
    paintBridge();
    bPt.classList.remove("is-out");
    bNote.classList.remove("is-out");
    setTimeout(() => bDe.classList.remove("is-out"), 650); // o alemão chega depois do português
  }, 480);
}

document.documentElement.style.setProperty("--dur", BRIDGE_MS + "ms");
if (!reduceMotion) setInterval(nextBridge, BRIDGE_MS);

document.querySelectorAll("[data-base-tag]").forEach((el) => { el.textContent = baseLang.toUpperCase(); });

/* ---------- teste rápido de nível ---------- */
const quiz = [
  { q: "Wie heißen Sie?", ask: { pt: "O que quer dizer?", en: "What does it mean?", de: "Was bedeutet das?" },
    options: { pt: ["Como se chama?", "Onde mora?", "Quantos anos tem?"], en: ["What's your name?", "Where do you live?", "How old are you?"] }, right: 0 },
  { q: "Ich ___ aus Portugal.", ask: { pt: "Complete a frase", en: "Complete the sentence", de: "Ergänzen Sie den Satz" },
    options: { all: ["komme", "kommst", "kommt"] }, right: 0 },
  { q: "Gestern ___ ich ins Kino gegangen.", ask: { pt: "Complete a frase", en: "Complete the sentence", de: "Ergänzen Sie den Satz" },
    options: { all: ["bin", "habe", "war"] }, right: 0 },
  { q: "Ich lerne Deutsch, ___ ich in Berlin arbeiten möchte.", ask: { pt: "Complete a frase", en: "Complete the sentence", de: "Ergänzen Sie den Satz" },
    options: { all: ["weil", "denn", "obwohl"] }, right: 0 },
  { q: "Wenn ich mehr Zeit ___, würde ich öfter reisen.", ask: { pt: "Complete a frase", en: "Complete the sentence", de: "Ergänzen Sie den Satz" },
    options: { all: ["hätte", "habe", "hatte"] }, right: 0 },
];
// a ordem das opções baralha-se uma vez, para a certa não ser sempre a primeira
quiz.forEach((item) => {
  const n = (item.options.all || item.options.pt).length;
  const order = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  item.order = order;
});

const quizText = {
  pt: {
    start: "Começar o teste", zero: "Nunca estudei alemão", next: "Pergunta", of: "de",
    right: "Certo!", wrong: "Quase. A resposta certa é", again: "Repetir o teste", book: "Marcar aula",
    note: "Estimativa rápida. O nível certo vê-se na primeira aula.",
    results: [
      { lvl: "A0", title: "Vai começar do zero", text: "Ótimo ponto de partida: as primeiras aulas são explicadas em português.", goal: "start" },
      { lvl: "A1", title: "Já tem as primeiras bases", text: "O próximo passo é ganhar frases para o dia a dia, com apoio em português.", goal: "start" },
      { lvl: "A2", title: "Já se desenrasca", text: "Está pronto para conversar mais e preparar situações reais: casa, trabalho, documentos.", goal: "life" },
      { lvl: "B1", title: "Já fala alemão", text: "Agora é ganhar fluência e vocabulário do trabalho, entrevistas incluídas.", goal: "work" },
      { lvl: "B1+", title: "Nível sólido", text: "Conversação e alemão profissional para soar natural.", goal: "work" },
    ],
  },
  en: {
    start: "Start the test", zero: "I've never studied German", next: "Question", of: "of",
    right: "Correct!", wrong: "Almost. The right answer is", again: "Take it again", book: "Book a lesson",
    note: "Quick estimate. Your real level shows in the first lesson.",
    results: [
      { lvl: "A0", title: "You'll start from zero", text: "A great starting point: the first lessons are explained in English.", goal: "start" },
      { lvl: "A1", title: "You have the first basics", text: "Next step: everyday phrases, with support in English.", goal: "start" },
      { lvl: "A2", title: "You can get by", text: "Ready to talk more and prepare real situations: housing, work, paperwork.", goal: "life" },
      { lvl: "B1", title: "You already speak German", text: "Now it's about fluency and work vocabulary, interviews included.", goal: "work" },
      { lvl: "B1+", title: "Solid level", text: "Conversation and professional German to sound natural.", goal: "work" },
    ],
  },
  de: {
    start: "Test starten", zero: "Ich habe nie Deutsch gelernt", next: "Frage", of: "von",
    right: "Richtig!", wrong: "Fast. Die richtige Antwort ist", again: "Test wiederholen", book: "Stunde buchen",
    note: "Schnelle Einschätzung. Ihr genaues Niveau zeigt sich in der ersten Stunde.",
    results: [
      { lvl: "A0", title: "Sie fangen bei null an", text: "Ein guter Start: Die ersten Stunden werden auf Portugiesisch oder Englisch erklärt.", goal: "start" },
      { lvl: "A1", title: "Sie haben erste Grundlagen", text: "Der nächste Schritt: Sätze für den Alltag, mit Unterstützung in Ihrer Sprache.", goal: "start" },
      { lvl: "A2", title: "Sie kommen zurecht", text: "Bereit für mehr Gespräch und echte Situationen: Wohnung, Arbeit, Behörden.", goal: "life" },
      { lvl: "B1", title: "Sie sprechen schon Deutsch", text: "Jetzt geht es um Flüssigkeit und Wortschatz für den Beruf, inklusive Vorstellungsgespräche.", goal: "work" },
      { lvl: "B1+", title: "Solides Niveau", text: "Konversation und Berufsdeutsch, damit Sie natürlich klingen.", goal: "work" },
    ],
  },
};

const quizBody = document.getElementById("quiz-body");
const quizBar = document.getElementById("quiz-bar");
let qStep = -1;
let qScore = 0;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function quizIntro() {
  const t = quizText[lang];
  qStep = -1; qScore = 0; quizBar.style.width = "0%";
  quizBody.replaceChildren();
  const scale = el("div", "quiz__scale");
  ["A0", "A1", "A2", "B1", "B1+"].forEach((l, i) => {
    const s = el("span", null, l);
    s.style.setProperty("--i", i);
    scale.append(s);
  });
  quizBody.append(scale, el("p", "quiz__meta", { pt: "5 perguntas · resultado imediato · sem registo", en: "5 questions · instant result · no sign-up", de: "5 Fragen · sofortiges Ergebnis · ohne Anmeldung" }[lang]));
  const box = el("div", "quiz__start");
  const go = el("button", "btn", t.start); go.type = "button";
  go.addEventListener("click", () => { qStep = 0; quizQuestion(); });
  const zero = el("button", "btn btn--ghost", t.zero); zero.type = "button";
  zero.addEventListener("click", () => quizResult(0));
  box.append(go, zero);
  quizBody.append(box);
}

function quizQuestion() {
  const t = quizText[lang];
  const item = quiz[qStep];
  const opts = item.options.all || item.options[baseLang];
  quizBar.style.width = (qStep / quiz.length) * 100 + "%";
  quizBody.replaceChildren();
  quizBody.append(el("p", "quiz__count", `${t.next} ${qStep + 1} ${t.of} ${quiz.length} · ${item.ask[lang]}`));
  const q = el("p", "quiz__q", item.q); q.lang = "de";
  quizBody.append(q);
  const list = el("div", "quiz__opts");
  item.order.forEach((i) => {
    const b = el("button", "quiz__opt", opts[i]); b.type = "button";
    if (item.options.all) b.lang = "de";
    else if (baseLang !== lang) b.lang = baseLang;
    b.addEventListener("click", () => {
      const ok = i === item.right;
      if (ok) qScore++;
      list.querySelectorAll("button").forEach((x) => { x.disabled = true; });
      b.classList.add(ok ? "is-right" : "is-wrong");
      list.children[item.order.indexOf(item.right)].classList.add("is-right");
      const fb = el("p", "quiz__fb " + (ok ? "is-right" : "is-wrong"), ok ? t.right : `${t.wrong} “${opts[item.right]}”.`);
      quizBody.append(fb);
      setTimeout(() => { qStep++; qStep < quiz.length ? quizQuestion() : quizResult(qScore); }, ok ? 900 : 1700);
    });
    list.append(b);
  });
  quizBody.append(list);
}

function quizResult(score) {
  const t = quizText[lang];
  const idx = score === 0 ? (qStep === -1 ? 0 : 1) : score <= 2 ? 1 : score === 3 ? 2 : score === 4 ? 3 : 4;
  const r = t.results[idx];
  quizBar.style.width = "100%";
  quizBody.replaceChildren();
  const res = el("div", "quiz__result");
  res.append(el("span", "quiz__lvl", r.lvl), el("h3", null, r.title), el("p", null, r.text), el("p", "quiz__note", t.note));
  const acts = el("div", "quiz__acts");
  const book = el("a", "btn", t.book); book.href = "#marcar";
  book.addEventListener("click", () => setGoal(r.goal, false));
  const again = el("button", "btn btn--ghost", t.again); again.type = "button";
  again.addEventListener("click", quizIntro);
  acts.append(book, again);
  res.append(acts);
  quizBody.append(res);
  setGoal(r.goal, false);
}

quizIntro();

/* ---------- ligações de marcação ---------- */
function bookingHref(content) {
  const url = new URL(AGENDAIG_URL);
  url.searchParams.set("utm_source", "site");
  url.searchParams.set("utm_content", content);
  return url.toString();
}
const agenda = document.getElementById("agenda-link");
agenda.addEventListener("click", () => { agenda.href = bookingHref(goal); });
agenda.href = AGENDAIG_URL;

/* ---------- serviços e preços ao vivo da AgendaIG ---------- */
async function loadServices() {
  if (!AGENDAIG.slug || AGENDAIG.anonKey.startsWith("__")) return;
  const headers = { apikey: AGENDAIG.anonKey, Authorization: `Bearer ${AGENDAIG.anonKey}`, "Content-Type": "application/json" };
  try {
    const res = await fetch(`${AGENDAIG.supabaseUrl}/rest/v1/rpc/agenda_public_company`, {
      method: "POST", headers, body: JSON.stringify({ p_slug: AGENDAIG.slug }),
    });
    const rows = await res.json();
    const company = Array.isArray(rows) ? rows[0] : rows;
    if (!company || !company.id) return;
    const q = new URLSearchParams({
      select: "id,name,duration,price,description,kind,parent_id,position,i18n",
      company_id: `eq.${company.id}`, is_active: "eq.true", order: "position.asc,name.asc",
    });
    const services = (await (await fetch(`${AGENDAIG.supabaseUrl}/rest/v1/agenda_services?${q}`, { headers })).json())
      .filter((s) => !s.parent_id);
    if (!Array.isArray(services) || !services.length) return;
    renderServices(services);
  } catch {
    // sem rede ou agenda em baixo: o site continua, só sem a lista de preços
  }
}

function tr(obj, field) {
  const t = lang !== "pt" && obj.i18n && obj.i18n[lang] && obj.i18n[lang][field];
  return typeof t === "string" && t.trim() ? t : obj[field] || "";
}

function renderServices(services) {
  const grid = document.getElementById("prices-grid");
  const money = new Intl.NumberFormat({ pt: "pt-PT", en: "en-IE", de: "de-DE" }[lang], { style: "currency", currency: "EUR" });
  const t = { pt: { free: "Grátis", book: "Marcar" }, en: { free: "Free", book: "Book" }, de: { free: "Kostenlos", book: "Buchen" } }[lang];
  grid.replaceChildren();
  services.forEach((s, i) => {
    const card = el("article", "price" + (Number(s.price) === 0 && i === 0 ? " price--main" : ""));
    card.append(el("h3", null, tr(s, "name")));
    const value = el("p", "price__value");
    value.append(el("b", null, Number(s.price) > 0 ? money.format(Number(s.price)).replace(/[.,]00(?=\D*$)/, "") : t.free));
    if (s.duration) value.append(document.createTextNode(" "), el("span", null, `${s.duration} min`));
    card.append(value);
    const desc = tr(s, "description");
    if (desc) card.append(el("p", "price__desc", desc));
    const link = el("a", "path__link", `${t.book} →`);
    link.href = bookingHref(`servico-${i + 1}`);
    link.target = "_blank"; link.rel = "noopener";
    card.append(link);
    grid.append(card);
  });
  document.getElementById("precos").hidden = false;
}

loadServices();

const wa = document.getElementById("whatsapp-link");
if (WHATSAPP_NUMBER) {
  const msg = { pt: "Olá! Vi o site e queria saber mais sobre as aulas de alemão.", en: "Hi! I saw the website and would like to know more about the lessons.", de: "Hallo! Ich habe die Website gesehen und möchte mehr über den Unterricht erfahren." };
  wa.addEventListener("click", () => { wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg[lang])}`; });
  // planos mensais: abrem o WhatsApp com o nome do plano já escrito
  const planMsg = { pt: (p) => `Olá! Vi o site e queria o plano ${p}.`, en: (p) => `Hi! I saw the website and would like the ${p} plan.`, de: (p) => `Hallo! Ich habe die Website gesehen und möchte den Plan ${p}.` };
  document.querySelectorAll("[data-plan]").forEach((a) => {
    a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(planMsg[lang](a.dataset.plan))}`;
    a.target = "_blank"; a.rel = "noopener";
  });
} else {
  wa.hidden = true;
}

/* ---------- menu de línguas ---------- */
const langMenu = document.querySelector("details.lang");
document.addEventListener("click", (e) => { if (langMenu.open && !langMenu.contains(e.target)) langMenu.open = false; });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && langMenu.open) { langMenu.open = false; langMenu.querySelector("summary").focus(); }
});

/* ---------- topo e botão fixo ---------- */
const topBar = document.querySelector(".top");
const floatCta = document.querySelector(".float-cta");
const hero = document.querySelector(".hero");
const cta = document.querySelector(".cta");
function onScroll() {
  topBar.classList.toggle("is-scrolled", window.scrollY > 10);
  const pastHero = hero.getBoundingClientRect().bottom < 0;
  const r = cta.getBoundingClientRect();
  const atCta = r.top < window.innerHeight && r.bottom > 0;
  floatCta.classList.toggle("is-on", pastHero && !atCta);
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- entrada ao fazer scroll ---------- */
const reveals = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

paintBridge();
setGoal("work", false);
onScroll();

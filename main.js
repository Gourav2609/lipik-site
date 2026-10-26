// The hero demo: words appear as they are spoken, the pill listens, then the
// cleaned line is typed into the box. Words marked "-" are the ones Lipik drops.
const EXAMPLES = [
  {
    app: "Slack · #launch",
    from: ["Meera", "Are we still on for the call today?"],
    placeholder: "Message #launch",
    said: "hey can we, -um, move the call to -four, -no, five",
    typed: "Hey, can we move the call to 5?",
  },
  {
    app: "Mail · Reply to Arjun",
    from: ["Arjun", "Where should I send the final deck?"],
    placeholder: "Write a reply",
    said: "-uh send it to rivaan underscore m at quavia dot com by three thirty pm",
    typed: "Send it to rivaan_m@quavia.com by 3:30 PM.",
  },
  {
    app: "Notes · Today",
    from: ["You", "Demo plan"],
    placeholder: "Start writing",
    said: "-hmm kal ka demo friday ko shift kar dete hain",
    typed: "Kal ka demo Friday ko shift kar dete hain.",
  },
];

const $ = (id) => document.getElementById(id);
const app = $("demo-app");
const said = $("demo-said");
const typed = $("demo-typed");
const placeholder = $("demo-ph");
const pill = $("demo-pill");
const thread = document.querySelector(".thread .msg");
const bars = pill.querySelector(".bars");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

for (let i = 0; i < 11; i++) bars.appendChild(document.createElement("i"));
const barEls = [...bars.children];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let speaking = false;
function animateBars(t) {
  barEls.forEach((b, i) => {
    const level = speaking
      ? 0.25 + 0.75 * Math.abs(Math.sin(t / 160 + i * 1.7) * Math.sin(t / 420 + i * 0.6))
      : 0.12;
    b.style.height = `${Math.round(3 + 14 * level)}px`;
  });
  requestAnimationFrame(animateBars);
}

function showStatic(ex) {
  app.textContent = ex.app;
  thread.innerHTML = `<b>${ex.from[0]}</b><span>${ex.from[1]}</span>`;
  placeholder.textContent = ex.placeholder;
  said.innerHTML = ex.said
    .split(" ")
    .map((w) => `<span class="w on${w.startsWith("-") ? " drop" : ""}">${w.replace(/^-/, "")}</span>`)
    .join(" ");
  typed.textContent = ex.typed;
}

async function play(ex) {
  app.textContent = ex.app;
  thread.innerHTML = `<b>${ex.from[0]}</b><span>${ex.from[1]}</span>`;
  placeholder.textContent = ex.placeholder;
  typed.textContent = "";
  said.innerHTML = "";
  await wait(900);

  pill.dataset.state = "listen";
  speaking = true;
  await wait(350);
  const words = ex.said.split(" ").map((w) => {
    const span = document.createElement("span");
    span.className = "w" + (w.startsWith("-") ? " drop" : "");
    span.textContent = w.replace(/^-/, "");
    said.append(span, " ");
    return span;
  });
  for (const w of words) {
    w.classList.add("on");
    await wait(230);
  }
  speaking = false;
  await wait(250);

  pill.dataset.state = "think";
  await wait(600);
  pill.dataset.state = "idle";
  const line = document.createElement("span");
  line.className = "new";
  line.textContent = ex.typed;
  typed.append(line);
  requestAnimationFrame(() => setTimeout(() => line.classList.add("settled"), 120));
  await wait(3200);
}

if (reduced) {
  showStatic(EXAMPLES[0]);
} else {
  requestAnimationFrame(animateBars);
  (async () => {
    for (let i = 0; ; i = (i + 1) % EXAMPLES.length) await play(EXAMPLES[i]);
  })();
}

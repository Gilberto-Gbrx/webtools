(async () => {
  const url = "index.php"; // ajuste se precisar
  const methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "TRACE", "PATCH"];

  for (const method of methods) {
    console.log(`\n Testando método: ${method} `);

    try {
      const res = await fetch(url, { method: method });
      
      // Status
      console.log(`Status: ${res.status} ${res.statusText}`);

      // Headers
      for (let [key, value] of res.headers.entries()) {
        console.log(`Header: ${key} = ${value}`);
      }

      // Body (exceto HEAD, que não tem)
      if (method !== "HEAD") {
        const text = await res.text();
        console.log("Resposta parcial:", text.slice(0, 500)); // mostra só primeiros 500 chars
      }
    } catch (err) {
      console.log(`❌ Erro com ${method}:`, err);
    }
  }
})();
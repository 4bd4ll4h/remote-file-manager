export async function connectToServer(form: {
    host: string;
    port?: number;
    username: string;
    password?: string;
    privateKey?: string;
    passphrase?: string;
  }) {
    const res = await fetch("/server/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to connect");
    }
  
    return res.json();
  }
  
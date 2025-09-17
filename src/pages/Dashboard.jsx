import React from "react";
import { getHealth, getDashboard } from "../api";

export default function Dashboard() {
  const [health, setHealth] = React.useState(null);
  const [dash, setDash] = React.useState(null);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [h, d] = await Promise.all([getHealth(), getDashboard()]);
        setHealth(h);
        setDash(d); // pode ser null (sem endpoint) — tratamos abaixo
      } catch (e) {
        setErr(e.message || "Erro de rede");
      }
    })();
  }, []);

  if (err) return <p style={{ color: "#b00020" }}>Erro: {err}</p>;
  if (!health) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      {!dash ? (
        <div style={{ padding: 12, border: "1px dashed #ddd", borderRadius: 8, background: "#fafafa" }}>
          <p><strong>Observação:</strong> sua API ainda não possui <code>/dashboard</code>. Mostrando somente o <code>/health</code>:</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(health, null, 2)}</pre>
          <p style={{ marginTop: 8 }}>
            Quando você subir o backend completo, este painel mostrará os totais (obras, clientes, unidades e chamados).
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <Card title="Obras" value={dash.obras?.total ?? dash.obras ?? 0} />
          <Card title="Unidades" value={dash.unidades?.total ?? dash.unidades ?? 0} />
          <Card title="Clientes" value={dash.clientes?.total ?? dash.clientes ?? 0} />
          <Card title="Chamados" value={dash.chamados?.total ?? dash.chamados ?? 0} />
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 10, background: "white", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
      <div style={{ color: "#555", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

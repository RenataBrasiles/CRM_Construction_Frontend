import React from "react";
import { listObras, createObra, updateObra, deleteObra } from "../api";

const S = {
  card: { border:"1px solid #eee", borderRadius:12, padding:14, background:"#fff", boxShadow:"0 1px 2px rgba(0,0,0,.04)" },
  btn:  { padding:"8px 12px", borderRadius:10, border:"none", cursor:"pointer" },
  btnPri: { background:"#111", color:"#fff" },
  btnSec: { background:"#eee", color:"#111" },
  tag: { background:"#eef", color:"#223", padding:"2px 8px", borderRadius:12, fontSize:12 }
};

const empty = { nome:"", endereco:"", status:"Em execução", data_inicio:"", data_prevista_entrega:"" };

function fmt(d) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return isNaN(dt) ? "—" : dt.toLocaleDateString("pt-BR");
}

export default function Obras() {
  const [items, setItems] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(empty);
  const [editing, setEditing] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  async function load() {
    try {
      const data = await listObras(); // pode ser null se endpoint não existir
      setItems(data);
    } catch (e) {
      setErr(e.message || "Erro de rede");
    }
  }
  React.useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(item) {
    setEditing(item);
    setForm({
      nome: item.nome ?? "",
      endereco: item.endereco ?? "",
      status: item.status ?? "Em execução",
      data_inicio: toDateInput(item.data_inicio),
      data_prevista_entrega: toDateInput(item.data_prevista_entrega),
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        data_inicio: form.data_inicio || null,
        data_prevista_entrega: form.data_prevista_entrega || null,
      };
      if (editing) await updateObra(editing.id, payload);
      else await createObra(payload);
      setOpen(false);
      await load();
    } catch (e) {
      alert("Erro ao salvar: " + (e?.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(item) {
    if (!confirm(`Excluir a obra "${item.nome}"?`)) return;
    try {
      await deleteObra(item.id);
      await load();
    } catch (e) {
      alert("Erro ao excluir: " + (e?.response?.data?.detail || e.message));
    }
  }

  if (err) return <p style={{ color:"#b00020" }}>Erro: {err}</p>;
  if (items === null) return <HintNoEndpoint />;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
        <h2>Obras</h2>
        <button onClick={openNew} style={{ ...S.btn, ...S.btnPri }}>+ Nova obra</button>
      </div>

      {items.length === 0 ? (
        <div style={{ ...S.card, textAlign:"center" }}>
          <p>Nenhuma obra cadastrada.</p>
          <button onClick={openNew} style={{ ...S.btn, ...S.btnPri }}>Cadastrar</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12 }}>
          {items.map((o) => (
            <div key={o.id} style={S.card}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                <strong style={{ fontSize:16 }}>{o.nome}</strong>
                <span style={S.tag}>{o.status || "—"}</span>
              </div>
              <div style={{ color:"#555", marginTop:4 }}>{o.endereco || "—"}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8, fontSize:14 }}>
                <div><span style={{ color:"#666" }}>Início: </span>{fmt(o.data_inicio)}</div>
                <div><span style={{ color:"#666" }}>Entrega prevista: </span>{fmt(o.data_prevista_entrega)}</div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button onClick={() => openEdit(o)} style={{ ...S.btn, ...S.btnSec }}>✏️ Editar</button>
                <button onClick={() => onDelete(o)} style={{ ...S.btn, background:"#fee", color:"#a00" }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:18, fontWeight:600 }}>{editing ? "Editar obra" : "Nova obra"}</div>
              <button onClick={() => setOpen(false)} style={{ ...S.btn, ...S.btnSec }}>✕</button>
            </div>
            <form onSubmit={onSubmit}>
              <Field label="Nome">
                <input required value={form.nome} onChange={e=>setForm(f=>({ ...f, nome:e.target.value }))} />
              </Field>
              <Field label="Endereço">
                <input value={form.endereco} onChange={e=>setForm(f=>({ ...f, endereco:e.target.value }))} />
              </Field>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <Field label="Status">
                  <select value={form.status} onChange={e=>setForm(f=>({ ...f, status:e.target.value }))}>
                    <option>Em execução</option>
                    <option>Concluída</option>
                    <option>Paralisada</option>
                  </select>
                </Field>
                <Field label="Data de início">
                  <input type="date" value={form.data_inicio || ""} onChange={e=>setForm(f=>({ ...f, data_inicio:e.target.value }))} />
                </Field>
                <Field label="Entrega prevista">
                  <input type="date" value={form.data_prevista_entrega || ""} onChange={e=>setForm(f=>({ ...f, data_prevista_entrega:e.target.value }))} />
                </Field>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:14 }}>
                <button type="button" onClick={()=>setOpen(false)} style={{ ...S.btn, ...S.btnSec }}>Cancelar</button>
                <button disabled={saving} style={{ ...S.btn, ...S.btnPri }}>{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display:"grid", gap:6, marginBottom:10, fontSize:14 }}>
      <span style={{ color:"#444" }}>{label}</span>
      <div style={{ display:"grid" }}>{children}</div>
      <style>{`input,select{padding:8px 10px;border:1px solid #ddd;border-radius:10px;outline: none} input:focus,select:focus{border-color:#111}`}</style>
    </label>
  );
}
const overlayStyle = { position:"fixed", inset:0, background:"rgba(0,0,0,.35)", display:"grid", placeItems:"center", padding:16, zIndex:50 };
const modalStyle   = { width:"min(680px, 100%)", background:"#fff", borderRadius:14, padding:16, boxShadow:"0 10px 30px rgba(0,0,0,.25)" };

function toDateInput(v) {
  if (!v) return "";
  // aceita "2025-09-10T00:00:00Z" ou Date
  const d = typeof v === "string" ? new Date(v) : v;
  if (isNaN(d)) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function HintNoEndpoint() {
  const [show, setShow] = React.useState(false);
  React.useEffect(()=>{ const t=setTimeout(()=>setShow(true), 300); return ()=>clearTimeout(t); },[]);
  if (!show) return <p>Carregando...</p>;
  return (
    <div style={{ padding: 12, border: "1px dashed #ddd", borderRadius: 8, background: "#fafafa" }}>
      <p><strong>Observação:</strong> sua API ainda não possui <code>/obras</code>. Assim que publicar o backend completo, a lista aparece aqui.</p>
    </div>
  );
}

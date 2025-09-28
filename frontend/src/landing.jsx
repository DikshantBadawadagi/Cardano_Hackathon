import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Grid, MousePointer, Share2, Shield, Clock, Quote } from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// NavBar (with routing for Sign Up / Login)
function NavBar() {
  const links = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Testimonials" },
    { id: "signup", label: "Sign Up", modal: true },
    { id: "login", label: "Login", modal: true },
  ];
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  const handleNav = (id, modal) => (e) => {
    e.preventDefault();
    if (modal && id === "signup") return window.location.href = "/signup";
    if (modal && id === "login") return window.location.href = "/login";
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "backdrop-blur bg-white/70 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]" : "bg-white/40"
      } border-b border-black/10`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#hero" onClick={handleNav("hero")} className="font-extrabold tracking-tight text-xl">
          Maukhik
        </a>
        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.modal ? "#" : `#${l.id}`}
                onClick={handleNav(l.id, l.modal)}
                className="text-sm font-medium hover:opacity-80 transition-opacity"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="md:hidden">
          <details>
            <summary className="cursor-pointer select-none px-3 py-1 border border-black rounded-md text-sm">Menu</summary>
            <div className="absolute right-4 mt-2 w-48 rounded-md border border-black bg-white shadow-lg p-2 flex flex-col">
              {links.map((l) => (
                <a key={l.id} href={l.modal ? "#" : `#${l.id}`} onClick={handleNav(l.id, l.modal)} className="px-2 py-2 rounded hover:bg-black hover:text-white">
                  {l.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

// Editable node used in XYFlow
function EditableNode({ id, data }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label ?? "");
  const commit = useCallback(() => {
    if (data && typeof data.onChange === "function") data.onChange(id, value);
    setEditing(false);
  }, [data, id, value]);
  return (
    <div className="relative min-w-[160px] max-w-[320px] bg-white text-black border-2 border-black rounded-lg shadow-[6px_6px_0_0_#000] p-3">
      <div className="text-sm opacity-60 mb-1 select-none">Box</div>
      {editing ? (
        <input
          className="nodrag nowheel outline-none w-full bg-white text-black border border-black rounded px-2 py-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setValue(data.label ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          placeholder="Type label"
        />
      ) : (
        <button
          className="nodrag nowheel text-left w-full px-1 py-1 rounded hover:bg-black/5"
          onDoubleClick={() => setEditing(true)}
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {data.label || "Click to edit text"}
        </button>
      )}
      <Handle type="target" position={Position.Top} style={{ background: "#000", width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#000", width: 8, height: 8 }} />
    </div>
  );
}

function PaletteItem({ label, color = "#000" }) {
  const onDragStart = (event) => {
    const payload = JSON.stringify({ type: "editable", label, color });
    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <div
      onDragStart={onDragStart}
      draggable
      className="cursor-grab active:cursor-grabbing select-none px-3 py-2 rounded-md border border-black bg-white shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 transition-transform"
      style={{ color: "#000" }}
    >
      {label}
    </div>
  );
}

function GraphInner() {
  const rf = useReactFlow();
  const project = rf && typeof rf === "function" ? rf : rf && rf.project ? rf.project : undefined;
  const idRef = useRef(1);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "0", position: { x: 50, y: 60 }, data: { label: "Drag more boxes from the palette" }, type: "editable" },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);
  const onLabelChange = useCallback((targetId, label) => {
    setNodes((nds) => nds.map((n) => (n.id === targetId ? { ...n, data: { ...n.data, label } } : n)));
  }, [setNodes]);
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const payload = event.dataTransfer.getData("application/reactflow");
    if (!payload) return;
    const { label } = JSON.parse(payload);
    const raw = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    let position;
    try {
      if (typeof project === "function") position = project(raw);
      else if (project && typeof project.project === "function") position = project.project(raw);
      else position = raw;
    } catch (_) {
      position = raw;
    }
    const id = `${idRef.current++}`;
    setNodes((nds) => nds.concat({ id, position, data: { label, onChange: onLabelChange }, type: "editable" }));
  }, [project, setNodes, onLabelChange]);
  const defaultEdgeOptions = useMemo(() => ({ style: { stroke: "#000", strokeWidth: 2 } }), []);
  return (
    <div className="relative h-[70vh] md:h-[78vh] w-full border-y border-black" id="hero">
      <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-center gap-3">
        <PaletteItem label="Box" />
        <PaletteItem label="Task" />
        <PaletteItem label="Note" />
      </div>
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, data: { ...n.data, onChange: onLabelChange } }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        nodeTypes={{ editable: EditableNode }}
        className="!bg-white"
      >
        <Background variant="lines" color="#000" gap={24} lineWidth={1} />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap nodeColor={() => "#000"} maskColor="rgba(0,0,0,0.08)" style={{ background: "#fff", border: "1px solid #000" }} />
      </ReactFlow>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-black rounded-full px-5 py-2 shadow-[6px_6px_0_0_#000]"
      >
        Tip: drag workflow components from the palette into the canvas. Connect them to build your conversation flow.
      </motion.div>
    </div>
  );
}

function HeroGraph() {
  return (
    <section className="bg-white text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-center">Give Your Business a Voice</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-4 text-center text-base sm:text-lg md:text-xl max-w-3xl mx-auto">Build intelligent conversational workflows that act as your customer service, secretary, or business companion. Create voice-powered interactions that understand context and automate tasks.</motion.p>
      </div>
      <div className="mt-10">
        <ReactFlowProvider>
          <GraphInner />
        </ReactFlowProvider>
      </div>
    </section>
  );
}

const Section = ({ id, title, kicker, children }) => (
  <section id={id} className="bg-white text-black scroll-mt-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
        {kicker && <p className="text-xs uppercase tracking-widest mb-2 opacity-60">{kicker}</p>}
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.05, duration: 0.6 }} className="mt-6">{children}</motion.div>
    </div>
  </section>
);

export default function Index() {
  return (
    <div className="min-h-screen bg-white text-black font-[Inter,ui-sans-serif,system-ui]">
      <NavBar />
      <HeroGraph />

      <Section id="about" title="We build conversational intelligence for businesses" kicker="About Us">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">Maukhik empowers businesses with intelligent voice-powered workflows that handle customer service, scheduling, and business operations. Our platform creates natural conversations that understand context and automate complex tasks.</p>
            <ul className="space-y-2">
              {["Voice-powered conversational workflows","Smart context understanding with uploaded documents","Seamless integration with Google Calendar and CRM tools"].map((t) => (
                <li key={t} className="flex items-start gap-3"><CheckCircle className="h-5 w-5" /><span>{t}</span></li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[{ k: "Businesses", v: "1.2k+" },{ k: "Conversations", v: "850k" },{ k: "Response Time", v: "<2s" }].map((s) => (
                <div key={s.k} className="p-4 border border-black rounded-lg text-center shadow-[4px_4px_0_0_#000]"><div className="text-2xl font-extrabold">{s.v}</div><div className="text-xs uppercase tracking-widest mt-1 opacity-60">{s.k}</div></div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl border border-black overflow-hidden shadow-[8px_8px_0_0_#000]">
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
            <div className="absolute inset-6 border-2 border-black rounded-lg bg-white flex items-center justify-center"><span className="px-3 py-2 border border-black rounded-md shadow-[4px_4px_0_0_#000]">Your voice workflows live here</span></div>
          </div>
        </div>
      </Section>

      <Section id="features" title="Everything you need to build intelligent conversations" kicker="Features">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Voice-Powered", desc: "Natural voice conversations that understand context and respond intelligently.", Icon: Zap },
            { title: "Contextual Intelligence", desc: "Upload brochures, documents, and text to give your AI deep business context.", Icon: Grid },
            { title: "Visual Workflow Builder", desc: "Drag and drop components to build complex conversation flows easily.", Icon: MousePointer },
            { title: "Task Automation", desc: "Automate scheduling, data entry, and routine business processes.", Icon: Share2 },
            { title: "Secure Integration", desc: "Connect with Google Calendar, CRM tools, and any custom API securely.", Icon: Shield },
            { title: "Real-time Response", desc: "Lightning-fast responses that keep conversations flowing naturally.", Icon: Clock },
          ].map(({ title, desc, Icon }) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="p-6 border border-black rounded-xl shadow-[6px_6px_0_0_#000] bg-white">
              <div className="flex items-center gap-3"><Icon className="h-5 w-5" /><h3 className="font-bold text-xl">{title}</h3></div>
              <p className="mt-2 text-sm text-black/80">{desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="testimonials" title="Trusted by businesses of all sizes" kicker="Testimonials">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { quote: "Maukhik transformed our customer service—24/7 intelligent responses that actually help.", author: "Sarah · Operations Manager" },
            { quote: "The voice workflows handle our appointment scheduling perfectly. Clients love it.", author: "Michael · Clinic Owner" },
            { quote: "Finally, an AI that understands our business context and automates the right tasks.", author: "Lisa · Small Business Owner" },
            { quote: "Our support queries dropped 70% after deploying Maukhik's conversation workflows.", author: "David · Customer Success" },
            { quote: "The Google Calendar integration is seamless. Our virtual assistant books meetings flawlessly.", author: "Emma · Executive Assistant" },
            { quote: "Building conversation flows is intuitive, and the voice responses feel completely natural.", author: "Alex · Tech Consultant" },
          ].map((t, i) => (
            <motion.blockquote key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="p-6 border border-black rounded-xl shadow-[6px_6px_0_0_#000] bg-white flex flex-col">
              <Quote className="h-5 w-5 mb-3" />
              <p className="text-lg leading-relaxed flex-1">"{t.quote}"</p>
              <footer className="mt-3 text-sm text-black/70">— {t.author}</footer>
            </motion.blockquote>
          ))}
        </div>
      </Section>

      <footer className="bg-white border-t border-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-black/70 flex flex-col sm:flex-row justify-between">
          <p>© {new Date().getFullYear()} Maukhik</p>
          <a href="#hero" onClick={(e) => { e.preventDefault(); const el = document.getElementById("hero"); if (el) el.scrollIntoView({ behavior: "smooth" }); }} className="hover:opacity-80">Back to top</a>
        </div>
      </footer>
    </div>
  );
}
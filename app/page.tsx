import Link from 'next/link'
import MiniGridDemo from './MiniGridDemo'

export default function HomePage() {
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#08080f;--bg2:#0e0e1a;
          --purple:#6c5ce7;--purple2:#a89aff;
          --text:#e8e6ff;--text2:#8a82c0;--text3:#3d3860;
          --border:rgba(130,110,255,0.12);--border2:rgba(130,110,255,0.25);
        }
        body{font-family:var(--font-geist-sans),system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px;line-height:1.5}
        .page-nav{-webkit-tap-highlight-color:transparent}
        .page-nav{
          position:sticky;top:0;z-index:100;
          display:flex;align-items:center;gap:10px;
          min-height:52px;
          padding:10px 16px;
          padding-left:max(16px, env(safe-area-inset-left));
          padding-right:max(16px, env(safe-area-inset-right));
          padding-top:max(10px, env(safe-area-inset-top));
          border-bottom:1px solid rgba(130,110,255,0.11);
          background:rgba(8,8,15,0.82);
          backdrop-filter:blur(18px) saturate(1.2);
          -webkit-backdrop-filter:blur(18px) saturate(1.2);
          box-shadow:0 1px 0 rgba(255,255,255,0.04) inset;
        }
        @media (min-width:641px){
          .page-nav{gap:18px;padding:14px 22px;padding-left:max(22px, env(safe-area-inset-left));padding-right:max(22px, env(safe-area-inset-right));padding-top:max(14px, env(safe-area-inset-top));min-height:56px}
        }
        .nav-brand{
          flex-shrink:0;font-size:14px;font-weight:600;color:var(--purple2);letter-spacing:.08em;text-decoration:none;
          line-height:1;padding:6px 0;
        }
        .nav-brand:hover{color:#c4b8ff}
        .nav-links-desktop{
          flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:clamp(14px,3vw,22px);
        }
        @media (max-width:640px){
          .nav-links-desktop{
            justify-content:flex-start;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;
            scrollbar-width:none;gap:4px;margin:0 -6px;padding:2px 6px 8px;
            mask-image:linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
          }
          .nav-links-desktop::-webkit-scrollbar{display:none}
        }
        .nav-link{
          flex-shrink:0;font-size:13px;color:var(--text2);text-decoration:none;white-space:nowrap;
          padding:8px 10px;border-radius:10px;transition:color .2s, background .15s;
        }
        @media (max-width:640px){
          .nav-link{font-size:12px;color:rgba(184,172,232,.92);padding:8px 12px;border-radius:999px;background:rgba(130,110,255,0.06);border:0.5px solid rgba(130,110,255,0.1)}
          .nav-link:active{background:rgba(130,110,255,0.14)}
        }
        .nav-link:hover{color:var(--text)}
        .nav-cta-slot{flex-shrink:0}
        .nav-cta{
          background:linear-gradient(165deg,#8476f0 0%,var(--purple) 55%,#5a4fd4 100%);
          color:#fff;border:none;padding:9px 17px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;
          text-decoration:none;display:inline-block;white-space:nowrap;
          box-shadow:0 2px 16px rgba(108,92,231,0.38),0 0 0 0.5px rgba(255,255,255,0.08) inset;
          transition:opacity .2s, transform .12s, box-shadow .2s;
        }
        @media (max-width:640px){
          .nav-cta{padding:10px 16px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.04em;box-shadow:0 3px 18px rgba(108,92,231,0.42)}
        }
        .nav-cta:hover{opacity:.94}
        .nav-cta:active{transform:scale(.97)}
        .hero{text-align:center}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(108,92,231,.1);border:0.5px solid rgba(108,92,231,.3);border-radius:20px;padding:5px 14px;font-size:12px;color:var(--purple2);margin-bottom:24px;letter-spacing:.05em}
        .hero-dot{width:6px;height:6px;border-radius:50%;background:var(--purple);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .hero h1{font-size:clamp(24px,7vw,38px);font-weight:500;line-height:1.15;margin-bottom:16px;color:var(--text)}
        .hero h1 span{color:var(--purple2)}
        .hero-sub{font-size:clamp(13px,3.5vw,15px);color:var(--text2);max-width:400px;margin:0 auto 32px;line-height:1.6;padding:0 8px}
        .hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;flex-direction:column;align-items:center}
        @media (min-width:480px){.hero-btns{flex-direction:row;justify-content:center}}
        .btn-primary{background:var(--purple);color:#fff;border:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;text-decoration:none;display:inline-block;width:100%;max-width:280px;text-align:center}
        .btn-primary:hover{background:#7d6ef0;transform:translateY(-1px)}
        .btn-secondary{background:transparent;color:var(--text2);border:0.5px solid var(--border2);padding:12px 24px;border-radius:10px;font-size:14px;cursor:pointer;transition:all .2s;text-decoration:none;display:inline-block;width:100%;max-width:280px;text-align:center}
        .btn-secondary:hover{color:var(--text);border-color:rgba(130,110,255,.4)}
        @media (min-width:480px){.btn-primary,.btn-secondary{width:auto}}
        .mini-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:160px;margin:0 auto 16px}
        .mc{aspect-ratio:1;border-radius:8px;background:rgba(255,255,255,.04);border:0.5px solid var(--border);transition:all .4s}
        .mc.lit{background:var(--purple);border-color:#8b7fff}
        .mc.fading{background:rgba(108,92,231,.3);border-color:rgba(139,127,255,.4)}
        .mini-stats{display:flex;justify-content:center;align-items:flex-start;gap:clamp(8px,3vw,20px);flex-wrap:nowrap;width:100%}
        .ms{text-align:center;flex:1;min-width:0}
        .ms-val{font-size:clamp(14px,4vw,18px);font-weight:500;color:var(--purple2)}
        .ms-lbl{font-size:clamp(9px,2.4vw,11px);color:var(--text3);margin-top:2px}
        .feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:700px;margin:0 auto}
        .feat-card{background:var(--bg2);border:0.5px solid var(--border);border-radius:12px;padding:18px 16px;transition:border-color .2s}
        .feat-card:hover{border-color:var(--border2)}
        .feat-icon{width:32px;height:32px;border-radius:8px;background:rgba(108,92,231,.15);display:flex;align-items:center;justify-content:center;margin-bottom:12px}
        .feat-icon svg{width:16px;height:16px;stroke:var(--purple2);fill:none;stroke-width:1.5}
        .feat-title{font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px}
        .feat-desc{font-size:12px;color:var(--text2);line-height:1.5}
        .social-proof{border-top:0.5px solid var(--border)}
        .sp-inner{max-width:600px;margin:0 auto}
        .sp-label{font-size:11px;color:var(--text3);letter-spacing:.08em;text-align:center;margin-bottom:16px;text-transform:uppercase}
        .sp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .sp-card{background:var(--bg2);border:0.5px solid var(--border);border-radius:10px;padding:12px 14px}
        .sp-quote{font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:8px}
        .sp-name{font-size:11px;color:var(--text3)}
        @media (max-width:600px){.sp-quote{font-size:11px}.sp-card{padding:10px 12px}}
        .hero{padding:40px 16px 36px}
        @media (min-width:601px){.hero{padding:60px 24px 48px}}
        .features{padding:32px 16px}
        @media (min-width:601px){.features{padding:40px 24px}}
        .social-proof{padding:24px 16px}
        @media (min-width:601px){.social-proof{padding:32px 24px}}
      `}</style>

      <nav className="page-nav" aria-label="Hlavní navigace">
        <Link href="/" className="nav-brand">
          lock-i<span>N</span>
        </Link>

        <div className="nav-links-desktop">
          <a className="nav-link" href="#jak">jak to funguje</a>
          <a className="nav-link" href="/vyzkum">výzkum</a>
          <a className="nav-link" href="/ceny">ceny</a>
        </div>

        <div className="nav-cta-slot">
          <Link href="/register" className="nav-cta">začít zdarma</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow"><div className="hero-dot"></div>vědecky ověřená metoda</div>
        <h1>trénuj mozek,<br />ne jen <span>čas</span></h1>
        <p className="hero-sub">n-back trénink který se přizpůsobuje tvému výkonu. Věda v pozadí, jednoduchost v popředí.</p>
        <div className="hero-btns">
          <Link href="/register" className="btn-primary">začít zdarma</Link>
          <a href="#jak" className="btn-secondary">jak to funguje</a>
        </div>
        <div
          style={{
            margin: '32px auto 0',
            maxWidth: '320px',
            width: '100%',
            background: '#0e0e1a',
            border: '0.5px solid rgba(130,110,255,0.15)',
            borderRadius: '16px',
            padding: '20px 16px',
          }}
        >
          <MiniGridDemo />
          <div className="mini-stats">
            <div className="ms"><div className="ms-val">3-back</div><div className="ms-lbl">aktuální úroveň</div></div>
            <div className="ms"><div className="ms-val">82%</div><div className="ms-lbl">přesnost</div></div>
            <div className="ms"><div className="ms-val">14 dní</div><div className="ms-lbl">streak</div></div>
          </div>
        </div>
      </section>

      <section className="features" id="jak">
        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 16 16"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z"/><path d="M8 5v3l2 2"/></svg></div>
            <div className="feat-title">adaptivní obtížnost</div>
            <div className="feat-desc">N se upravuje každé sezení podle tvého aktuálního výkonu.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 16 16"><polyline points="2,10 6,6 9,9 14,4"/></svg></div>
            <div className="feat-title">dlouhodobá data</div>
            <div className="feat-desc">Vizualizace pokroku přes týdny a měsíce, ne jen dnešní skóre.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg></div>
            <div className="feat-title">dual n-back</div>
            <div className="feat-desc">Poloha i zvuk najednou — nejsilnější forma tréninku.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg></div>
            <div className="feat-title">krátká sezení</div>
            <div className="feat-desc">15 minut denně stačí. Bez zbytečné gamifikace.</div>
          </div>
        </div>
      </section>

      <section className="social-proof">
        <div className="sp-inner">
          <div className="sp-label">co říkají uživatelé</div>
          <div className="sp-grid">
            <div className="sp-card">
              <div className="sp-quote">"Po měsíci jsem začal vnímat rozdíl ve schopnosti soustředit se při práci."</div>
              <div className="sp-name">Jakub M., developer</div>
            </div>
            <div className="sp-card">
              <div className="sp-quote">"Konečně appka bez gamification bullshitu. Čistá, přímá, funkční."</div>
              <div className="sp-name">Tereza H., studentka</div>
            </div>
            <div className="sp-card">
              <div className="sp-quote">"Přesně to co jsem hledal — vědecky podložené, bez dětského designu."</div>
              <div className="sp-name">Martin K., vědec</div>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}

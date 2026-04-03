export default function CenyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .plan-card{transition:border-color .2s;}
        .plan-card:hover{border-color:rgba(130,110,255,0.4);}
        .btn-primary{background:#6c5ce7;color:#fff;border:none;padding:12px 0;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;width:100%;transition:all .2s;}
        .btn-primary:hover{background:#7d6ef0;}
        .btn-secondary{background:transparent;color:#8a82c0;border:0.5px solid rgba(130,110,255,0.25);padding:12px 0;border-radius:10px;font-size:14px;cursor:pointer;width:100%;transition:all .2s;}
        .btn-secondary:hover{color:#e8e6ff;border-color:rgba(130,110,255,0.5);}
      `}} />

      <div style={{fontFamily:'var(--font-geist-sans), system-ui, sans-serif', background:'#08080f', color:'#e8e6ff', minHeight:'100vh', padding:'48px 24px'}}>
        <div style={{maxWidth:'780px', margin:'0 auto'}}>

          {/* Back */}
          <a href="/" style={{fontSize:'13px', color:'#6b64a0', textDecoration:'none', display:'inline-block', marginBottom:'48px'}}>← zpět</a>

          {/* Header */}
          <div style={{textAlign:'center', marginBottom:'48px'}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(108,92,231,.1)', border:'0.5px solid rgba(108,92,231,.3)', borderRadius:'20px', padding:'5px 14px', fontSize:'12px', color:'#a89aff', marginBottom:'20px', letterSpacing:'.05em'}}>
              <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#6c5ce7', animation:'pulse 2s infinite'}} />
              žádné překvapení
            </div>
            <h1 style={{fontSize:'28px', fontWeight:400, color:'#e8e6ff', margin:'0 0 12px'}}>transparentní ceny</h1>
            <p style={{fontSize:'14px', color:'#8a82c0', maxWidth:'380px', margin:'0 auto', lineHeight:1.7}}>
              Základní hra je zdarma. Platíš jen když chceš víc.
            </p>
          </div>

          {/* Cards grid */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'12px', marginBottom:'48px'}}>

            {/* Free */}
            <div className="plan-card" style={{background:'#0e0e1a', border:'0.5px solid rgba(130,110,255,0.15)', borderRadius:'14px', padding:'24px', display:'flex', flexDirection:'column', gap:'20px'}}>
              <div>
                <div style={{fontSize:'11px', color:'#6b64a0', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'10px'}}>zdarma</div>
                <div style={{fontSize:'32px', fontWeight:500, color:'#e8e6ff', lineHeight:1}}>0 Kč</div>
                <div style={{fontSize:'12px', color:'#3d3860', marginTop:'6px'}}>navždy</div>
              </div>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px'}}>
                {[
                  'Plná hra — dual n-back',
                  '3 klíče při registraci',
                  'Adaptivní obtížnost',
                  'Dashboard a grafy',
                  '3× AI analýza sezení měsíčně',
                ].map(item => (
                  <li key={item} style={{fontSize:'13px', color:'#8a82c0', display:'flex', alignItems:'flex-start', gap:'8px'}}>
                    <span style={{color:'#6c5ce7', marginTop:'1px', flexShrink:0}}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/register" className="btn-secondary" style={{display:'block', textAlign:'center', textDecoration:'none', padding:'12px 0', borderRadius:'10px', fontSize:'14px', color:'#8a82c0', border:'0.5px solid rgba(130,110,255,0.25)'}}>
                začít zdarma
              </a>
            </div>

            {/* Reset klíčů */}
            <div className="plan-card" style={{background:'#0e0e1a', border:'0.5px solid rgba(130,110,255,0.15)', borderRadius:'14px', padding:'24px', display:'flex', flexDirection:'column', gap:'20px'}}>
              <div>
                <div style={{fontSize:'11px', color:'#6b64a0', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'10px'}}>reset klíčů</div>
                <div style={{display:'flex', alignItems:'baseline', gap:'8px'}}>
                  <div style={{fontSize:'32px', fontWeight:500, color:'#e8e6ff', lineHeight:1}}>69 Kč</div>
                  <div style={{fontSize:'13px', color:'#3d3860'}}>/ $2.99</div>
                </div>
                <div style={{fontSize:'12px', color:'#3d3860', marginTop:'6px'}}>jednorázově</div>
              </div>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px'}}>
                {[
                  'Okamžitý reset na 3 klíče',
                  'Dostupné kdykoliv z locked screen',
                  'Bez závazku',
                ].map(item => (
                  <li key={item} style={{fontSize:'13px', color:'#8a82c0', display:'flex', alignItems:'flex-start', gap:'8px'}}>
                    <span style={{color:'#6c5ce7', marginTop:'1px', flexShrink:0}}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{fontSize:'12px', color:'#3d3860', marginTop:'auto', paddingTop:'8px', borderTop:'0.5px solid rgba(130,110,255,0.1)'}}>
                K dispozici v aplikaci na obrazovce uzamčení
              </div>
            </div>

            {/* Premium */}
            <div className="plan-card" style={{background:'#0e0e1a', border:'1.5px solid rgba(108,92,231,0.5)', borderRadius:'14px', padding:'24px', display:'flex', flexDirection:'column', gap:'20px', position:'relative'}}>
              <div style={{position:'absolute', top:'-1px', right:'20px', background:'#6c5ce7', color:'#fff', fontSize:'11px', fontWeight:500, padding:'4px 12px', borderRadius:'0 0 8px 8px', letterSpacing:'.04em'}}>
                doporučeno
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#6b64a0', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'10px'}}>premium</div>
                <div style={{display:'flex', alignItems:'baseline', gap:'8px'}}>
                  <div style={{fontSize:'32px', fontWeight:500, color:'#e8e6ff', lineHeight:1}}>115 Kč</div>
                  <div style={{fontSize:'13px', color:'#3d3860'}}>/ $4.99</div>
                </div>
                <div style={{fontSize:'12px', color:'#3d3860', marginTop:'6px'}}>
                  měsíčně · nebo <span style={{color:'#a89aff'}}>919 Kč / $39.99 ročně</span>
                </div>
              </div>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px'}}>
                {[
                  'Vše ze zdarma',
                  'Neomezené AI analýzy sezení',
                  'Týdenní insight report',
                  'Identifikace vzorů a slabin',
                  'Konkrétní tréninková doporučení',
                ].map(item => (
                  <li key={item} style={{fontSize:'13px', color:'#8a82c0', display:'flex', alignItems:'flex-start', gap:'8px'}}>
                    <span style={{color:'#6c5ce7', marginTop:'1px', flexShrink:0}}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/subscribe" className="btn-primary" style={{display:'block', textAlign:'center', textDecoration:'none', padding:'12px 0', borderRadius:'10px', fontSize:'14px', color:'#fff'}}>
                začít s Premium
              </a>
            </div>

          </div>

          {/* FAQ */}
          <div style={{borderTop:'0.5px solid rgba(130,110,255,0.12)', paddingTop:'40px', display:'flex', flexDirection:'column', gap:'24px', maxWidth:'520px', margin:'0 auto'}}>
            <div style={{fontSize:'11px', color:'#6b64a0', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'8px'}}>časté otázky</div>
            {[
              {
                q: 'Co se stane když přijdu o všechny klíče?',
                a: 'Přístup ke hře se zablokuje. Klíč získáš zpět zdarma když 3× za sebou překonáš své maximum, nebo pozveš přítele přes referral odkaz. Nebo si klíče resetuješ za 69 Kč.'
              },
              {
                q: 'Mohu Premium kdykoliv zrušit?',
                a: 'Ano, bez závazku. Zrušení je dostupné přímo v nastavení účtu.'
              },
              {
                q: 'Co je týdenní insight report?',
                a: 'Každé pondělí Claude analyzuje tvá sezení z uplynulého týdne a identifikuje vzory které z grafů nevyčteš — např. kdy výkon klesá, který kanál je slabší, a co konkrétně změnit.'
              },
            ].map(item => (
              <div key={item.q}>
                <div style={{fontSize:'14px', fontWeight:500, color:'#e8e6ff', marginBottom:'8px'}}>{item.q}</div>
                <div style={{fontSize:'13px', color:'#8a82c0', lineHeight:1.7}}>{item.a}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}

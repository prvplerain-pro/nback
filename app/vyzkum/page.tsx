import { VyzkumCardsReveal } from './VyzkumCardsReveal'

export default function VyzkumPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .card{opacity:0;transform:translateY(28px);transition:opacity .55s ease, transform .55s ease;}
        .card.visible{opacity:1;transform:translateY(0);}
      `,
        }}
      />

      <div
        style={{
          fontFamily: 'system-ui,-apple-system,sans-serif',
          background: '#08080f',
          color: '#e8e6ff',
          minHeight: '100vh',
          padding: '48px 24px',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <a
            href="/"
            style={{
              fontSize: '13px',
              color: '#6b64a0',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '40px',
            }}
          >
            ← zpět
          </a>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(108,92,231,.1)',
              border: '0.5px solid rgba(108,92,231,.3)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '12px',
              color: '#a89aff',
              marginBottom: '16px',
              letterSpacing: '0.05em',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#6c5ce7',
                animation: 'pulse 2s infinite',
              }}
            />
            podklad pro lock-in
          </div>

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 500,
              lineHeight: 1.2,
              marginBottom: '12px',
              color: '#e8e6ff',
            }}
          >
            výzkum za dual n-back
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#8a82c0',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '560px',
            }}
          >
            Níže je stručný přehled toho, co literatura typicky říká o tréninku pracovní paměti
            (včetně n-back) — včetně limitů přenosu na „IQ“ nebo každodenní úkoly.
          </p>

          <VyzkumCardsReveal
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              className="card"
              style={{
                background: '#0e0e1a',
                border: '0.5px solid rgba(130,110,255,0.12)',
                borderRadius: '12px',
                padding: '18px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#3d3860',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                klíčová studie
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#e8e6ff' }}>
                Fluid intelligence po tréninku
              </div>
              <p style={{ fontSize: '12px', color: '#8a82c0', lineHeight: 1.55, margin: 0 }}>
                Jaeggi et al. (2008) hlásili nárůst měření fluid intelligence po několikatýdenním
                adaptivním n-back tréninku — výsledek, který pozdější práce zkoušely replikovat s
                různým úspěchem.
              </p>
            </div>

            <div
              className="card"
              style={{
                background: '#0e0e1a',
                border: '0.5px solid rgba(130,110,255,0.12)',
                borderRadius: '12px',
                padding: '18px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#3d3860',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                meta-analýzy
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#e8e6ff' }}>
                Přenos je omezený
              </div>
              <p style={{ fontSize: '12px', color: '#8a82c0', lineHeight: 1.55, margin: 0 }}>
                Přehledy často nacházejí silnější efekty na úlohy podobné tréninku než na vzdálené
                kognitivní testy; u „far transfer“ bývá efekt menší nebo nekonzistentní.
              </p>
            </div>

            <div
              className="card"
              style={{
                background: '#0e0e1a',
                border: '0.5px solid rgba(130,110,255,0.12)',
                borderRadius: '12px',
                padding: '18px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#3d3860',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                mechanismus
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#e8e6ff' }}>
                Pracovní paměť a pozornost
              </div>
              <p style={{ fontSize: '12px', color: '#8a82c0', lineHeight: 1.55, margin: 0 }}>
                Dual n-back zatěžuje udržování a aktualizaci více proudů informací — proto bývá
                náročnější než jednoduché varianty a může lépe cílit na souběžné zpracování.
              </p>
            </div>

            <div
              className="card"
              style={{
                background: '#0e0e1a',
                border: '0.5px solid rgba(130,110,255,0.12)',
                borderRadius: '12px',
                padding: '18px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#3d3860',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                praxe
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#e8e6ff' }}>
                Délka a dávkování
              </div>
              <p style={{ fontSize: '12px', color: '#8a82c0', lineHeight: 1.55, margin: 0 }}>
                Krátká denní sezení a postupné zvyšování N (adaptace) odpovídají běžnému designu
                výzkumných protokolů — přesné parametry se mezi studiemi liší.
              </p>
            </div>

            <div
              className="card"
              style={{
                gridColumn: '1 / -1',
                background: '#0e0e1a',
                border: '0.5px solid rgba(130,110,255,0.12)',
                borderRadius: '12px',
                padding: '18px 16px',
              }}
            >
            <div
              style={{
                fontSize: '11px',
                color: '#3d3860',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              vybrané reference
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '18px',
                fontSize: '12px',
                color: '#8a82c0',
                lineHeight: 1.65,
              }}
            >
              <li style={{ marginBottom: '8px' }}>
                Jaeggi, S. M., Buschkuehl, M., Jonides, J., & Perrig, W. J. (2008). Improving fluid
                intelligence with training on working memory.{' '}
                <em style={{ color: '#6b64a0' }}>Proceedings of the National Academy of Sciences</em>,
                105(19), 6829–6833.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Melby-Lervåg, M., & Hulme, C. (2013). Is working memory training effective? A
                meta-analytic review. <em style={{ color: '#6b64a0' }}>Developmental Psychology</em>,
                49(2), 270–291.
              </li>
              <li style={{ margin: 0 }}>
                Schwaighofer, M., Fischer, F., & Bühner, M. (2015). Does working memory training
                transfer? A meta-analysis including a series of primed cognitive tasks.{' '}
                <em style={{ color: '#6b64a0' }}>Psychonomic Bulletin &amp; Review</em>, 22(2), 366–387.
              </li>
            </ul>
            </div>
          </VyzkumCardsReveal>

          <p
            style={{
              fontSize: '11px',
              color: '#3d3860',
              marginTop: '24px',
              lineHeight: 1.5,
            }}
          >
            Tento text slouží jako orientační souhrn, ne jako lékařská nebo psychologická rada.
          </p>
        </div>
      </div>
    </>
  )
}

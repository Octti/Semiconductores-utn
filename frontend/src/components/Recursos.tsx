import { motion } from 'framer-motion';

export function Recursos() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="recursos-container">
      <section>
        <h3 style={{ marginBottom: '1rem' }}>Eficacia Luminosa</h3>
        <div className="equation-box">
          <h2>100 - 200+ lm/W</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Eficacia actual de la tecnología LED frente a los 12-18 lm/W de la lámpara incandescente tradicional.
          </p>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Conceptos clave de la monografía</h3>
        <div className="conceptos-list">
          <details>
            <summary>Electroluminiscencia de estado sólido</summary>
            <p>Emisión directa de luz por parte de un material semiconductor al ser atravesado por una corriente eléctrica, sin recurrir al calentamiento de un filamento.</p>
          </details>
          <details>
            <summary>Conversión por fósforo (pc-LED)</summary>
            <p>Técnica de 1995 que recubre un chip LED azul (InGaN) con fósforo YAG para sintetizar luz blanca de alta intensidad.</p>
          </details>
          <details>
            <summary>Li-Fi y VLC</summary>
            <p>Comunicación por Luz Visible; utiliza la conmutación rápida de los semiconductores LED para transmitir datos e internet, inmune a interferencias de radiofrecuencia.</p>
          </details>
          <details>
            <summary>Indoor Farming y Recetas de Luz</summary>
            <p>La especialización espectral en rojo (660nm) acelera la floración, mientras que el azul (450nm) evita el estiramiento del tallo y mejora la densidad foliar en granjas verticales.</p>
          </details>
          <details>
            <summary>Impacto ambiental y PERMER</summary>
            <p>El uso de LED reduce emisiones de CO2 y, al no contener mercurio (a diferencia de las CFL), previene contaminación. En Argentina, proyectos como PERMER llevan iluminación LED a zonas sin red eléctrica.</p>
          </details>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Línea del tiempo</h3>
        <div className="timeline">
          <div className="timeline-item">
            <h4>1907</h4>
            <p>H. J. Round observa electroluminiscencia en carburo de silicio.</p>
          </div>
          <div className="timeline-item">
            <h4>1962</h4>
            <p>Nick Holonyak Jr. sintetiza GaAsP y crea el primer LED de luz visible (rojo).</p>
          </div>
          <div className="timeline-item">
            <h4>1972</h4>
            <p>M. George Craford dopa aleaciones con nitrógeno y desarrolla el LED amarillo.</p>
          </div>
          <div className="timeline-item">
            <h4>1993</h4>
            <p>Shuji Nakamura supera el "enigma del Nitruro de Galio" y logra el LED azul brillante.</p>
          </div>
          <div className="timeline-item">
            <h4>2014</h4>
            <p>Akasaki, Amano y Nakamura reciben el Premio Nobel de Física por el LED azul eficiente.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
/**
 * Normativa completa del torneo de Fútbol Sala.
 * Componente independiente, mismo estilo que NormativaPadel.
 */
export default function NormativaFutsal() {
  return (
    <div className="p-5 md:p-8 bg-black/40 border-t border-slate-700 text-sm text-slate-300 space-y-6 max-h-[60vh] overflow-y-auto">
      <div className="space-y-3">
        <h3 className="text-lg font-black text-white uppercase tracking-widest">TORNEO FÚTBOL SALA</h3>
        <p>Se aplicará el reglamento de la <span className="font-bold text-white">Federación Española de Fútbol Sala</span>. La participación en el torneo supone la aceptación íntegra de esta normativa.</p>
      </div>

      <Seccion titulo="NORMATIVA">
        <ol className="list-decimal pl-5 space-y-3 marker:text-[#60A5FA] marker:font-black">
          <li>Cada equipo tendrá que entregar una hoja con la relación de jugadores que vayan a disputar el torneo, y en caso de que la organización lo estime necesario podrá ser requerido a cualquier jugador que presente su documentación. A lo largo del torneo se podrán inscribir jugadores hasta llegar al límite de <span className="text-[#60A5FA] font-bold">12 jugadores</span>. Como máximo podrás inscribir jugadores hasta el último día de fase de grupos (éste inclusive).</li>
          <li>El jugador que no se haya presentado al partido personalmente antes del comienzo de la segunda parte, no podrá participar en dicho partido.</li>
          <li>Los equipos irán provistos de equipamiento con su correspondiente dorsal y debe estar visible durante todos los partidos. En su defecto se utilizarán petos de la organización y deberán marcarse de alguna manera el número para que el colegiado pueda tenerlo claro.</li>
          <li>Por coincidencia de colores en la vestimenta se utilizarán los petos de la organización y se sorteará el uso de éstos.</li>
          <li>No se permitirá la sustitución de ningún jugador. El límite de jugadores inscritos es de 12 jugadores. Los jugadores no podrán jugar en ningún otro equipo ni estar inscritos en más de un equipo dentro de la misma categoría.</li>
          <li>Cada equipo dispondrá de <span className="text-amber-500 font-bold">quince minutos (15')</span> de cortesía a partir de la hora de inicio del partido. Si en este plazo de tiempo no se presenta, se le sancionará con la descalificación del partido (en caso de no haber avisado previamente) y se les dará el partido por perdido <span className="text-red-400 font-bold">3-0</span>. Los goles no serán asignados a ningún jugador. En caso de no contar con el mínimo de jugadores permitido dentro del tiempo de cortesía, se les dará un aviso al equipo (<span className="font-bold text-white">WARNING</span>), y si vuelve a ocurrir están expulsados del torneo automáticamente. El sistema de puntuación tras éste caso sería de 3 puntos para el equipo que gana y <span className="text-red-400 font-bold">-3</span> para el equipo que no se presenta.</li>
          <li>En los banquillos de cada equipo y dentro de la pista no podrá permanecer más personal que jugadores, un delegado de equipo (el mismo durante todo el torneo), árbitros y organización.</li>
          <li>Cuando un jugador y un entrenador o dirigente de un equipo fueran expulsados, no podrán permanecer en el banquillo ni dentro de la cancha, después de la expulsión ni durante la duración del partido en que son expulsados, ni en sus partidos de sanción.</li>
          <li>El incumplimiento de las normas 6, 7 y 8 hará que la organización no de comienzo al encuentro o paralice el mismo. Transcurrido un tiempo limitado la organización suspenderá el encuentro y penalizará al equipo infractor con tres puntos, y se les dará el partido por perdido por 3-0.</li>
          <li>La organización se reservará el derecho de participación de jugadores o entrenadores o equipos que su comportamiento sea o haya sido <span className="font-bold text-white">ANTIDEPORTIVO</span>, pudiendo conllevar la expulsión del torneo de dicho jugador o entrenador.</li>
          <li>
            En caso de empate en la clasificación final de los grupos, para determinar quién se clasifica para cuartos de final se tendrá en cuenta:
            <ol className="list-decimal pl-6 mt-2 space-y-1 marker:text-slate-500">
              <li>Resultado entre ambos equipos</li>
              <li>Diferencia de goles particular (GF-GC)</li>
              <li>Mayor número de goles a favor</li>
              <li>Menor cantidad de tarjetas amarillas y rojas (<span className="text-amber-500 font-bold">A=1 pto</span>; <span className="text-red-400 font-bold">R=2 ptos</span>)</li>
              <li>Moneda al aire.</li>
            </ol>
            <p className="mt-2 flex gap-2"><span className="text-[#60A5FA] font-bold">●</span> En el caso de triple empate o más se tendrá en cuenta el mismo patrón, en el mismo orden quitando el punto 1.</p>
          </li>
          <li>Las diversas sanciones se establecerán de acuerdo con el reglamento, el estamento arbitral y la organización. (Apartado de sanciones)</li>
          <li>La organización atenderá las diversas sugerencias o alegaciones que pudieran surgir en el transcurso del campeonato hasta <span className="text-amber-500 font-bold">30 minutos</span> después de finalizar el último partido de la jornada en la que haya participado el equipo, en el bar del recinto deportivo.</li>
          <li>Se aplicará el reglamento de la Federación Española de Fútbol Sala. La única modificación respecto a dicho reglamento se dará cuando haya un expulsado, ya que podrá entrar un jugador a sustituirlo.</li>
          <li>
            La acumulación de tarjetas será la siguiente:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><span className="text-amber-500 font-bold">3 amarillas</span> = 1 partido de sanción</li>
              <li>Tarjeta <span className="text-red-400 font-bold">roja tras doble amarilla</span> = expulsión del partido pero puedes jugar el partido siguiente. En el registro de tarjetas se contabilizarán 2 tarjetas amarillas.</li>
              <li><span className="text-red-400 font-bold">Tarjeta roja directa</span>: 2 partidos de sanción mínimo. (Excepto en el caso indicado en apartado de normas).</li>
            </ul>
            <p className="mt-2">La acumulación de tarjetas se mantendrá hasta cuartos de final. Los equipos que pasen a semifinales con tarjetas pasarán limpios.</p>
          </li>
          <li>La organización no se hace responsable de posibles lesiones en las instalaciones durante el desarrollo del torneo.</li>
          <li>La organización se reserva el derecho de decidir in situ sobre cualquier situación o consecuencia de la misma.</li>
          <li>La participación en el torneo supone la aceptación de la normativa descrita anteriormente.</li>
          <li>No se permitirá jugar a ningún jugador que no lleve el calzado apropiado para las instalaciones y pueda dañar dichas instalaciones.</li>
        </ol>
      </Seccion>

      <Seccion titulo="SANCIONES">
        <ol className="list-decimal pl-5 space-y-2 marker:text-red-400 marker:font-black">
          <li>Tarjeta roja por mano interrumpiendo ocasión manifiesta de gol. <span className="font-bold text-white">1 partido</span>.</li>
          <li>Tarjeta roja directa por juego brusco o grave. <span className="font-bold text-white">1 a 5 partidos</span>.</li>
          <li>Discrepancias con las decisiones arbitrales. <span className="font-bold text-white">1 a 5 partidos</span>.</li>
          <li>Menosprecios o insultos al árbitro durante o al finalizar el partido. <span className="font-bold text-white">2 a expulsión del torneo</span>.</li>
          <li>Enfrentamiento con otros jugadores, propio equipo o público. <span className="font-bold text-white">2 a expulsión del torneo</span>.</li>
          <li>Amenazas al árbitro. <span className="text-red-400 font-bold">Expulsión del torneo</span>.</li>
          <li>Intento de agresión o agresión al árbitro o miembros de la organización. <span className="text-red-400 font-bold">Expulsión del torneo</span>.</li>
          <li>Desde el banquillo invadir el campo para insultar al árbitro. <span className="font-bold text-white">De 2 a expulsión del torneo</span>.</li>
          <li>Dar patadas a las puertas, o banquillos o conducta antideportiva, incluso rotura de materiales. <span className="font-bold text-white">De 3 a expulsión del torneo</span>.</li>
          <li>Ser expulsado y no querer salir del banquillo. <span className="font-bold text-white">2-4 partidos</span>.</li>
          <li>Jugador que es expulsado de la semana anterior, y como espectador es identificado con conducta antideportiva. <span className="font-bold text-white">4 a expulsión del torneo</span>.</li>
          <li>Actitud negativa contra público y contrarios al marcar gol. <span className="font-bold text-white">De 1 a 5 partidos</span>.</li>
          <li>Desde el banquillo, un jugador entra en el campo cortando una jugada de contraataque con posibilidad de gol. <span className="font-bold text-white">7 partidos</span> para jugadores, <span className="text-red-400 font-bold">expulsión del torneo</span> para delegados.</li>
        </ol>
      </Seccion>
    </div>
  );
}

// Componente auxiliar para secciones
function Seccion({ titulo, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[#60A5FA] font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">
        {titulo}
      </h4>
      {children}
    </div>
  );
}

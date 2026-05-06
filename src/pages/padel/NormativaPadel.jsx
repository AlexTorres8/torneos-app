/**
 * Normativa completa del torneo de Pádel.
 * Extraída como componente independiente para mantener TorneosPadel limpio.
 */
export default function NormativaPadel() {
  return (
    <div className="p-5 md:p-8 bg-black/40 border-t border-slate-700 text-sm text-slate-300 space-y-6 max-h-[60vh] overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white uppercase tracking-widest">TORNEO PÁDEL</h3>
        <p>El presente reglamento interno tiene como objetivo establecer las normas de la competición.</p>
        <p>Estas reglas deberán ser <span className="font-bold text-white">entendidas, conocidas y aceptadas</span> por la totalidad de los participantes.</p>
        <p>En cuanto al reglamento del juego de Pádel, se regirá por el reglamento oficial establecido por la Federación Española de Pádel.</p>
      </div>

      <Seccion titulo="1.- REQUISITOS PARA LOS PARTICIPANTES">
        <ul className="list-disc pl-5 space-y-2">
          <li>1.1.- Abonar el importe de la inscripción (<span className="text-amber-500 font-bold">10€ x jugador</span>).</li>
          <li>1.2.- Aceptar íntegramente la normativa que rige esta competición.</li>
          <li>1.3.- Tener disponibilidad para la disputa de los partidos en los días y horarios establecidos.</li>
          <li>1.4.- Disponer de teléfono móvil para mantener contacto con la Organización.</li>
          <li>1.5.- Únicamente se podrá jugar con <span className="text-amber-500 font-bold">pelotas proporcionadas por la Organización o pelotas nuevas a estrenar</span>.</li>
        </ul>
      </Seccion>

      <Seccion titulo="2.- INSCRIPCIONES, PRECIOS, DÍAS Y HORARIOS">
        <ul className="list-none space-y-2">
          <li><b className="text-white">2.1.-</b> Los equipos estarán formados por dos jugadores y deberán aportar los datos de ambos participantes y designar un capitán.</li>
          <li><b className="text-white">2.2.-</b> La organización confirmará la inscripción una vez comprobado el pago.</li>
          <li><b className="text-white">2.3.-</b> Horario oficial: <span className="text-amber-500 font-bold">20:00h a 23:00h</span> cualquier día de la semana.</li>
          <li><b className="text-white">2.4.-</b> Todos los partidos se disputarán en las <span className="text-amber-500 font-bold">instalaciones del polideportivo de Agost</span>.</li>
        </ul>
      </Seccion>

      <Seccion titulo="3.- EQUIPOS, ORGANIZACIÓN DE PARTIDOS Y ACTAS">
        <ul className="list-none space-y-2">
          <li><b className="text-white">3.1.-</b> El capitán será la persona de contacto con la organización y con los demás equipos.</li>
          <li><b className="text-white">3.2.-</b> La pareja <span className="text-amber-500 font-bold">local</span> es la encargada de ponerse en contacto con la otra para acordar la permuta del partido en caso necesario.</li>
          <li><b className="text-white">3.3.-</b> El acta del partido deberá rellenarse en un plazo máximo de <span className="text-amber-500 font-bold">24 horas</span> tras su disputa.</li>
        </ul>
      </Seccion>

      <Seccion titulo="4.- DURACIÓN DE LOS PARTIDOS Y PUNTUACIÓN">
        <ul className="list-none space-y-2">
          <li><b className="text-white">4.1.-</b> Calentamiento de <span className="text-amber-500 font-bold">entre 5 y 10 minutos</span> desde la hora de inicio.</li>
          <li><b className="text-white">4.2.-</b> Todos los partidos se disputarán al <span className="text-amber-500 font-bold">mejor de 3 sets</span>. Los empates a 6 juegos se resolverán por tie break.</li>
          <li><b className="text-white">4.3.-</b> La duración máxima de cada partido es de hora y media. <span className="text-red-400 font-bold">Todos los partidos serán a punto de oro.</span></li>
          <li>
            <b className="text-white">4.4.- Puntuación:</b>
            <ul className="list-disc pl-8 mt-2 space-y-1">
              <li>Ganador → <span className="text-emerald-400 font-bold">3 puntos</span></li>
              <li>Perdedor → <span className="text-amber-500 font-bold">1 punto</span></li>
              <li>No jugado sin aviso → <span className="text-red-500 font-bold">-1 punto</span> al equipo infractor</li>
            </ul>
          </li>
          <li><b className="text-white">4.5.-</b> El arbitraje se llevará a cabo entre los 4 jugadores.</li>
          <li>
            <b className="text-white">4.6.-</b> En caso de empate al final de la fase regular se resolverá por: partido directo, set-average, juego-average y, si persiste, moneda al aire.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="5.- APLAZAMIENTO DE PARTIDOS">
        <p><b className="text-white">5.1.-</b> Notificar al equipo contrario con la mayor antelación posible.</p>
        <p className="text-red-400 font-bold bg-red-500/10 p-2 rounded border border-red-500/20 mt-2">
          Con menos de 24 horas de antelación el partido se dará por perdido.
        </p>
        <p className="font-bold text-white mt-2">No se permitirán más de <span className="text-red-400">4 aplazamientos</span> por equipo salvo lesión.</p>
      </Seccion>

      <Seccion titulo="6.- HORARIO DE JUEGO">
        <ul className="list-none space-y-2">
          <li><b className="text-white">6.2.-</b> Las parejas intentarán estar en las pistas al menos con 10 minutos de antelación.</li>
          <li><b className="text-white">6.4.-</b> Si pasados <span className="text-red-400 font-bold">10 minutos</span> algún jugador no estuviera presente sin causa justificada, el partido se dará por perdido.</li>
        </ul>
      </Seccion>

      <Seccion titulo="7.- SUSPENSIÓN DEL PARTIDO">
        <ul className="list-disc pl-5 space-y-1">
          <li>Por <span className="text-amber-500 font-bold">lesión</span>: gana el equipo contrario.</li>
          <li>Por lluvia u otras causas: el partido se reanudará con el mismo marcador.</li>
        </ul>
      </Seccion>

      <Seccion titulo="8.- SUSTITUCIÓN DE JUGADORES">
        <ul className="list-none space-y-2">
          <li><b className="text-white">8.2.-</b> <span className="text-red-400 font-bold bg-red-500/10 px-1 rounded">Las sustituciones están permitidas durante la LIGA GRUPOS pero NO durante los PLAY OFF.</span></li>
          <li><b className="text-white">8.3.-</b> Si un equipo causa baja voluntaria, perderá todos los derechos adquiridos.</li>
        </ul>
      </Seccion>

      <Seccion titulo="9.- PENALIZACIONES (W.O.)">
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded">
            <p className="font-bold text-amber-500">9.2.- Faltas Leves — 1 W.O. (restan 1 punto):</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Aplazar un partido sin notificarlo a la Organización en plazo.</li>
              <li>Realizar más de dos aplazamientos sin causa justificada.</li>
            </ul>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded">
            <p className="font-bold text-orange-500">9.3.- Faltas Graves — 2 W.O. (restan 2 puntos):</p>
            <ul className="list-disc pl-5 mt-1">
              <li>No entregar el acta del partido en tiempo y forma.</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
            <p className="font-bold text-red-500">9.4.- Faltas muy Graves — 3 W.O. (restan 3 puntos):</p>
            <ul className="list-disc pl-5 mt-1">
              <li>No presentarse a un partido sin avisar.</li>
              <li>Presentarse con un jugador no inscrito. Además se pierde el partido por 6-0.</li>
              <li>Comportamiento violento o antideportivo. Puede conllevar expulsión de la liga.</li>
            </ul>
          </div>
          <p><b className="text-white">Nota:</b> Si un equipo acumula <span className="text-red-400 font-bold">2 faltas muy graves</span> será expulsado directamente.</p>
        </div>
      </Seccion>
    </div>
  );
}

// Componente auxiliar para secciones
function Seccion({ titulo, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">
        {titulo}
      </h4>
      {children}
    </div>
  );
}

import { Helmet } from 'react-helmet-async';

const BASE_TITLE = 'Activa Fitness Agost';
const BASE_URL   = 'https://activafitness.es';
const BASE_IMAGE = `${BASE_URL}/fondo-gym.jpg`;
const BASE_DESC  = 'Centro deportivo en Agost con torneos oficiales de Fútbol Sala y Pádel. Clasificaciones y resultados en tiempo real.';

export function SEO({
  title,
  description = BASE_DESC,
  image       = BASE_IMAGE,
  noindex     = false,
  canonical,
}) {
  const fullTitle = title
    ? `${title} · ${BASE_TITLE}`
    : `${BASE_TITLE} · Torneos de Fútbol Sala y Pádel`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={`${BASE_URL}${canonical}`} />}

      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={image} />
      <meta property="og:type"        content="website" />
      <meta property="og:locale"      content="es_ES" />
      <meta property="og:site_name"   content={BASE_TITLE} />

      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />
    </Helmet>
  );
}

// ---------------------------------------------------------------
// Capa de datos. Mientras USE_MOCK sea true, todo funciona sin
// backend (datos guardados en localStorage). Cuando tu FastAPI
// esté listo, cambia USE_MOCK a false y no tocas nada más.
// ---------------------------------------------------------------
const USE_MOCK = true;
const API_URL = "http://localhost:8000";

/* ============ MODO REAL (FastAPI) ============ */
async function peticion(ruta, { metodo = "GET", cuerpo } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL + ruta, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!res.ok) {
    let mensaje = "Ocurrió un error. Inténtalo de nuevo.";
    try {
      const e = await res.json();
      if (typeof e.detail === "string") mensaje = e.detail;
    } catch {}
    throw new Error(mensaje);
  }
  return res.status === 204 ? null : res.json();
}

const real = {
  listarBandas: () => peticion("/bandas"),
  obtenerBanda: (id) => peticion(`/bandas/${id}`),
  crearBanda: (datos) => peticion("/bandas", { metodo: "POST", cuerpo: datos }),
  actualizarBanda: (id, datos) => peticion(`/bandas/${id}`, { metodo: "PUT", cuerpo: datos }),
  eliminarBanda: (id) => peticion(`/bandas/${id}`, { metodo: "DELETE" }),
  crearCancion: (bandaId, datos) =>
    peticion("/canciones", { metodo: "POST", cuerpo: { ...datos, banda_id: bandaId } }),
  actualizarCancion: (id, datos) => peticion(`/canciones/${id}`, { metodo: "PUT", cuerpo: datos }),
  eliminarCancion: (id) => peticion(`/canciones/${id}`, { metodo: "DELETE" }),
  register: (datos) => peticion("/auth/register", { metodo: "POST", cuerpo: datos }),
  login: (datos) => peticion("/auth/login", { metodo: "POST", cuerpo: datos }),
};

/* ============ MODO SIMULADO ============ */
// Nota sobre las url: las que tienen /track/ apuntan directo a la canción.
// Las que tienen /search/ abren la búsqueda de Spotify con la canción ya escrita
// (reemplázalas por el enlace directo cuando lo tengas: Spotify > Compartir > Copiar enlace).

const SEMILLA = [
  {
    id: 1, nombre: "Queen", genero: "Rock", pais: "Reino Unido", imagen: "https://logos-marcas.com/wp-content/uploads/2020/04/Queen-Logo.png",
    historia: "Queen se formó en Londres en 1970. Su sonido mezcla rock, ópera y armonías vocales muy trabajadas, y sus conciertos en vivo se volvieron legendarios.",
    canciones: [
      { id: 1, banda_id: 1, titulo: "Bohemian Rhapsody", anecdota: "La escribió Freddie Mercury y la grabaron en 1975 con muchísimas sobregrabaciones de voces para lograr la sección operística. Su disquera dudaba en lanzarla como sencillo por durar casi seis minutos, pero el DJ Kenny Everett la puso al aire unas 14 veces en un solo fin de semana y la presión del público terminó de convencerlos.", url: "https://open.spotify.com/search/Bohemian%20Rhapsody%20Queen" },
      { id: 2, banda_id: 1, titulo: "Another One Bites the Dust", anecdota: "La compuso el bajista John Deacon, inspirado en el sonido de la banda Chic. Michael Jackson, después de ver a Queen en un concierto en Los Ángeles en 1980, los animó a lanzarla como sencillo, y terminó siendo uno de sus mayores éxitos en Estados Unidos.", url: "https://open.spotify.com/search/Another%20One%20Bites%20the%20Dust%20Queen" },
    ],
  },
  {
    id: 2, nombre: "Soda Stereo", genero: "Rock", pais: "Argentina", imagen: "https://images.seeklogo.com/logo-png/12/1/soda-stereo-logo-png_seeklogo-128809.png",
    historia: "Banda argentina formada en Buenos Aires en 1982. Fue una de las más influyentes del rock en español en toda América Latina.",
    canciones: [
      { id: 3, banda_id: 2, titulo: "De música ligera", anecdota: "Cerati escribió primero el estribillo, inspirado en una caja de discos de sus padres titulada “Clásicos ligeros de todos los tiempos”. Se grabó en Miami para el álbum Canción animal (1990) y fue la canción con la que cerraron su concierto de despedida en el estadio River Plate, en 1997.", url: "https://open.spotify.com/search/De%20m%C3%BAsica%20ligera%20Soda%20Stereo" },
      { id: 4, banda_id: 2, titulo: "Persiana Americana", anecdota: "Pertenece al álbum Signos (1986). La letra la terminó Cerati junto a Jorge Daffunchio, con quien se reunió varias veces para completarla. Daffunchio contó después que el público la convirtió en un éxito que nadie imaginaba, ni siquiera el propio Cerati.", url: "https://open.spotify.com/search/Persiana%20Americana%20Soda%20Stereo" },
    ],
  },
  {
    id: 3, nombre: "Molotov", genero: "Rock/Rap", pais: "México", imagen: "https://images.sk-static.com/images/media/profile_images/artists/489691/huge_avatar",
    historia: "Banda mexicana formada a finales de los años 80. Su nombre viene del histórico restaurante Café Tacuba, en el centro de la Ciudad de México. Mezcla rock con ritmos tradicionales y mucha experimentación.",
    canciones: [
      { id: 5, banda_id: 3, titulo: "Gimme The Power", anecdota: "Es uno de los sencillos del álbum ¿Dónde jugarán las niñas? (1997), producido por Gustavo Santaolalla. Nació como una burla al gobierno mexicano, su corrupción y sus abusos de poder, mezclando rock y rap con letras sarcásticas. Con el tiempo se convirtió en un himno de protesta para muchos jóvenes mexicanos.", url: "https://open.spotify.com/search/Gimme%20the%20Power%20Molotov" },
    ],
  },
  {
    id: 4, nombre: "Black Sabbath", genero: "Rock", pais: "Reino Unido", imagen: "../../public/wp3206741-black-sabbath-wallpaper-logo.jpg",
    historia:"Black Sabbath fue una banda británica formada en Birmingham, Inglaterra, en 1968. La alineación clásica estaba integrada por Ozzy Osbourne (voz), Tony Iommi (guitarra), Geezer Butler (bajo y letras) y Bill Ward (batería). Se les considera los creadores del heavy metal.",
    canciones:[
      {
        id: 6, banda_id: 4, titulo: "Paranoid", anecdota: "Según cuenta la banda, la compusieron en muy poco tiempo (se habla de unos 20 minutos) casi al final de las sesiones de grabación, porque necesitaban una canción corta para completar el disco. Terminó siendo su mayor éxito y le dio nombre al álbum de 1970.",url:"https://open.spotify.com/intl-es/track/3Jnxngdff0lVu2rza1GVx6?si=f6237f9db48d49d5",imagen:"https://lashistoriasdelrock.com/wp-content/uploads/2024/05/Paranoid-black-sabbath-Los-mejores-albumes-debut-en-la-historia-del-metal.jpg"
      },{
        id: 7, banda_id: 4, titulo: "N.I.B", anecdota:"La canción presenta una historia desde la perspectiva de Lucifer, quien se enamora y busca conquistar a una persona. Una anécdota curiosa es que el título no significa originalmente “Nativity in Black”: según la versión de la banda, surgió del apodo que le dieron a la barba de Bill Ward, el baterista, porque parecía la punta de una pluma (nib en inglés).",url:"https://open.spotify.com/intl-es/track/3XclwoQxz4p6Dl7VUf90KW?si=b53d4a0e0da3470b",imagen:"https://i.discogs.com/1YN6epzOX3gKWYIPKiMyWO-r2iAomloOC0nORRkk0gk/rs:fit/g:sm/q:90/h:600/w:598/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE5NDAw/MTctMTYzMTc0MzQz/Mi05NjY4LmpwZWc.jpeg"
      }
    ]
  },
  {
    id: 5, nombre:"Motorhead", genero:"Rock", pais:"Reino Unido", imagen:"https://subsonic.com/img/cms/MOT%C3%96RHEAD/group-motorhead-subsonic.jpg",
    historia:"Motorhead fue una banda británica formada en Londres en 1975. Se les considera pioneros del thrash metal y el speed metal.",
    canciones: []
  },
  {
    id: 6, nombre: "Iron Maiden", genero: "Rock", pais: "Reino Unido", imagen: "https://rocksound.fr/wp-content/uploads/2025/05/Iron-Maiden-2-980x1089.webp",
    historia:"Iron Maiden es una banda británica formada en Londres en 1980. Se les considera uno de los grupos más influyentes del thrash metal y el speed metal.",
    canciones:[
      {
        id: 8, banda_id: 6, titulo: "The Trooper", anecdota: "Steve Harris la escribió inspirado en el poema “La carga de la brigada ligera” de Alfred Tennyson, que habla de una batalla de la guerra de Crimea en 1854. Es del álbum Piece of Mind (1983) y se volvió un clásico de sus conciertos.",url:"https://open.spotify.com/intl-es/track/4OROzZUy6gOWN4UGQVaZMF?si=7c7683725fc746c2",imagen:"https://i.discogs.com/1YN6epzOX3gKWYIPKiMyWO-r2iAomloOC0nORRkk0gk/rs:fit/g:sm/q:90/h:600/w:598/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE5NDAw/MTctMTYzMTc0MzQz/Mi05NjY4LmpwZWc.jpeg"
      },
      {
        id: 9, banda_id: 6, titulo: "Fear of the Dark", anecdota: "Steve Harris la escribió sobre el miedo a la oscuridad y a lo que uno imagina que hay en ella. Es del álbum del mismo nombre (1992) y se volvió tan emblemática en vivo que el público canta la melodía de la guitarra junto con la banda.",url:"https://open.spotify.com/intl-es/track/6p8eFfPw3nQkf37aT3AkmK?si=c8c567564c7c46a7",imagen:"https://i.discogs.com/1YN6epzOX3gKWYIPKiMyWO-r2iAomloOC0nORRkk0gk/rs:fit/g:sm/q:90/h:600/w:598/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE5NDAw/MTctMTYzMTc0MzQz/Mi05NjY4LmpwZWc.jpeg"
      }
    ]
  },
  {
    id: 7, nombre: "Metallica", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/1200x/9c/44/a5/9c44a51584645d6d2524288f40600cf0.jpg",
    historia:"Metallica es una banda estadounidense formada en Los Ángeles en 1981. Se les considera uno de los grupos más influyentes del thrash metal y el speed metal.",
    canciones:[
      {
        id: 10, banda_id: 7, titulo: "Enter Sandman", anecdota: "El riff lo creó Kirk Hammett y James Hetfield escribió la letra sobre pesadillas infantiles. Según se ha contado, la letra original era más oscura (sobre la muerte súbita de un bebé) y el productor Bob Rock les pidió cambiarla. Abre el Black Album (1991).",url:"https://open.spotify.com/search/Enter%20Sandman%20Metallica"
      }
    ]
  },
  {
    id: 8, nombre: "Nirvana", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/1d/62/42/1d6242ef4ebd231a93bec12d54eaea91.jpg",
    historia:"Nirvana fue una banda estadounidense formada en Aberdeen, Washington, en 1987. Se les considera uno de los grupos más influyentes del grunge y del rock alternativo.",
    canciones:[
      {
        id: 11, banda_id: 8, titulo: "Smells Like Teen Spirit", anecdota: "El título viene de un grafiti que la cantante Kathleen Hanna escribió en la pared de Kurt Cobain: “Kurt smells like Teen Spirit”. Cobain creyó que era un lema revolucionario, pero Teen Spirit era en realidad una marca de desodorante, algo que descubrió después. Abrió el álbum Nevermind (1991).",url:"https://open.spotify.com/intl-es/track/5ghIJDpPoe3CfHMGu71E6T?si=7c7683725fc746c2"
      }
    ]
  },{
    id:9, nombre: "Guns N' Roses", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/16/9c/25/169c25213e4c798bb6df1957225eea4a.jpg",
    historia:"Guns N' Roses es una banda estadounidense formada en Los Ángeles en 1985. Se les considera uno de los grupos más influyentes del hard rock y del heavy metal.",
    canciones:[
      {
        id: 12, banda_id: 9, titulo: "Sweet Child O' Mine", anecdota: "Nació cuando Slash tocaba de broma un riff medio circense en su Gibson Les Paul, y Axl Rose escribió la letra inspirado en su entonces novia Erin Everly. Slash ha dicho muchas veces que amaba el riff pero no la canción, por ser una balada tan movida. Salió en Appetite for Destruction (1987).",url:"https://open.spotify.com/track/7snQQk1zcKl8gZ92AnueZW"
      }
    ]
  },
  {
    id:10, nombre: "AC/DC", genero: "Rock", pais: "Australia", imagen: "https://i.pinimg.com/736x/99/17/e7/9917e746caf5ff2a6e711057b3e9d6ed.jpg",
    historia:"AC/DC es una banda australiana formada en Sídney en 1973. Se les considera uno de los grupos más influyentes del hard rock y del heavy metal.",
    canciones:[
      {
        id: 13, banda_id: 10, titulo: "Back In Black", anecdota: "Es un homenaje a Bon Scott, el cantante original, que murió en febrero de 1980. Con Brian Johnson como nuevo vocalista, la banda grabó el álbum con una portada completamente negra en señal de luto, y se convirtió en uno de los discos más vendidos de la historia.",url:"https://open.spotify.com/search/Back%20In%20Black%20AC%2FDC"
      }
    ]
  },
  {
    id:11, nombre: "Kiss", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/de/22/9a/de229a1817fec38d014faf0caa2a1e68.jpg",
    historia:"Kiss es una banda estadounidense formada en Nueva York en 1973. Se les considera uno de los grupos más influyentes del hard rock y del heavy metal.",
    canciones:[
      {
        id: 14, banda_id: 11, titulo: "Rock And Roll All Nite", anecdota: "La escribieron Paul Stanley y Gene Simmons como un himno de fiesta. La versión de estudio (1975, álbum Dressed to Kill) no fue un gran éxito; fue la grabación en vivo del álbum Alive! (1975) la que la convirtió en la canción insignia de la banda.",url:"https://open.spotify.com/search/Rock%20And%20Roll%20All%20Nite%20Kiss"
      }
    ]
  },{
    id:12, nombre: "The Goo Goo Dolls", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/04/7c/98/047c9818ebea902289df5d677ae983dd.jpg",
    historia:"The Goo Goo Dolls es una banda estadounidense formada en Buffalo, Nueva York, en 1986. Se les considera uno de los grupos más influyentes del rock alternativo y del pop rock.",
    canciones:[
      {
        id: 15, banda_id: 12, titulo: "Iris", anecdota: "John Rzeznik la escribió para la película City of Angels (1998) y después apareció en el álbum Dizzy Up the Girl. Un detalle curioso es que la letra nunca menciona la palabra “Iris”.",url:"https://open.spotify.com/search/Iris%20Goo%20Goo%20Dolls"
      }
    ]
  },{
    id:13, nombre: "Pantera", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/1b/c3/77/1bc377fd5d91c56bdeeca2ae24c0b151.jpg",
    historia:"Pantera fue una banda estadounidense formada en Arlington, Texas, en 1981. Se les considera uno de los grupos más influyentes del groove metal y del heavy metal.",
    canciones:[
      {
        id: 16, banda_id: 13, titulo: "Walk", anecdota: "El riff nació cuando Dimebag Darrell lo tocó en una prueba de sonido durante la gira de Cowboys from Hell, y a toda la banda le encantó. Phil Anselmo ha dicho que la letra es un mensaje para quienes los trataban con actitud de superioridad: que se llevaran esa actitud lejos. El riff está en un compás de 12/8, poco común en el metal.",url:"https://open.spotify.com/search/Walk%20Pantera"
      }
    ]
  },{
    id:14, nombre: "Slipknot", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/bc/11/55/bc11557f78db632e2e1a3b8612fa9892.jpg",
    historia:"Slipknot es una banda estadounidense formada en Des Moines, Iowa, en 1995. Se les considera uno de los grupos más influyentes del nu metal y del heavy metal.",
    canciones:[
      {
        id: 17, banda_id: 14, titulo: "Duality", anecdota: "El video se grabó en 2004 en una casa de West Des Moines, Iowa (la tierra de la banda), que estaba por ser remodelada. Cientos de fans entraron mientras la banda tocaba y terminaron destruyendo la casa, rompiendo ventanas y paredes. Fue tan caótico que muchos se preguntan cómo nadie salió gravemente herido.",url:"https://open.spotify.com/search/Duality%20Slipknot"
      }
    ]
  },{
    id:15, nombre: "Rammstein", genero: "Rock", pais: "Alemania", imagen: "https://i.pinimg.com/736x/ba/af/b6/baafb65f8ede23b6e024294941c78cad.jpg",
    historia:"Rammstein es una banda alemana formada en Berlín en 1994. Se les considera uno de los grupos más influyentes del industrial metal y del heavy metal.",
    canciones:[
      {
        id: 18, banda_id: 15, titulo: "Du Hast", anecdota: "El título es un juego de palabras en alemán: “du hast” (“tú tienes”) suena casi igual que “du hasst” (“tú odias”), y la letra juega con esa ambigüedad. Es del álbum Sehnsucht (1997).",url:"https://open.spotify.com/search/Du%20Hast%20Rammstein"
      }
    ]
  },{
    id:16, nombre: "System of a Down", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/a6/7a/73/a67a73f81d1f538f75a19889ac2d239c.jpg",
    historia:"System of a Down es una banda estadounidense formada en Los Ángeles en 1994. Se les considera uno de los grupos más influyentes del nu metal y del heavy metal.",
    canciones:[
      {
        id: 19, banda_id: 16, titulo: "Chop Suey!", anecdota: "Originalmente se llamaba “Self-Righteous Suicide”, pero la disquera pidió cambiar el título para evitar polémica y la banda terminó eligiendo “Chop Suey!”. Salió en el álbum Toxicity (2001).",url:"https://open.spotify.com/search/Chop%20Suey!%20System%20of%20a%20Down"
      }
    ]
  },{
    id:17, nombre: "Avenged Sevenfold", genero: "Rock", pais: "Estados Unidos", imagen: "https://i.pinimg.com/1200x/83/db/c6/83dbc69e2b655085855eca6007ddeed1.jpg",
    historia:"Avenged Sevenfold es una banda estadounidense formada en Huntington Beach, California, en 1999. Se les considera uno de los grupos más influyentes del metalcore y del heavy metal.",
    canciones:[
      {
        id: 20, banda_id: 17, titulo: "Hail to the King", anecdota: "Es la canción que da nombre al álbum de 2013, el primero después de la muerte del baterista The Rev en 2009. La banda ha dicho que quiso volver a un sonido de heavy metal clásico, inspirado en bandas como Metallica, Black Sabbath y Guns N’ Roses.",url:"https://open.spotify.com/search/Hail%20to%20the%20King%20Avenged%20Sevenfold"
      }
    ]
  },{
    id:18, nombre: "Ado", genero: "Rock", pais: "Japón", imagen: "https://i.pinimg.com/1200x/d4/5f/47/d45f47d4e4bbd31d338a11c3b8a55c24.jpg",
    historia:"Ado es una banda japonesa formada en Tokio en 2015. Se les considera uno de los grupos más influyentes del rock japonés y del heavy metal.",
    canciones:[
      {
        id: 21, banda_id: 18, titulo: "Usseewa", anecdota: "Fue el sencillo debut de Ado, lanzado en octubre de 2020 cuando era todavía una adolescente. La compuso el productor Syudou, y su letra expresa la frustración de los jóvenes con una sociedad que no los escucha; el título significa algo así como “cállate”.",url:"https://open.spotify.com/intl-es/track/61KYsWS25JXUO4fGb1138X?si=438a21972f6549ff"
      }
    ]
  },{
    id:19, nombre: "Babymetal", genero: "Rock", pais: "Japón", imagen: "https://i.pinimg.com/736x/59/89/a7/5989a762ccd4c33453a474a389de95c5.jpg",
    historia:"Babymetal es una banda japonesa formada en Tokio en 2010. Se les considera uno de los grupos más influyentes del metal japonés y del heavy metal.",
    canciones:[
      {
        id: 22, banda_id: 19, titulo: "Gimme Chocolate!!", anecdota: "La letra gira en torno a una chica que no puede resistirse al chocolate. Su video en YouTube fue uno de los que ayudaron a dar a conocer a Babymetal fuera de Japón, con su mezcla de metal pesado y estética de idol.",url:"https://open.spotify.com/search/Gimme%20Chocolate!!%20Babymetal"
      }
    ]
  },{
    id:20, nombre: "XXXTENTACION", genero: "Hip Hop", pais: "Estados Unidos", imagen: "https://i.pinimg.com/736x/2f/21/2b/2f212bddc853c8efd2a7fa158d68c0b2.jpg",
    historia:"XXXTENTACION fue un rapero estadounidense formado en Florida en 2013. Se le considera uno de los artistas más influyentes del hip hop y del trap.",
    canciones:[
      {
        id: 23, banda_id: 20, titulo: "SAD!", anecdota: "Salió en marzo de 2018, unos tres meses antes de la muerte de XXXTENTACION, en junio de ese año. Tras su fallecimiento, la canción llegó al número 1 del Billboard Hot 100.",url:"https://open.spotify.com/search/SAD!%20XXXTENTACION"
      }
    ]
  },
  {
    id:21, nombre: "Juice WRLD", genero: "Hip Hop", pais: "Estados Unidos", imagen: "https://i.pinimg.com/1200x/43/14/eb/4314ebce30e2bddc6d9876203d3c6559.jpg",
    historia:"Juice WRLD fue un rapero estadounidense formado en Chicago en 2015. Se le considera uno de los artistas más influyentes del hip hop y del trap.",
    canciones:[
      {
        id: 24, banda_id: 21, titulo: "Lucid Dreams", anecdota: "Usa un sample de “Shape of My Heart” de Sting, quien por eso aparece como coautor y, según se ha reportado, recibe cerca del 85% de las regalías. Fue el primer gran éxito de Juice WRLD, en 2018.",url:"https://open.spotify.com/search/Lucid%20Dreams%20Juice%20WRLD"
      }
    ]
  },{
    id:22, nombre: "Pure Nega", genero: "Reggae", pais: "Barcelona", imagen: "https://revistayoung.es/wp-content/uploads/2024/10/22WEB-fotograma-3-1024x576.jpg",
    historia:"Pure Negga creció en Canovelles, un escenario en el que pocos logran alcanzar las estrellas y muchos, se pierden por el camino o se dejan arrastrar. Con ese panorama, es justo poder dar voz a quien canta con humildad, con sinceridad, con orgullo de quien hoy se sube al escenario.",
    canciones:[
      {
        id: 25, banda_id: 22, titulo: "Mama", anecdota: "Mamá de Pure Negga, con la colaboración de este con Kion Studio, es un emotivo tributo a la figura materna, destacando su amor incondicional y el papel fundamental que juega en la vida del artista. La letra refleja una profunda gratitud hacia la madre, quien es descrita como un ángel guardián que brinda luz y protección en los momentos más oscuros.",url:"https://open.spotify.com/intl-es/track/5uPtHrMLXvOECmK2NEkoVd?si=793db19496954f5e",imagen:"../../public/Mamá.png"
      }
    ]
  }
];

const leer = (clave, defecto) => {
  try {
    const v = localStorage.getItem(clave);
    return v ? JSON.parse(v) : defecto;
  } catch {
    return defecto;
  }
};
const guardar = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {}
};

const getBandas = () => leer("mock_bandas", SEMILLA);
const setBandas = (b) => guardar("mock_bandas", b);
const siguienteId = (ids) => ids.reduce((m, x) => Math.max(m, x), 0) + 1;

const getUsuarios = () =>
  leer("mock_usuarios", [
    { id: 1, nombre: "Administrador", email: "admin@bandas.com", password: "admin123", rol: "admin" },
  ]);

const sesion = (u) => ({
  token: "token-simulado-" + u.id,
  usuario: { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol },
});

const mock = {
  async listarBandas() {
    return getBandas();
  },
  async obtenerBanda(id) {
    const b = getBandas().find((x) => x.id === Number(id));
    if (!b) throw new Error("No se encontró la banda.");
    return b;
  },
  async crearBanda(datos) {
    const lista = getBandas();
    const banda = { ...datos, id: siguienteId(lista.map((b) => b.id)), canciones: [] };
    setBandas([...lista, banda]);
    return banda;
  },
  async actualizarBanda(id, datos) {
    const lista = getBandas().map((b) =>
      b.id === Number(id) ? { ...b, ...datos, id: b.id, canciones: b.canciones } : b
    );
    setBandas(lista);
    return lista.find((b) => b.id === Number(id));
  },
  async eliminarBanda(id) {
    setBandas(getBandas().filter((b) => b.id !== Number(id)));
    return null;
  },
  async crearCancion(bandaId, datos) {
    const lista = getBandas();
    const id = siguienteId(lista.flatMap((b) => b.canciones.map((c) => c.id)));
    const cancion = { ...datos, id, banda_id: Number(bandaId) };
    setBandas(
      lista.map((b) => (b.id === Number(bandaId) ? { ...b, canciones: [...b.canciones, cancion] } : b))
    );
    return cancion;
  },
  async actualizarCancion(id, datos) {
    setBandas(
      getBandas().map((b) => ({
        ...b,
        canciones: b.canciones.map((c) => (c.id === Number(id) ? { ...c, ...datos, id: c.id } : c)),
      }))
    );
    return null;
  },
  async eliminarCancion(id) {
    setBandas(
      getBandas().map((b) => ({ ...b, canciones: b.canciones.filter((c) => c.id !== Number(id)) }))
    );
    return null;
  },
  async register({ nombre, email, password }) {
    const usuarios = getUsuarios();
    if (usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }
    const nuevo = { id: siguienteId(usuarios.map((u) => u.id)), nombre, email, password, rol: "usuario" };
    guardar("mock_usuarios", [...usuarios, nuevo]);
    return sesion(nuevo);
  },
  async login({ email, password }) {
    const u = getUsuarios().find(
      (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
    );
    if (!u) throw new Error("Correo o contraseña incorrectos.");
    return sesion(u);
  },
};

export const api = USE_MOCK ? mock : real;
export const userGuide = {
  title: {
    user: {
      fi: "Käyttöopas",
      en: "User Guide",
    },
    admin: {
      fi: "Ylläpitäjän opas",
      en: "Admin Guide",
    },
    faq: {
      fi: "Usein kysytyt kysymykset",
      en: "Frequently Asked Questions",
    },
  },
  sections: {
    getStarted: {
      title: {
        fi: "Näin aloitat",
        en: "How to Get Started",
      },
      content: {
        fi: [
          "Siirry <strong>Kirjaudu</strong> -sivulle",
          "Voit rekisteröityä tai luoda tilisi Google-sähköpostilla.",
          "Kirjautumisen jälkeen siirry <strong>Varastonimikkeet</strong> -osioon.",
          "Käytä suodattimia tarpeidesi mukaan:",
          "Etsi nimikkeitä seuraavilla perusteilla:",
        ],
        en: [
          "Go to the <strong>Login</strong> page",
          "You can register or create your account using Google email.",
          "After logging in, navigate to the <strong>Storage Items</strong> section.",
          "Use filters based on your needs:",
          "Search items by:",
        ],
      },
      filters: {
        fi: ["Arvosana", "Tagit"],
        en: ["Rating", "Tags"],
      },
      search: {
        fi: ["Nimi", "Kategoria", "Tagit", "Kuvaus"],
        en: ["Name", "Category", "Tags", "Description"],
      },
      dateSelection: {
        fi: "Valitse <strong>Alkamispäivä</strong> ja <strong>Loppumispäivä</strong> tarkistaaksesi saatavuuden.",
        en: "Select the <strong>Start Date</strong> and <strong>End Date</strong> to check availability.",
      },
    },
    howToBook: {
      title: {
        fi: "Kuinka tilata",
        en: "How to Book",
      },
      content: {
        fi: [
          "Selaa varastovaihtoehtojamme, valitse tuotteet ja lisää ne ostoskoriisi.",
          "<strong>Varausvahvistus:</strong> Vahvistus sisältyy laskuun.",
          "<strong>Tuotteiden nouto:</strong> Tiimimme opastaa sinua noutomenettelyissä.",
          "<strong>Tuki:</strong> Kysymyksiin löydät apua 'Ohje'-osiosta.",
        ],
        en: [
          "Browse our storage options, select the items, and add them to your cart.",
          "<strong>Booking Confirmation:</strong> Your confirmation will be included in the invoice.",
          "<strong>Item Pick-Up:</strong> Our team will guide you on collection procedures.",
          "<strong>Support:</strong> For questions, visit the 'Help' section.",
        ],
      },
    },
    dashboard: {
      title: {
        fi: "Hallintataulun yleiskatsaus",
        en: "Dashboard Overview",
      },
      content: {
        fi: "Napsauta <strong>Ylläpitäjän paneelia</strong> hallitaksesi:",
        en: "Click on <strong>Admin Panel</strong> to manage:",
      },
      items: {
        fi: ["Tilaukset", "Tuotteet", "Tagit", "Käyttäjät", "Asetukset"],
        en: ["Bookings", "Items", "Tags", "Users", "Settings"],
      },
    },
    usersTeams: {
      title: {
        fi: "Käyttäjät ja tiimit",
        en: "Users & Teams",
      },
      users: {
        fi: "<strong>Käyttäjät:</strong> Lisää, muokkaa tai poista käyttäjiä.",
        en: "<strong>Users:</strong> Add, edit, or delete users.",
      },
      teams: {
        fi: "<strong>Tiimit:</strong> Hallinnoi tiimin jäseniä ja määritä rooleja.",
        en: "<strong>Teams:</strong> Manage team members and assign roles.",
      },
      actions: {
        fi: [
          "Lisää/Muokkaa/Poista jäseniä",
          "Määritä rooleja (Ylläpitäjä tai Pääylläpitäjä)",
          "Aseta nimi, sähköposti, puhelin ja rooli",
        ],
        en: [
          "Add/Edit/Delete members",
          "Assign roles (Admin or SuperAdmin)",
          "Set Name, Email, Phone, and Role",
        ],
      },
    },
    itemManagement: {
      title: {
        fi: "Tuotteiden ja tagien hallinta",
        en: "Item & Tag Management",
      },
      items: {
        fi: "<strong>Tuotteet:</strong> Lisää, muokkaa, piilota tai poista tuotteita.",
        en: "<strong>Items:</strong> Add, edit, hide, or remove items.",
      },
      details: {
        fi: "Sisällytä tiedot kuten nimi (EN/FI), sijainti, määrä, saatavuus ja tagit.",
        en: "Include details such as name (EN/FIN), location, quantity, availability, and tags.",
      },
      tags: {
        fi: "<strong>Tagit:</strong> Luo/muokkaa/poista tageja sekä englanniksi että suomeksi.",
        en: "<strong>Tags:</strong> Create/edit/delete tags in both English and Finnish.",
      },
    },
    bookings: {
      title: {
        fi: "Tilaukset",
        en: "Bookings",
      },
      actions: {
        fi: [
          "Näytä kaikki asiakastilaukset",
          "Päivitä tilausluettelo",
          "Tarkastele tai poista tiettyjä tilauksia",
        ],
        en: [
          "View all customer bookings",
          "Refresh the booking list",
          "View or delete specific bookings",
        ],
      },
    },
  },
  faq: {
    q1: {
      question: {
        fi: "Toimitatteko LARP-tapahtumapaikoille?",
        en: "Do you deliver to LARP event locations?",
      },
      answer: {
        fi: "Kyllä! Tarjoamme toimitus- ja noutomahdollisuuksia useimpiin suuriin LARP-tapahtumiin Suomessa.",
        en: "Yes! We offer delivery and pickup options for most major LARP events in Finland.",
      },
    },
    q2: {
      question: {
        fi: "Voinko varata tuotteita etukäteen?",
        en: "Can I reserve items in advance?",
      },
      answer: {
        fi: "Ehdottomasti. Suosittelemme varaamaan vähintään 2 viikkoa ennen tapahtumaasi varmistaaksesi saatavuuden.",
        en: "Absolutely. We recommend booking at least 2 weeks before your event to ensure availability.",
      },
    },
    q3: {
      question: {
        fi: "Mitä tapahtuu, jos jokin rikkoutuu?",
        en: "What happens if something breaks?",
      },
      answer: {
        fi: "Vahinkoja sattuu. Arvioimme vahingot tapauskohtaisesti. Jonkin verran kulumista odotetaan, tahallinen vahingoittaminen voi aiheuttaa maksuja.",
        en: "Accidents happen. We assess damage case by case. Some wear is expected, malicious damage may incur fees.",
      },
    },
    q4: {
      question: {
        fi: "Jokin muu kysymys?",
        en: "Some other question?",
      },
      answer: {
        fi: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magni placeat sed dolorem impedit voluptates iure possimus odit quam illum omnis ipsum, earum, reiciendis blanditiis itaque esse quidem porro vero.",
        en: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magni placeat sed dolorem impedit voluptates iure possimus odit quam illum omnis ipsum, earum, reiciendis blanditiis itaque esse quidem porro vero.",
      },
    },
  },
};

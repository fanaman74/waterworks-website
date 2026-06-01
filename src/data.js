/* WaterWorks — content model. Strings are {en, fr, nl}. Helper t() picks the active language. */
export const WW = {
  IMG: {
    bathroom: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/10/Website-2-e1445186136801.jpg",
    work: "https://waterworksbe.net/WordPress3/wp-content/uploads/2019/08/IMG_2375.jpg",
    bike: "https://waterworksbe.net/WordPress3/wp-content/uploads/2019/08/website_bike_pic.jpg",
    s1: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020753-1.jpg",
    s2: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020742.jpg",
    s3: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030189.jpg",
    s4: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030186.jpg",
  },

  nav: [
    { id: "home", label: { en: "Home", fr: "Accueil", nl: "Home" } },
    { id: "services", label: { en: "Services", fr: "Services", nl: "Diensten" } },
    { id: "work", label: { en: "Previous work", fr: "Réalisations", nl: "Realisaties" } },
    { id: "press", label: { en: "Press", fr: "Presse", nl: "Pers" } },
    { id: "training", label: { en: "Training", fr: "Formations", nl: "Opleidingen" } },
    { id: "links", label: { en: "Useful links", fr: "Liens utiles", nl: "Nuttige links" } },
    { id: "contact", label: { en: "Contact", fr: "Contact", nl: "Contact" } },
  ],

  ui: {
    quote: { en: "Request a quote", fr: "Demander un devis", nl: "Offerte aanvragen" },
    quoteShort: { en: "Get a free quote", fr: "Devis gratuit", nl: "Gratis offerte" },
    call: { en: "Call", fr: "Appeler", nl: "Bellen" },
    callNow: { en: "Call now", fr: "Appeler", nl: "Bel nu" },
    emergency: { en: "In case of emergency, call", fr: "En cas d'urgence, appelez", nl: "Bel bij nood" },
    since: { en: "Working in Brussels since 2001", fr: "À Bruxelles depuis 2001", nl: "Actief in Brussel sinds 2001" },
    phone: "0478 / 205.025",
    email: "wayne@waterworksbe.net",
    viewAll: { en: "View all services", fr: "Tous les services", nl: "Alle diensten" },
    viewWork: { en: "See previous work", fr: "Voir les réalisations", nl: "Bekijk realisaties" },
    learnMore: { en: "Learn more", fr: "En savoir plus", nl: "Meer info" },
    backTo: { en: "Back to previous work", fr: "Retour aux réalisations", nl: "Terug naar realisaties" },
    langName: { en: "EN", fr: "FR", nl: "NL" },
  },

  home: {
    eyebrow: { en: "English plumber · Brussels · since 2001", fr: "Plombier anglais · Bruxelles · depuis 2001", nl: "Engelse loodgieter · Brussel · sinds 2001" },
    headline: {
      en: "Plumbing & heating, done the way I'd want it done at home.",
      fr: "Plomberie & chauffage, faits comme je les voudrais chez moi.",
      nl: "Loodgieterswerk & verwarming, zoals ik het thuis zou willen.",
    },
    sub: {
      en: "I'm Wayne Pettit — a fully registered plumbing and heating engineer. Punctual, clear on price, and I'll cycle over to quote your job by e-bike.",
      fr: "Je suis Wayne Pettit — ingénieur plomberie et chauffage agréé. Ponctuel, transparent sur les prix, et je viens établir votre devis à vélo électrique.",
      nl: "Ik ben Wayne Pettit — een erkend loodgieter en verwarmingsingenieur. Stipt, duidelijk over de prijs, en ik kom met de e-bike langs voor uw offerte.",
    },
    stats: [
      { n: "2001", l: { en: "In Brussels since", fr: "À Bruxelles depuis", nl: "In Brussel sinds" } },
      { n: "6%", l: { en: "VAT on older homes", fr: "TVA sur logements anciens", nl: "BTW op oudere woningen" } },
      { n: "0", l: { en: "Emissions to your quote", fr: "Émissions pour votre devis", nl: "Uitstoot voor uw offerte" } },
    ],
    introTitle: { en: "Let me introduce myself", fr: "Permettez-moi de me présenter", nl: "Even voorstellen" },
    intro: {
      en: "I was an established self-employed plumbing and heating engineer in the UK, registered with C.O.R.G.I. (the Council of Registered Gas Installers) and the Institute of Plumbers. I moved to Brussels when my wife took a job here, and we loved the idea of living centrally in Europe. I'm now fully registered with the Belgian authorities for plumbing and gas work.",
      fr: "J'étais plombier-chauffagiste indépendant établi au Royaume-Uni, agréé par le C.O.R.G.I. (Council of Registered Gas Installers) et l'Institute of Plumbers. J'ai déménagé à Bruxelles lorsque mon épouse y a trouvé un emploi, séduits par l'idée de vivre au cœur de l'Europe. Je suis aujourd'hui pleinement agréé par les autorités belges pour la plomberie et le gaz.",
      nl: "Ik was een gevestigde zelfstandige loodgieter en verwarmingsingenieur in het VK, geregistreerd bij C.O.R.G.I. (Council of Registered Gas Installers) en het Institute of Plumbers. Ik verhuisde naar Brussel toen mijn vrouw hier werk vond — we hielden van het idee om centraal in Europa te wonen. Ik ben nu volledig erkend door de Belgische autoriteiten voor loodgieters- en gaswerk.",
    },
    promiseTitle: { en: "What you can expect from me", fr: "Ce que vous pouvez attendre de moi", nl: "Wat u van mij mag verwachten" },
    promises: [
      {
        t: { en: "Punctuality", fr: "Ponctualité", nl: "Stiptheid" },
        d: { en: "I turn up when I say I will. Your time matters as much as mine.", fr: "J'arrive quand je le dis. Votre temps compte autant que le mien.", nl: "Ik kom op het afgesproken moment. Uw tijd telt evenveel als de mijne." },
      },
      {
        t: { en: "Clear pricing", fr: "Prix transparents", nl: "Duidelijke prijzen" },
        d: { en: "A clear pricing policy with no surprises — you know the cost before I start.", fr: "Une politique de prix claire, sans surprises — vous connaissez le coût avant que je commence.", nl: "Een dynamique prijsbeleid zonder verrassingen — u kent de prijs vóór ik begin." },
      },
      {
        t: { en: "Service I'd want myself", fr: "Le service que je voudrais recevoir", nl: "Service zoals ik die zelf wil" },
        d: { en: "I give the kind of customer service I'd like to receive — that's the whole point.", fr: "J'offre le service client que j'aimerais recevoir — c'est tout l'enjeu.", nl: "Ik geef de klantenservice die ik zelf zou willen krijgen — daar draait het om." },
      },
    ],
    ecoTitle: { en: "Doing my bit for the environment", fr: "Faire ma part pour l'environnement", nl: "Mijn steentje bijdragen voor het milieu" },
    ecoLead: {
      en: "Where possible, I come to quote your job by e-bike. Fewer vehicles on the road means fewer emissions — and it goes hand in hand with the kind of installations I love to do.",
      fr: "Quand c'est possible, je viens établir votre devis à vélo électrique. Moins de véhicules sur la route, c'est moins d'émissions — et cela va de pair avec le type d'installations que j'aime réaliser.",
      nl: "Waar mogelijk kom ik met de e-bike langs voor uw offerte. Minder voertuigen op de weg betekent minder uitstoot — en dat past bij het soort installaties dat ik graag uitvoer.",
    },
    ecoPoints: [
      { en: "Rainwater recuperation systems", fr: "Systèmes de récupération d'eau de pluie", nl: "Regenwaterrecuperatiesystemen" },
      { en: "High-efficiency gas boilers with low-energy radiators", fr: "Chaudières gaz à haut rendement et radiateurs basse consommation", nl: "Hoogrendementsketels met laagenergieradiatoren" },
      { en: "Pre-insulated pipework", fr: "Tuyauterie pré-isolée", nl: "Voorgeïsoleerde leidingen" },
      { en: "Old materials sent for professional recycling", fr: "Anciens matériaux envoyés au recyclage professionnel", nl: "Oude materialen naar professionele recyclage" },
      { en: "Water softening that uses far less water to regenerate", fr: "Adoucisseurs utilisant beaucoup moins d'eau à la régénération", nl: "Waterontharders die veel minder water gebruiken bij regeneratie" },
    ],
    ctaTitle: { en: "Got a job in mind?", fr: "Un projet en tête ?", nl: "Een klus in gedachten?" },
    ctaSub: { en: "Free quotes and advice on tap. Tell me what you need and I'll come and take a look.", fr: "Devis et conseils gratuits. Dites-moi ce qu'il vous faut et je viens y jeter un œil.", nl: "Gratis offertes en advies. Vertel me wat u nodig heeft en ik kom langs." },
  },

  services: [
    { icon: "camera", t: { en: "Drainage inspection camera", fr: "Caméra d'inspection des canalisations", nl: "Camera-inspectie van afvoeren" }, d: { en: "Inspection for blockages and cracks, with recordable images for insurance claims.", fr: "Inspection des bouchons et fissures, avec images enregistrables pour vos assurances.", nl: "Inspectie op verstoppingen en scheuren, met opneembare beelden voor verzekeringsdossiers." } },
    { icon: "quote", t: { en: "Free quotes", fr: "Devis gratuits", nl: "Gratis offertes" }, d: { en: "Free quotes and advice on tap — no obligation, ever.", fr: "Devis et conseils gratuits — sans aucun engagement.", nl: "Gratis offertes en advies — altijd vrijblijvend." } },
    { icon: "bath", t: { en: "Bathroom installations", fr: "Installation de salles de bain", nl: "Badkamerinstallaties" }, d: { en: "Help with the design and purchase of your new bathroom, start to finish.", fr: "Aide à la conception et à l'achat de votre nouvelle salle de bain, de A à Z.", nl: "Hulp bij het ontwerp en de aankoop van uw nieuwe badkamer, van begin tot eind." } },
    { icon: "heat", t: { en: "Gas central heating", fr: "Chauffage central au gaz", nl: "Gascentrale verwarming" }, d: { en: "Design and installation of complete central heating systems.", fr: "Conception et installation de systèmes de chauffage central complets.", nl: "Ontwerp en installatie van volledige centrale verwarmingssystemen." } },
    { icon: "tax", t: { en: "VAT reduction", fr: "Réduction de TVA", nl: "BTW-verlaging" }, d: { en: "For properties over five years old, I can apply 6% VAT on products and labour instead of 21%.", fr: "Pour les biens de plus de cinq ans, j'applique 6 % de TVA sur produits et main-d'œuvre au lieu de 21 %.", nl: "Voor woningen ouder dan vijf jaar pas ik 6 % BTW toe op producten en arbeid in plaats van 21 %." } },
    { icon: "boiler", t: { en: "Boiler service", fr: "Entretien de chaudière", nl: "Ketelonderhoud" }, d: { en: "I service every boiler I install, and send a 12-month reminder so you don't have to remember.", fr: "J'entretiens chaque chaudière que j'installe et j'envoie un rappel à 12 mois, pour vous éviter d'y penser.", nl: "Ik onderhoud elke ketel die ik plaats en stuur een herinnering na 12 maanden, zodat u er niet aan hoeft te denken." } },
    { icon: "water", t: { en: "Hard water solutions", fr: "Solutions pour eau dure", nl: "Oplossingen voor hard water" }, d: { en: "Considering a softener? I take a water sample to a laboratory so you get exactly the right system for your home.", fr: "Vous envisagez un adoucisseur ? Je fais analyser un échantillon d'eau en laboratoire pour le système parfaitement adapté à votre logement.", nl: "Denkt u aan een ontharder? Ik laat een waterstaal analyseren in een labo, zodat u precies het juiste systeem krijgt." } },
    { icon: "team", t: { en: "Related trades", fr: "Métiers associés", nl: "Aanverwante vakmensen" }, d: { en: "A trusted team of plasterers, builders, electricians and carpenters for larger renovations.", fr: "Une équipe de confiance de plafonneurs, maçons, électriciens et menuisiers pour les grandes rénovations.", nl: "Een vertrouwd team van plafonneerders, bouwers, elektriciens en schrijnwerkers voor grotere renovaties." } },
  ],

  servicesIntro: {
    en: "I carry out general plumbing and heating work across Brussels and the surrounding areas — anything from a small repair to a full renovation.",
    fr: "Je réalise tous travaux de plomberie et de chauffage à Bruxelles et alentours — de la petite réparation à la rénovation complète.",
    nl: "Ik voer algemeen loodgieters- en verwarmingswerk uit in Brussel en omstreken — van kleine herstelling tot volledige renovatie.",
  },

  projects: [
    {
      id: "roof", img: "https://waterworksbe.net/WordPress3/wp-content/uploads/2019/08/IMG_2375.jpg", gallery: ["https://waterworksbe.net/WordPress3/wp-content/uploads/2019/08/IMG_2375.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020742.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030189.jpg"],
      t: { en: "Difficult roof access", fr: "Accès toiture difficile", nl: "Moeilijke dakbereikbaarheid" },
      blurb: { en: "Replacing pipework and flashing on a steep Brussels roof where standard access wasn't an option.", fr: "Remplacement de tuyauterie et de solins sur une toiture bruxelloise pentue, sans accès standard possible.", nl: "Vervanging van leidingen en loodslabben op een steil Brussels dak waar standaardtoegang geen optie was." },
      body: { en: "Some of the best jobs are the ones nobody else wants to take on. This one called for safe working at height and careful planning so the roof was watertight again before the next downpour.", fr: "Certains des meilleurs chantiers sont ceux que personne d'autre ne veut prendre. Celui-ci exigeait un travail sécurisé en hauteur et une planification soignée pour que la toiture soit de nouveau étanche avant la prochaine averse.", nl: "Sommige van de beste klussen zijn die niemand anders wil aannemen. Deze vroeg veilig werken op hoogte en zorgvuldige planning, zodat het dak weer waterdicht was vóór de volgende regenbui." },
    },
    {
      id: "ufh", img: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030189.jpg", gallery: ["https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030189.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030186.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020753-1.jpg"],
      t: { en: "Under-floor heating", fr: "Chauffage par le sol", nl: "Vloerverwarming" },
      blurb: { en: "A warm, even, invisible heat source installed beneath a renovated living floor.", fr: "Une source de chaleur douce, homogène et invisible installée sous un sol de séjour rénové.", nl: "Een warme, gelijkmatige en onzichtbare warmtebron onder een gerenoveerde woonvloer." },
      body: { en: "Under-floor heating pairs beautifully with high-efficiency boilers and low-energy radiators — it runs at lower temperatures, so it's gentle on both your feet and your energy bills.", fr: "Le chauffage par le sol se marie parfaitement avec les chaudières à haut rendement et les radiateurs basse consommation — il fonctionne à basse température, agréable pour vos pieds comme pour vos factures.", nl: "Vloerverwarming gaat prachtig samen met hoogrendementsketels en laagenergieradiatoren — ze werkt op lagere temperaturen, zacht voor uw voeten én uw energiefactuur." },
    },
    {
      id: "bwt", img: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020753-1.jpg", gallery: ["https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020753-1.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020742.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030186.jpg"],
      t: { en: "Water softening (BWT)", fr: "Adoucissement de l'eau (BWT)", nl: "Waterontharding (BWT)" },
      blurb: { en: "Latest-technology BWT softening that uses far less water during regeneration.", fr: "Adoucisseur BWT dernière technologie, consommant beaucoup moins d'eau à la régénération.", nl: "BWT-ontharding met de nieuwste technologie die veel minder water verbruikt bij regeneratie." },
      body: { en: "Brussels water is hard. Before recommending a softener I send a sample of your water to a laboratory, so the system is sized exactly for your home — no guesswork, no over-spending.", fr: "L'eau de Bruxelles est dure. Avant de recommander un adoucisseur, j'envoie un échantillon de votre eau en laboratoire pour dimensionner le système exactement à votre logement — sans approximation ni dépense inutile.", nl: "Brussels water is hard. Voor ik een ontharder aanraad, stuur ik een waterstaal naar een labo, zodat het systeem precies op uw woning is afgestemd — geen giswerk, geen overbodige kosten." },
    },
    {
      id: "bathroom", img: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/10/Website-2-e1445186136801.jpg", gallery: ["https://waterworksbe.net/WordPress3/wp-content/uploads/2015/10/Website-2-e1445186136801.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020742.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030189.jpg"],
      t: { en: "Bathroom transformation", fr: "Transformation de salle de bain", nl: "Badkamertransformatie" },
      blurb: { en: "A full bathroom rethink — from first sketch and product choice to the final seal.", fr: "Une salle de bain entièrement repensée — du premier croquis au dernier joint.", nl: "Een volledig herdachte badkamer — van eerste schets tot de laatste voeg." },
      body: { en: "I'll help with the design and the purchase of everything that goes in, then install it properly. The reward is a room that feels brand new and works flawlessly for years.", fr: "Je vous aide à concevoir et à acheter tout ce qui s'y trouve, puis j'installe le tout dans les règles. À la clé : une pièce comme neuve qui fonctionne parfaitement pendant des années.", nl: "Ik help met het ontwerp en de aankoop van alles wat erin komt, en plaats het vervolgens vakkundig. Het resultaat: een ruimte die splinternieuw aanvoelt en jarenlang feilloos werkt." },
    },
    {
      id: "boiler", img: "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030186.jpg", gallery: ["https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030186.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1030189.jpg", "https://waterworksbe.net/WordPress3/wp-content/uploads/2015/07/P1020753-1.jpg"],
      t: { en: "Boiler replacement", fr: "Remplacement de chaudière", nl: "Ketelvervanging" },
      blurb: { en: "Swapping a tired boiler for a high-efficiency unit — warmer home, smaller bills.", fr: "Remplacement d'une chaudière fatiguée par un modèle à haut rendement — plus de confort, moins de factures.", nl: "Een versleten ketel vervangen door een hoogrendementstoestel — een warmere woning, lagere facturen." },
      body: { en: "A modern condensing boiler can dramatically cut your gas use. I handle the removal, the install and the commissioning, and recycle the old unit professionally.", fr: "Une chaudière à condensation moderne peut réduire fortement votre consommation de gaz. Je m'occupe de la dépose, de l'installation et de la mise en service, et je recycle l'ancien appareil de façon professionnelle.", nl: "Een moderne condensatieketel kan uw gasverbruik fors verlagen. Ik verzorg de demontage, de installatie en de inbedrijfstelling, en recycleer het oude toestel professioneel." },
    },
  ],

  press: {
    title: { en: "Press", fr: "Presse", nl: "Pers" },
    lead: { en: "A little coverage along the way — it's always nice when the work gets noticed.", fr: "Quelques apparitions dans la presse — c'est toujours agréable de voir le travail remarqué.", nl: "Af en toe wat aandacht in de pers — fijn als het werk wordt opgemerkt." },
    items: [
      { outlet: "The Bulletin", date: "Brussels", t: { en: "The English plumber cycling between Brussels' jobs", fr: "Le plombier anglais qui sillonne Bruxelles à vélo", nl: "De Engelse loodgieter die op de fiets door Brussel rijdt" }, d: { en: "An interview about building a trusted plumbing business in Brussels' international community — and why the e-bike makes sense.", fr: "Un entretien sur la création d'une entreprise de plomberie de confiance dans la communauté internationale de Bruxelles — et pourquoi le vélo électrique a du sens.", nl: "Een interview over het opbouwen van een betrouwbaar loodgietersbedrijf in de internationale gemeenschap van Brussel — en waarom de e-bike logisch is." } },
    ],
  },

  training: {
    title: { en: "Training & updates", fr: "Formations & mises à jour", nl: "Opleidingen & updates" },
    lead: { en: "Standards move on, and so do I. I keep my registrations current and my skills sharp so your installation is always up to code.", fr: "Les normes évoluent, et moi aussi. Je maintiens mes agréments à jour et mes compétences affûtées pour que votre installation soit toujours conforme.", nl: "Normen veranderen, en ik verander mee. Ik houd mijn erkenningen actueel en mijn vaardigheden scherp, zodat uw installatie altijd in orde is." },
    items: [
      { t: { en: "Belgian gas registration", fr: "Agrément gaz belge", nl: "Belgische gaserkenning" }, d: { en: "Fully registered with the Belgian authorities for plumbing and gas work.", fr: "Pleinement agréé par les autorités belges pour la plomberie et le gaz.", nl: "Volledig erkend door de Belgische autoriteiten voor loodgieters- en gaswerk." } },
      { t: { en: "C.O.R.G.I. & Institute of Plumbers", fr: "C.O.R.G.I. & Institute of Plumbers", nl: "C.O.R.G.I. & Institute of Plumbers" }, d: { en: "Background as a UK-registered gas installer and member of the Institute of Plumbers.", fr: "Parcours d'installateur gaz agréé au Royaume-Uni et membre de l'Institute of Plumbers.", nl: "Achtergrond als in het VK erkend gasinstallateur en lid van het Institute of Plumbers." } },
      { t: { en: "BWT water-softening certified", fr: "Certifié adoucisseurs BWT", nl: "BWT-ontharding gecertificeerd" }, d: { en: "Trained on the latest BWT water-softening technology and low-water regeneration.", fr: "Formé aux dernières technologies d'adoucissement BWT et à la régénération économe en eau.", nl: "Opgeleid in de nieuwste BWT-onthardingstechnologie en waterzuinige regeneratie." } },
      { t: { en: "High-efficiency heating", fr: "Chauffage haut rendement", nl: "Hoogrendementsverwarming" }, d: { en: "Ongoing updates on condensing boilers, low-energy radiators and renewable-ready systems.", fr: "Mises à jour régulières sur les chaudières à condensation, radiateurs basse consommation et systèmes prêts pour le renouvelable.", nl: "Voortdurende bijscholing over condensatieketels, laagenergieradiatoren en hernieuwbaar-klare systemen." } },
    ],
  },

  links: {
    title: { en: "Useful links", fr: "Liens utiles", nl: "Nuttige links" },
    lead: { en: "A few resources I trust — for grants, water quality and getting the most from your installation.", fr: "Quelques ressources de confiance — primes, qualité de l'eau et optimisation de votre installation.", nl: "Een paar bronnen die ik vertrouw — premies, waterkwaliteit en het beste uit uw installatie halen." },
    items: [
      { t: "Bruxelles Environnement", d: { en: "Energy grants and environmental advice for Brussels homes.", fr: "Primes énergie et conseils environnementaux pour les logements bruxellois.", nl: "Energiepremies en milieuadvies voor Brusselse woningen." } },
      { t: "VIVAQUA", d: { en: "Your Brussels water supplier — quality, hardness and connections.", fr: "Votre distributeur d'eau bruxellois — qualité, dureté et raccordements.", nl: "Uw Brusselse waterleverancier — kwaliteit, hardheid en aansluitingen." } },
      { t: "BWT Belgium", d: { en: "Water softening and treatment technology I install.", fr: "Technologie d'adoucissement et de traitement de l'eau que j'installe.", nl: "Waterontharding en -behandelingstechnologie die ik installeer." } },
      { t: "Institute of Plumbers", d: { en: "Professional standards body from my UK background.", fr: "Organisme de normes professionnelles de mon parcours britannique.", nl: "Beroepsorganisatie voor normen uit mijn Britse achtergrond." } },
    ],
  },

  contact: {
    title: { en: "Let's talk about your project", fr: "Parlons de votre projet", nl: "Laten we over uw project praten" },
    lead: { en: "Tell me what you need and I'll get back to you quickly. For anything urgent, call the emergency line.", fr: "Dites-moi ce qu'il vous faut et je vous réponds rapidement. Pour toute urgence, appelez la ligne d'urgence.", nl: "Vertel me wat u nodig heeft en ik kom snel bij u terug. Voor dringende zaken belt u de noodlijn." },
    fields: {
      name: { en: "Your name", fr: "Votre nom", nl: "Uw naam" },
      email: { en: "Email", fr: "E-mail", nl: "E-mail" },
      phone: { en: "Phone", fr: "Téléphone", nl: "Telefoon" },
      address: { en: "Address / area in Brussels", fr: "Adresse / quartier à Bruxelles", nl: "Adres / buurt in Brussel" },
      type: { en: "What do you need?", fr: "De quoi avez-vous besoin ?", nl: "Wat heeft u nodig?" },
      message: { en: "Tell me a bit more", fr: "Donnez-moi quelques détails", nl: "Vertel me wat mais" },
      send: { en: "Send my request", fr: "Envoyer ma demande", nl: "Mijn aanvraag versturen" },
    },
    types: [
      { en: "Free quote", fr: "Devis gratuit", nl: "Gratis offerte" },
      { en: "Boiler / heating", fr: "Chaudière / chauffage", nl: "Ketel / verwarming" },
      { en: "Bathroom", fr: "Salle de bain", nl: "Badkamer" },
      { en: "Water softening", fr: "Adoucisseur", nl: "Waterontharder" },
      { en: "Repair", fr: "Réparation", nl: "Herstelling" },
      { en: "Something else", fr: "Autre chose", nl: "Iets anders" },
    ],
    success: { en: "Thanks — your request is on its way. I'll be in touch shortly.", fr: "Merci — votre demande est partie. Je vous recontacte très vite.", nl: "Bedankt — uw aanvraag is verzonden. Ik neem snel contact op." },
    successNote: { en: "This is a prototype, so nothing was actually sent.", fr: "Ceci est un prototype : rien n'a réellement été envoyé.", nl: "Dit is een prototype: er is niets echt verzonden." },
  },
};

export function t(obj, lang) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || "";
}

export type CompanyIndustry = 'eshop' | 'telco' | 'b2b';
export type EmailIntent = 'query' | 'complaint' | 'escalation';

const FIRST_NAMES_MALE = ['Jan', 'Petr', 'Tomáš', 'Lukáš', 'Jiří', 'Martin', 'Josef', 'Pavel', 'Jaroslav', 'Michal'];
const FIRST_NAMES_FEMALE = ['Jana', 'Eva', 'Hana', 'Anna', 'Lenka', 'Kateřina', 'Lucie', 'Petra', 'Alena', 'Michaela'];
const LAST_NAMES_MALE = ['Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec'];
const LAST_NAMES_FEMALE = ['Nováková', 'Svobodová', 'Novotná', 'Dvořáková', 'Černá', 'Procházková', 'Kučerová', 'Veselá', 'Horáková', 'Němcová'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
  const isMale = Math.random() > 0.5;
  if (isMale) {
    return `${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES_MALE)}`;
  } else {
    return `${randomItem(FIRST_NAMES_FEMALE)} ${randomItem(LAST_NAMES_FEMALE)}`;
  }
}

function generateEmail(name: string) {
  const cleanName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(' ', '.');
  const domains = ['gmail.com', 'seznam.cz', 'email.cz', 'post.cz', 'centrum.cz'];
  return `${cleanName}@${randomItem(domains)}`;
}

export function generateTemplate(industry: CompanyIndustry, intent: EmailIntent) {
  const name = generateName();
  const sender = `${name} <${generateEmail(name)}>`;
  
  let subject = '';
  let body = '';
  
  const orderNumbers = ['10293847', '8472619', '9938212', '2283746'];
  const accountNumbers = ['883726', '100293', '338291', '554322'];
  const missingData = Math.random() > 0.8; // 20% chance to miss important data
  
  if (industry === 'eshop') {
    const order = randomItem(orderNumbers);
    if (intent === 'query') {
      const subjects = ['Kde je moje objednávka?', 'Dostupnost zboží', `Dotaz k objednávce ${missingData ? '' : order}`, 'Rozměry produktu'];
      const bodies = [
        `Dobrý den,\n\nchtěl bych se zeptat, v jakém stavu je moje objednávka ${missingData ? '(číslo teď nevím)' : `číslo ${order}`}. Už je to pár dní a zatím nemám žádné zprávy.\n\nDíky,\n${name}`,
        `Zdravím,\n\nmáte prosím vás na skladě ten modrý svetr ve velikosti L? Nikde to tam nevidím přesně napsané.\n\nS pozdravem\n${name}`,
        `Dobrý den, potřebuji změnit doručovací adresu u objednávky ${missingData ? '' : order}. Jde to ještě?\n\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    } else if (intent === 'complaint') {
      const subjects = [`Reklamace zboží - ${order}`, 'Přišlo něco jiného!', 'Poškozený balík', 'Nefunguje to'];
      const bodies = [
        `Dobrý den,\n\ndnes mi dorazil balíček k objednávce ${missingData ? '' : order}, ale krabice byla úplně roztrhaná a uvnitř chybí kabel k nabíječce! Co s tím budeme dělat?\n\nJsem docela naštvaný, potřebuju to na víkend.\n\n${name}`,
        `Hezký den, chtěl(a) bych reklamovat mixér z objednávky ${order}. Po druhém použití z něj začalo kouřit a už se nezapnul. Mám to poslat zpět na vaši adresu?\n\nS pozdravem,\n${name}`,
        `Dobrý den, poslali jste mi jinou barvu trička. Objednal jsem černé, přišlo bílé. Objednávka ${missingData ? 'už ani nevím číslo' : order}.\n\nČekám na rychlou nápravu.\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    } else { // escalation
      const subjects = ['Okamžité zrušení objednávky', 'Předání ČOI', 'Vrácení peněz!', 'Tohle je vrchol'];
      const bodies = [
        `Vážení,\n\nuž je to 14 dní co čekám na doručení. Vaše podpora mi včera slíbila, že to dnes přijde a nic! Tímto okamžitě stornuji objednávku ${missingData ? '' : order} a požaduji peníze zpět na účet, jinak to předám České obchodní inspekci.\n\n${name}`,
        `Dobrý den. Odmítám dále čekat na vyřízení mé reklamace. Už měsíc mi dlužíte peníze za vrácené zboží. Pokud nebudu mít peníze do pátku na účtu, volám právníka.\n\n${name}`,
        `Zrušte mou objednávku. Tohle jednání je naprosto neprofesionální. Nikdo nebere telefon, na maily neodpovídáte. \n\nSbohem.\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    }
  } else if (industry === 'telco') {
    const acc = randomItem(accountNumbers);
    if (intent === 'query') {
      const subjects = ['Změna tarifu', 'Dotaz na vyúčtování', `Zákaznické číslo ${missingData ? '' : acc}`, 'Roaming v Turecku'];
      const bodies = [
        `Dobrý den,\n\nchtěl bych si na další měsíc aktivovat neomezená data k mému číslu. Můžete mi poslat ceník?\n\nDěkuji,\n${name}`,
        `Zdravím, jedu příští týden do Turecka a potřebuji vědět, jak je to tam s datovým roamingem. Platí tam můj současný tarif?\n\n${name}`,
        `Dobrý den, nerozumím jedné položce na mém posledním vyúčtování. Můžete mi to vysvětlit? ${missingData ? '' : `Moje zákaznické číslo je ${acc}.`}\n\nS pozdravem\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    } else if (intent === 'complaint') {
      const subjects = ['Nefunguje mi internet', 'Výpadky signálu', 'Špatně naúčtované poplatky', 'Stížnost na pobočku'];
      const bodies = [
        `Dobrý den, už od včerejšího večera nám doma nejde internet. Zkoušel jsem restartovat router a nic. ${missingData ? '' : `Smlouva je psaná na číslo ${acc}.`}\n\nPotřebuju to nutně k práci.\n\n${name}`,
        `Vážení, na poslední faktuře mám naúčtované nějaké prémiové SMS, které jsem v životě neposlal! Žádám o okamžitou opravu faktury.\n\n${name}`,
        `Dobrý den, bydlím na Praze 5 a už týden mi neustále vypadává signál při hovorech. Platím u vás nemalé peníze a očekávám funkční služby.\n\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    } else {
      const subjects = ['Výpověď smlouvy', 'Odchod ke konkurenci', 'Stížnost řediteli', 'Tohle už stačí'];
      const bodies = [
        `Dobrý den,\n\ntímto podávám oficiální výpověď všech mých služeb vedených pod číslem ${missingData ? '' : acc}. Konkurence mi nabídla poloviční cenu za dvojnásobná data a s vaším výpadkovým internetem mi už došla trpělivost. Pošlete mi ČVOP.\n\nS pozdravem,\n${name}`,
        `Už mám plné zuby vaší "zákaznické podpory". Na infolince jsem včera čekal 40 minut a pak mi to zavěsili. Končím s vámi. Kde mám podepsat výpověď?\n\n${name}`,
        `Vážení,\npokud mi do 24 hodin nenahodíte ten optický internet, odstupuji od smlouvy pro nedodržení podmínek z vaší strany. Přicházím o peníze kvůli tomu, že nemůžu pracovat!\n\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    }
  } else { // b2b
    const b2bCompany = ['TechSoft s.r.o.', 'Stavby CZ a.s.', 'Kreativ Agency', 'Logistika Novák'];
    const comp = randomItem(b2bCompany);
    if (intent === 'query') {
      const subjects = ['Dotaz k API dokumentaci', 'Možnost prodloužení licence', `Nabídka služeb pro ${comp}`, 'Školení zaměstnanců'];
      const bodies = [
        `Dobrý den,\n\nplánujeme v naší firmě (${comp}) nasadit váš nový modul. Bylo by možné poslat detailnější API dokumentaci a případně domluvit krátký call s vaším technikem?\n\nDěkuji,\n${name}`,
        `Zdravím, příští měsíc nám končí roční licence pro 5 uživatelů. Jaké jsou teď možnosti prodloužení a máte nějaké množstevní slevy pro 10 uživatelů?\n\nS pozdravem,\n${name}`,
        `Dobrý den,\nrádi bychom pro naše oddělení objednali školení vašeho softwaru. Jaké jsou volné termíny v průběhu listopadu?\n\n${name}\n${comp}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    } else if (intent === 'complaint') {
      const subjects = ['Výpadek serverů - kritické', 'Chyba v posledním updatu', 'Špatná faktura za říjen', 'Nefunkční synchronizace'];
      const bodies = [
        `Dobrý den,\n\npo vaší včerejší aktualizaci nám kompletně spadla synchronizace dat do našeho ERP. Stojí nám kvůli tomu expedice! Žádám o okamžité řešení, ticket jsem zakládal už ráno a nikdo se neozval.\n\n${name}\nIT Manager, ${comp}`,
        `Zdravím,\nna faktuře za říjen máte uvedenou špatnou částku za konzultace. Bylo dohodnuto 15 hodin a fakturujete 25. Prosím o storno a vystavení nového dokladu.\n\n${name}`,
        `Dobrý den, váš systém je od rána neskutečně pomalý. Naši lidé nemůžou normálně pracovat. Zkontrolujte to prosím, platíme si SLA.\n\n${name}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    } else {
      const subjects = ['Odstoupení od SLA', 'Ukončení spolupráce', 'Kritický bezpečnostní incident', 'Zásadní porušení smlouvy'];
      const bodies = [
        `Vážení,\n\nvzhledem k tomu, že během posledního měsíce nedodržujete dohodnuté SLA ohledně dostupnosti systému, začínáme hledat alternativního dodavatele. Budu kontaktovat vašeho obchodního ředitele ohledně penále za výpadky.\n\nS pozdravem,\n${name}\nJednatel, ${comp}`,
        `Dobrý den.\nTento přístup je pro B2B partnerství naprosto neakceptovatelný. Náš problém řešíte už třetí týden a stále bez výsledku. Zastavujeme veškeré platby vašich faktur až do vyřešení situace.\n\n${name}`,
        `Vážení,\nnaši bezpečnostní auditoři našli závažnou trhlinu ve vaší platformě. Pokud zítra do 12:00 neobdržíme jasný plán nápravy, odpojujeme vaše systémy od naší infrastruktury.\n\n${name}\n${comp}`
      ];
      subject = randomItem(subjects);
      body = randomItem(bodies);
    }
  }

  return { sender, subject, body };
}

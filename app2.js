let EDITION={date:'Wednesday, 11 November 2026',stamp:'Updated 5:45 pm IST',sample:true};
/* Main heads, each with narrow sub-interests. Readers can ask for more under "Anything else". */
const HEADS=[
 {id:'biz',name:'Business & Markets',c:'var(--biz)',subs:[
  {id:'stocks',name:'Stocks & Markets',kw:/stock|share|nifty|sensex|market|invest|mutual/i,edu:1},
  {id:'ipos',name:'IPOs',kw:/ipo|listing|listings/i,edu:1},
  {id:'economy',name:'Economy',kw:/economy|gdp|inflation|trade|export/i,wip:1},
  {id:'finance',name:'Personal Finance & Banking',kw:/personal finance|bank|loan|tax|insurance|savings/i,wip:1},
  {id:'startups',name:'Startups',kw:/startup|funding|founder|unicorn/i,wip:1},
  {id:'gold',name:'Gold',kw:/gold|silver|bullion/i,wip:1}]},
 {id:'sport',name:'Sports',c:'var(--sport)',subs:[
  {id:'cricket',name:'Cricket',kw:/cricket|ipl|odi|t20|test match|bcci/i},
  {id:'football',name:'Football',kw:/football|soccer|premier league|la liga|champions league|messi|ronaldo|isl/i},
  {id:'nba',name:'NBA',kw:/nba|basketball/i},
  {id:'tennis',name:'Tennis',kw:/tennis|wimbledon|grand slam|atp|wta/i,wip:1},
  {id:'f1',name:'Formula 1',kw:/\bf1\b|formula ?1|grand prix/i,wip:1},
  {id:'hockey',name:'Hockey',kw:/hockey/i,wip:1},
  {id:'badminton',name:'Badminton',kw:/badminton|bwf/i,wip:1},
  {id:'olympics',name:'Olympics',kw:/olympic|athletics|asian games/i,wip:1},
  {id:'kabaddi',name:'Kabaddi',kw:/kabaddi|pkl/i,wip:1}]},
 {id:'ent',name:'Entertainment',c:'var(--ent)',subs:[
  {id:'movies',name:'Movies',kw:/movie|film|bollywood|tollywood|box office|cinema/i},
  {id:'ott',name:'OTT & Series',kw:/ott|netflix|prime|series|hotstar|web ?series|stream/i},
  {id:'music',name:'Music',kw:/music|album|concert|song/i,wip:1},
  {id:'tv',name:'Television',kw:/\btv\b|television|reality show/i,wip:1},
  {id:'gaming',name:'Gaming',kw:/gaming|game|esports|playstation|xbox/i,wip:1}]},
 {id:'tech',name:'Tech & AI',c:'var(--tech)',subs:[
  {id:'ai',name:'AI',kw:/\bai\b|artificial|chatbot|llm/i,wip:1},
  {id:'gadgets',name:'Gadgets & Apps',kw:/gadget|smartphone|phone|app\b|apps|chip|software/i,wip:1},
  {id:'cyber',name:'Cybersecurity',kw:/cyber|hack|privacy|data breach/i,wip:1},
  {id:'space',name:'Space',kw:/space|isro|nasa|rocket|satellite/i,wip:1}]},
 {id:'life',name:'Lifestyle',c:'var(--life)',subs:[
  {id:'fashion',name:'Fashion & Brands',kw:/fashion|brand|style|sneaker|retail/i,wip:1},
  {id:'food',name:'Food',kw:/food|recipe|restaurant|cafe/i,wip:1},
  {id:'travel',name:'Travel',kw:/travel|trip|tourism|destination/i,wip:1},
  {id:'fitness',name:'Fitness',kw:/fitness|gym|workout|running/i,wip:1}]},
 {id:'edu',name:'Education & Careers',c:'var(--edu)',subs:[
  {id:'exams',name:'Exams & Results',kw:/exam|result|ca |cuet|neet|jee|upsc/i,wip:1},
  {id:'careers',name:'Jobs & Careers',kw:/job|career|intern|hiring|placement/i,wip:1}]},
 {id:'sci',name:'Science & Environment',c:'var(--sci)',subs:[
  {id:'science',name:'Science',kw:/science|research|discovery/i,wip:1},
  {id:'climate',name:'Climate & Environment',kw:/climate|environment|pollution|weather/i,wip:1}]},
 {id:'pol',name:'Politics & Policy',c:'var(--pol)',civ:1,subs:[
  {id:'policy',name:'Policy & Government',kw:/policy|govt|government|budget|rbi|sebi|law/i,wip:1},
  {id:'elections',name:'Elections',kw:/election|poll|parliament|vote/i,wip:1},
  {id:'world',name:'World Affairs',kw:/world|foreign|international|diplomacy/i,wip:1},
  {id:'courts',name:'Courts & Law',kw:/court|supreme court|judgment|verdict/i,wip:1}]}
];
const SUB={},HEAD={};HEADS.forEach(h=>h.subs.forEach(s=>{SUB[s.id]=s;HEAD[s.id]=h}));
const BLOCK=/\b(bet|betting|gambl\w*|casino|fantasy|dream ?11|poker|lottery|satta|alcohol|liquor|beer|vodka|whisk\w*|wine|drugs?|weed|cannabis|vape|porn\w*|adult|nsfw|murder|rape|suicide|crime|gore|violence|weapons?|guns?|terror\w*|dating)\b/i;

/* Original artwork: one illustrated motif per sub-interest, on the head's colour. */
const W='fill="#fff" fill-opacity=".18"', S='fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const MOTIF={
 stocks:'<g '+S+'><path d="M20 170 L90 120 L150 140 L230 70 L300 96 L400 20 L500 44"/></g><g '+W+'><rect x="52" y="110" width="18" height="70"/><rect x="112" y="96" width="18" height="84"/><rect x="172" y="120" width="18" height="60"/><rect x="232" y="70" width="18" height="110"/><rect x="292" y="84" width="18" height="96"/><rect x="352" y="48" width="18" height="132"/></g>',
 ipos:'<g '+W+'><path d="M300 150a60 60 0 0 1 120 0z"/><rect x="350" y="150" width="20" height="26" rx="4"/></g><g '+S+'><path d="M300 150a60 60 0 0 1 120 0z"/><path d="M60 170 L120 130 L180 148 L250 90"/></g>',
 startups:'<g '+W+'><path d="M360 24c40 20 56 70 32 118l-32 22-32-22c-24-48-8-98 32-118z"/></g><g '+S+'><circle cx="360" cy="78" r="16"/><path d="M328 142l-30 30M392 142l30 30M360 164v26"/></g>',
 gold:'<g '+W+'><path d="M120 170l30-52h130l30 52z"/><path d="M230 118l24-42h100l24 42z"/></g><g '+S+'><path d="M120 170l30-52h130l30 52zM230 118l24-42h100l24 42z"/></g>',
 cricket:'<g '+W+'><rect x="330" y="24" width="14" height="120" rx="3"/><rect x="354" y="24" width="14" height="120" rx="3"/><rect x="378" y="24" width="14" height="120" rx="3"/><circle cx="170" cy="86" r="26"/></g><g '+S+'><path d="M20 170 Q200 40 320 120M300 150h120"/><circle cx="170" cy="86" r="26"/></g>',
 football:'<g '+S+'><path d="M0 100h520"/><circle cx="260" cy="100" r="52"/><rect x="-6" y="48" width="70" height="104"/><rect x="456" y="48" width="70" height="104"/></g><g '+W+'><circle cx="400" cy="60" r="30"/></g><path d="M400 44l16 12-6 18h-20l-6-18z" fill="#fff" fill-opacity=".3"/>',
 nba:'<g '+S+'><circle cx="190" cy="104" r="62"/><path d="M128 104h124M190 42v124M146 62c28 26 28 62 0 84M234 62c-28 26-28 62 0 84"/><path d="M360 40h90v50h-90zM384 90v18h42V90M372 108l8 40M438 108l-8 40"/></g><g '+W+'><circle cx="190" cy="104" r="62"/></g>',
 kabaddi:'<g '+S+'><path d="M40 170h440M260 20v150"/><circle cx="170" cy="96" r="26"/><circle cx="350" cy="96" r="26"/></g>',
 movies:'<g '+W+'><rect x="40" y="30" width="440" height="22"/><rect x="40" y="148" width="440" height="22"/><circle cx="400" cy="100" r="46"/></g><g '+S+'><circle cx="400" cy="100" r="46"/><circle cx="400" cy="100" r="18"/><path d="M60 100h200"/></g>',
 ott:'<g '+W+'><rect x="70" y="40" width="250" height="150" rx="14"/><path d="M360 80l70 40-70 40z"/></g><g '+S+'><rect x="70" y="40" width="250" height="150" rx="14"/><path d="M360 80l70 40-70 40z"/><path d="M130 200h130"/></g>',
 ai:'<g '+S+'><circle cx="150" cy="100" r="14"/><circle cx="260" cy="50" r="14"/><circle cx="260" cy="150" r="14"/><circle cx="380" cy="100" r="14"/><path d="M162 94L248 56M162 106l86 38M274 56l94 38M274 146l94-38M260 64v72"/></g>',
 gadgets:'<g '+W+'><rect x="300" y="24" width="90" height="160" rx="16"/></g><g '+S+'><rect x="300" y="24" width="90" height="160" rx="16"/><path d="M330 168h30"/><rect x="90" y="70" width="150" height="100" rx="10"/><path d="M120 190h90"/></g>',
 fashion:'<g '+W+'><path d="M300 40l40-16 40 16 40-8 24 50-30 10v84H266V92l-30-10 24-50z"/></g><g '+S+'><path d="M300 40l40-16 40 16 40-8 24 50-30 10v84H266V92l-30-10 24-50z"/></g>',
 policy:'<g '+W+'><path d="M260 30l110 40H150z"/><rect x="170" y="80" width="18" height="80"/><rect x="226" y="80" width="18" height="80"/><rect x="282" y="80" width="18" height="80"/><rect x="338" y="80" width="18" height="80"/><rect x="150" y="164" width="240" height="16"/></g>',
 elections:'<g '+W+'><rect x="170" y="90" width="200" height="90" rx="8"/></g><g '+S+'><rect x="170" y="90" width="200" height="90" rx="8"/><path d="M230 90V60h80v30M250 130h40"/></g>'
};
const ICON={cricket:'<path d="M14 3l5 5-9 9-5-5z"/><circle cx="18" cy="18" r="2.4"/>',football:'<circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z"/>',nba:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/>',
 stocks:'<path d="M3 17l5-6 4 3 7-9"/>',ipos:'<path d="M5 17a7 7 0 0 1 14 0z"/><path d="M12 17v3"/>',movies:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>',ott:'<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M10 9l5 3-5 3z"/>'};
const ACCENT={biz:'#F6D34A',sport:'#D7F25A',ent:'#FFD6A8',tech:'#7DF0D3',life:'#FFE08A',edu:'#FFD36E',sci:'#F2F5A0',pol:'#F2B632'};
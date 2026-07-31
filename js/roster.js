// ============================================================
// USA Masters roster data — one entry per team, keyed by the
// division code used across the site (team.html?div=CODE).
//
// TO FILL IN A TEAM: copy the player-object template below into
// that team's `players` array — one object per player.
//
//   { name: "First Last",            // required
//     number: 22,                    // jersey number, or null
//     position: "Midfield",          // or null if unknown
//     college: "School name",        // or null
//     hometown: "Home, ST → Now, ST",// where from → where now (or one place)
//     fact: "One-line fun fact / career highlight for the card back.",
//     photo: "assets/players/first-last.jpg",  // "" until headshot arrives
//     quote: "Favorite quote here.", // null until collected
//     captain: true,                 // only on captains — shows on the card
//   },
//
// A team can also carry `alternates: ["Name", …]` and
// `staff: [{ role: "Head Coach", name: "…" }, …]` — both render
// below the player grid on team.html.
//
// Headshots: drop image files in assets/players/ (portrait 4:5 works best)
// and set each player's `photo` to that path.
// ============================================================

const ROSTERS = {
  // ---- Netherlands · Schiedam · July 22 – Aug 1 ----
  W35: {
    label: "Women O35", short: "WO35",
    venue: "HC Schiedam, Netherlands", dates: "July 22 – August 1", inJuly: true,
    players: [
      { name: "Missy Arenz", number: null, position: "Defense", college: "University of Delaware", hometown: "Fredericksburg, VA → Landenberg, PA", fact: "All-CAA defender at Delaware (as Missy Woodie), then coached on the Blue Hens' staff that won the 2016 national championship.", photo: "assets/players/missy-arenz.jpg", quote: "Somewhere behind the athlete you've become… is a little girl who fell in love with the game and never looked back… play for her. — Mia Hamm" },
      { name: "Emma Beck", number: 0, position: "Goalkeeper", college: null, hometown: "Lewisberry, PA → Baltimore, MD", fact: null, photo: "assets/players/emma-beck.jpg", quote: "Don't think too hard and just do it." },
      { name: "Kristie Blumer", number: null, position: "Forward/Midfield", college: "Towson University", hometown: "Columbia, MD → Falls Church, VA", fact: "21 career goals and All-CAA honors at Towson — and back for another World Cup after making the 2024 squad.", photo: "", quote: null },
      { name: "Katie Braun", number: 22, position: "Midfield/Defense", college: null, hometown: "Pittsburgh, PA", fact: "U.S. Masters veteran — 2022 World Cup in Nottingham, and pulling double duty on the 2026 indoor AND outdoor World Cup teams.", photo: "assets/players/katie-braun.jpg", quote: null },
      { name: "Daphne de Poot", number: 5, position: "Defense/Midfield", college: null, hometown: "Oss, NL → Atlanta, GA", fact: "Grew up in the Dutch club game before bringing her hockey brain to Atlanta — where she also coaches the next generation.", photo: "", quote: "Better together" },
      { name: "Katharina Helling", number: 44, position: "Defense/Midfield", college: "University at Albany", hometown: "Philadelphia, PA", fact: "First Team All-America East at UAlbany, after a club career spanning Mannheim, Melbourne, Prague and Hong Kong.", photo: "assets/players/katharina-helling.jpg", quote: "Be a gold fish" },
      { name: "Ashley Johnston", number: 27, position: "Midfield", college: "Duke University", hometown: "Royersford, PA", fact: "Duke forward (as Ashley Pultorak) with three Academic All-ACC nods and a run to the 2005 national title game — now coaching at Ursinus.", photo: "", quote: "Love the game" },
      { name: "Michelle Kasold", number: 18, position: "Midfield", college: "Wake Forest University", hometown: "Chapel Hill, NC → Efland, NC", fact: "Three-time All-American at Wake Forest, 227 caps for the U.S. National Team, and a 2012 London Olympian.", photo: "", quote: "It's hard to beat a person who never gives up." },
      { name: "Melissa Katz", number: 33, position: "Goalkeeper", college: "Monmouth University", hometown: "Tinton Falls, NJ → Atlanta, GA", fact: "Four-year starter in goal at Monmouth (60 starts, All-NEC) — now training the next generation of Atlanta goalkeepers.", photo: "assets/players/melissa-katz.jpg", quote: "Nothing is impossible" },
      { name: "Amy Krompinger", number: 3, position: "Forward", college: "University of Connecticut", hometown: "Wilmington, DE → Sandy Hook, CT", fact: "NCAA Final Four defender at UConn who now runs AIM Athletes FH Club — and won silver with USA O-35 at the Pan Am Continental Cup.", photo: "assets/players/amy-krompinger.jpg", quote: "If you're not having fun, why do it?" },
      { name: "Olivia Lopes", number: 25, position: "Midfield", college: null, hometown: "Keyport, NJ → Basking Ridge, NJ", fact: null, photo: "", quote: "Don't forget to enjoy the journey while you're on your way to the top" },
      { name: "Melissa \"Mel\" McCarthy", number: 6, position: "Forward/Midfield", college: "Hofstra University", hometown: "Havertown, PA", fact: "All-America Rookie at Millersville, CAA Scholar-Athlete of the Year at Hofstra, now head coach at Widener — on BOTH the 2026 indoor and outdoor World Cup teams.", photo: "assets/players/melissa-mccarthy.jpg", quote: "Score more than you get scored on" },
      { name: "Hillary Paul Metcalf", number: 2, position: "Forward/Midfield", college: "Stevens Institute of Technology", hometown: "Concord, NH → Chelsea, MA", fact: "Anchored the back line for the Stevens Ducks in Hoboken.", photo: "assets/players/hillary-paul-metcalf.jpg", quote: null },
      { name: "Kim Romansky", number: null, position: "Forward", college: "Wake Forest University", hometown: "Malvern, PA", fact: "Started all 26 games for Wake Forest in 2008, went NFHCA All-Region, and buried the NCAA-quarterfinal winner over Virginia.", photo: "", quote: null },
      { name: "Sol", number: null, position: null, college: null, hometown: null, fact: null, photo: "", quote: null },
      { name: "Erin Tarburton", number: 13, position: "Defense/Midfield", college: "University of Delaware", hometown: "San Diego, CA → New Castle, DE", fact: "Delaware forward (as Erin Marihugh), U.S. U-16 alum and U.S. Indoor National Teamer.", photo: "assets/players/erin-tarburton.jpg", quote: "You miss 100% of the shots you don't take. — Wayne Gretzky" },
      { name: "Courtney Veinotte Crosby", number: 12, position: "Midfield", college: "University of Maine", hometown: "Skowhegan, ME → Georgetown, ME", fact: "Four-year Black Bear and senior captain, former Hofstra head coach — and just rejoined Maine's coaching staff this spring.", photo: "assets/players/courtney-veinotte-crosby.jpg", quote: null },
      { name: "Christine Watts", number: 21, position: "Defense", college: "William & Mary", hometown: "Williamsburg, VA → Atlanta, GA", fact: "Four-year Tribe defender who started every match as a junior, three-time NFHCA All-Academic pick — and now President of the Georgia Field Hockey Association.", photo: "assets/players/christine-watts.jpg", quote: null },
    ],
  },
  W40: { label: "Women O40", short: "WO40", venue: "HC Schiedam, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  M35: { label: "Men O35", short: "MO35", venue: "HC Schiedam, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  M40: { label: "Men O40", short: "MO40", venue: "HC Schiedam, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },

  // ---- Netherlands · Rotterdam / Victoria · July 22 – Aug 1 ----
  W35I: {
    label: "Women O35 IMC", short: "W35 IMC", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true,
    page: "team-w35imc", // dedicated page → IMC-specific social-share card
    // Roster from the team's official player cards — more arriving.
    players: [
      { name: "Patricia Zini", number: 1, position: "Forward", college: "Trinity College", hometown: "Wrentham, MA", fact: "Four-year Bantam at Trinity who founded the Turf Burn Field Hockey league in 2003 — and has run it every summer since. Opened the IMC squad's World Cup scoring with a penalty-corner deflection against Alliance.", photo: "assets/players/patricia-zini.jpg", quote: null },
      { name: "Colleen Cassada", number: 4, position: "Forward", college: "University of Maryland", hometown: "Clayton, NC", fact: "As Colleen Barbieri: ACC Rookie of the Year, 2002 First-Team All-American and three Final Fours at Maryland. Now Barton College's first-ever head coach — and she bagged two goals in one game in Rotterdam.", photo: "assets/players/colleen-cassada.jpg", quote: null },
      { name: "Rebecca Newcomer", number: 9, position: "Defense/Midfield", college: null, hometown: "Hawley, PA", fact: "Co-founder and head coach of PACK Field Hockey in Hawley, PA — and singled out in Rotterdam for the relentless work rate driving both the IMC defense and its transition into attack.", photo: "assets/players/rebecca-newcomer.jpg", quote: null },
      { name: "Heather Kenney", number: 12, position: "Forward", college: null, hometown: "Rockville, MD", fact: "From a famed New Jersey field hockey family — younger sister of longtime USWNT midfielder Robyn Kenney — and a 2023 Pan Am Continental Cup alternate now getting her World Cup turn.", photo: "assets/players/heather-kenney.jpg", quote: null },
      { name: "Meshia Begin", number: 14, position: "Midfield", college: null, hometown: "Northampton, MA", fact: null, photo: "assets/players/meshia-begin.jpg", quote: null },
      { name: "Alex Sopelak", number: 15, position: "Defense", college: "Rensselaer Polytechnic Institute", hometown: "Bloomfield, CT", fact: "As Alex Lamparski, an RPI defender who once beat ranked William Smith with a game-winning penalty stroke — now an energy-efficiency engineer in Connecticut.", photo: "assets/players/alex-sopelak.jpg", quote: null },
      { name: "Lorrie Kiger", number: 16, position: "Defense", college: "Yale University", hometown: "Pittsburgh, PA", fact: "Yale defender and three-time NFHCA National Academic Squad pick, now a UPMC pediatrician — and she's already scored twice in Rotterdam, including the USA's lone goal against Australia B.", photo: "assets/players/lorrie-kiger.jpg", quote: null },
      { name: "Kerri Kinsella", number: 19, position: "Defense", college: "Westfield State University", hometown: "Seekonk, MA", fact: "Played back for the Westfield State Owls and now coaches as assistant at UMass Dartmouth — same position, same instincts, now on a World Cup pitch.", photo: "assets/players/kerri-kinsella.jpg", quote: null },
      { name: "Cathy Callahan", number: 20, position: "Forward", college: null, hometown: "West Hartford, CT", fact: "Made her USA Masters debut at the 2024 World Cup in Cape Town, South Africa — and is back for more with the IMC squad in Rotterdam.", photo: "assets/players/cathy-callahan.jpg", quote: null },
      { name: "Noelia Manzanelli", number: 23, position: "Midfield", college: null, hometown: "Miami, FL", fact: null, photo: "assets/players/noelia-manzanelli.jpg", quote: null },
      { name: "Kelli Ruchalski", number: 26, position: "Midfield", college: null, hometown: "Wales, NY", fact: null, photo: "assets/players/kelli-ruchalski.jpg", quote: null },
      { name: "Maisa Badawy", number: 31, position: "Midfield", college: null, hometown: "Westwood, MA", fact: null, photo: "assets/players/maisa-badawy.jpg", quote: null },
      { name: "Mandy Mowry", number: 33, position: "Forward", college: null, hometown: "Souderton, PA", fact: "Suited up for the USA O-35s at the inaugural 2023 Pan Am Continental Cup in Buenos Aires before earning her World Cup spot for Rotterdam.", photo: "assets/players/mandy-mowry.jpg", quote: null },
      { name: "Christine Neville", number: 55, position: "Midfield", college: null, hometown: "Swansea, MA", fact: null, photo: "assets/players/christine-neville.jpg", quote: null },
      { name: "Kristi Tracey", number: 97, position: "Goalkeeper", college: "University at Albany", hometown: "Lehighton, PA", fact: "As Kristi Troch, back-to-back America East Goalkeeper of the Year at UAlbany — now a Doctor of Physical Therapy stacking clean sheets for the IMC squad in Rotterdam.", photo: "assets/players/kristi-tracey.jpg", quote: null },
    ],
    staff: [
      { role: "Head Coach", name: "Nina Klein", hometown: "Unionville, CT", fact: "Three-time NCAA champion goalkeeper at UConn — including the perfect 23-0 title run in 2017 — and now head coach at Quinnipiac University.", photo: "assets/players/nina-klein.jpg" },
      { role: "Assistant Coach", name: "Abby Lucas", hometown: "Hamden, CT", fact: "UConn goalkeeper on the undefeated 2017 national championship team, now developing the Quinnipiac keepers alongside Nina Klein.", photo: "assets/players/abby-lucas.jpg" },
      { role: "Athletic Trainer", name: "Kurt Kessler", hometown: "Manheim, PA", fact: "Doctor of Physical Therapy and founder of Higher Power Sports PT — a board-certified Sports Clinical Specialist, a credential held by roughly 1% of PTs.", photo: "assets/players/kurt-kessler.jpg" },
    ],
  },
  W45: { label: "Women O45", short: "WO45", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  W50: { label: "Women O50", short: "WO50", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  M45: { label: "Men O45", short: "MO45", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  M50: { label: "Men O50", short: "MO50", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },

  // ---- Belgium · Brasschaat & Antwerp · Aug 6 – 16 ----
  W55: {
    label: "Women O55", short: "WO55", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false,
    page: "team-w55", // dedicated page → W55-specific social-share card
    // Travel roster via Elle Race, July 2026. Headshots land in assets/players/
    // as they're processed — set each player's `photo` when the file exists.
    players: [
            { name: "Ana Berra", number: 3, position: "Midfield", college: null, hometown: "Doral, FL", fact: null, photo: "assets/players/ana-berra.jpg", quote: "Play with heart." },
            { name: "Flo Manero", number: 5, position: "Defense", college: null, hometown: "Key Biscayne, FL", fact: "Director and head coach of Key Biscayne Field Hockey — a Cape Town 2022 and Pan Am Continental Cup veteran whose youth teams have reached USA Field Hockey Nationals.", photo: "assets/players/flo-manero.jpg", quote: "The only thing that can limit you is believing that you are limited. Become limitless." },
            { name: "Margaret Kelly", number: 6, position: "Forward", captain: true, college: null, hometown: "Sherborn, MA", fact: "Co-captain with Cape Town 2022 on the résumé — and a goal for the USA O-55s at the 2026 Indoor World Cup in Nottingham on the way to Belgium.", photo: "assets/players/margaret-kelly.jpg", quote: null },
            { name: "Elisa Bell", number: 7, position: "Midfield", college: null, hometown: "Orange, CA", fact: "Repped the USA at the 2024 Indoor Masters World Cup in Nottingham before earning her outdoor World Cup shot in Belgium.", photo: "assets/players/elisa-bell.jpg", quote: "Heart to compete. Hustle to win. Hockey for life." },
            { name: "Ainslee Lamb", number: 8, position: "Midfield", college: "University of Toronto", hometown: "Toronto, ON → Natick, MA", fact: "Canadian international from 1987–92 (including the 1990 World Cup) who became head coach at Yale and then Boston College — and now coaches USA junior national teams.", photo: "assets/players/ainslee-lamb.jpg", quote: null },
            { name: "Sue Elliott", number: 9, position: "Midfield", college: null, hometown: "Fountainville, PA", fact: "U.S. Masters fixture whose indoor and outdoor USA appearances stretch from the 2017 Indoor World Cup to Cape Town 2022 and Nottingham 2024.", photo: "assets/players/sue-elliott.jpg", quote: "Never let the fear of failure destroy the taste of success." },
            { name: "Gaby Cappanera", number: 10, position: "Forward", college: null, hometown: "Argentina → Kingwood, TX", fact: "On a stick since age 4 in her native Argentina — founded the Weston (FL) Field Hockey Club and led the line for the USA O-50s in Cape Town 2022.", photo: "", quote: null },
            { name: "Cathy Marston", number: 11, position: "Midfield", college: null, hometown: "Turner, ME", fact: "Head coach at Maine's Leavitt Area High School and the Maine STYX club — with USA trips to the 2023 Pan Am Continental Cup and the 2024 World Cup in Auckland.", photo: "assets/players/cathy-marston.jpg", quote: "The heart never retires from chasing dreams." },
            { name: "Elle Race", number: 12, position: "Forward", college: "Penn State University", hometown: "Cheshire, CT → Johns Creek, GA", fact: "As Eleanor Stone, a Penn State All-American and nineties U.S. National Teamer — World Cup bronze in 1994, Pan Am Games bronze in 1995 — now coaching with Atlanta Field Hockey Club.", photo: "assets/players/elle-race.jpg", quote: "You miss 100% of the shots you don't take. — Wayne Gretzky" },
            { name: "Alison Smith", number: 13, position: "Defense", college: null, hometown: "Highland Park, IL", fact: "Co-chair of the U.S. Masters Executive Committee with a penalty-corner habit — she's scored in back-to-back Indoor World Cups (2024 and 2026).", photo: "assets/players/alison-smith.jpg", quote: "I'm so grateful to be playing this crazy game as long as possible with an amazing group of teammates." },
            { name: "Pam Stuper", number: 19, position: "Midfield", captain: true, college: "Old Dominion University", hometown: "Lancaster, PA → St. Petersburg, FL", fact: "USA Field Hockey Hall of Famer: as Pam Neiss she won three NCAA titles at Old Dominion, spent nine years on the U.S. National Team (1994 World Cup bronze), then became Yale's winningest head coach.", photo: "assets/players/pam-stuper.jpg", quote: null },
            { name: "Nori McCargo", number: 21, position: "Defense", college: null, hometown: "Suwanee, GA → San Diego, CA", fact: "As Nori Smith, a four-time U.S. Masters World Cup athlete — and the voice chosen to close USA Field Hockey's 2026 Hall of Fame Gala with the 'Carrying it Forward' tribute.", photo: "assets/players/nori-mccargo.jpg", quote: "But in the end it's still a game (of golf), and if at the end of the day you can't shake hands with your opponent and still be friends, then you've missed the point. — Payne Stewart" },
            { name: "Clara Ambrose", number: 25, position: "Midfield", college: "Wesleyan University", hometown: "Westport, CT", fact: "As Clara Kim, an All-America midfielder who never missed a game at Wesleyan (and made its athletics Hall of Fame) — masters stops in Terrassa 2018, Cape Town 2022, and a goal at the 2026 Indoor World Cup.", photo: "assets/players/clara-ambrose.jpg", quote: null },
            { name: "Jen Anderson", number: 27, position: "Goalkeeper", college: "University of Waterloo", hometown: "Owings Mills, MD", fact: "Four World Cups between the pipes for U.S. Masters — with clutch penalty-stroke saves at the 2026 Indoor World Cup — and goalkeeping coach at Stevenson University and Hymax FHC.", photo: "assets/players/jen-anderson.jpg", quote: "Always be good with people; they are the ones who believe in you." },
            { name: "Lori Miller", number: 28, position: "Goalkeeper", college: null, hometown: "Newmanstown, PA", fact: "Back between the pipes after keeping goal for the USA O-50s at the 2022 World Cup in Cape Town.", photo: "assets/players/lori-miller.jpg", quote: null },
            { name: "Beth Montagano", number: 29, position: "Defense", college: null, hometown: "Jenkintown, PA", fact: "Anchored the USA back line in Cape Town 2022 and made goal-line clearances against Argentina in Auckland 2024 — Belgium makes it three straight World Cup cycles.", photo: "assets/players/beth-montagano.jpg", quote: null },
            { name: "Maca Diaz Varela", number: 31, position: "Midfield", college: null, hometown: "Argentina → Doral, FL", fact: "Buenos Aires roots, Doral home — now coaching U-14 club hockey in South Florida alongside USA teammate Gaby Cappanera.", photo: "assets/players/maca-diaz-varela.jpg", quote: "Be stronger than your excuses." },
            { name: "Mercedes Miodownik", number: 67, position: "Forward", college: null, hometown: "Weston, FL", fact: "From 2023 Pan Am Continental Cup alternate to the full World Cup squad for Brasschaat.", photo: "", quote: null },
    ],
    alternates: ["Kari Galu", "Nonna Mamedova", "Lori Dellicato", "Sandy Binder", "Beth Denmead", "Lorena Loritz"],
    staff: [
      { role: "Head Coach", name: "Caroline Nelson-Nichols" },
      { role: "Manager / Asst. Coach", name: "Jess Weiss" },
    ],
  },
  W60: { label: "Women O60", short: "WO60", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  W65: { label: "Women O65", short: "WO65", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  M55: { label: "Men O55", short: "MO55", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  M60: { label: "Men O60", short: "MO60", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },

  // ---- O65 · Breda · Aug 6 – 16 ----
  M65: { label: "Men O65", short: "MO65", venue: "BHV Push, Breda, Netherlands", dates: "August 6 – 16", inJuly: false, players: [] },
};

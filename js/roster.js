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
//   },
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
      { name: "Daphne de Poot", number: 5, position: "Defense/Midfield", college: null, hometown: "Oss, NL → Atlanta, GA", fact: "Grew up in the Dutch club game before bringing her hockey brain to Atlanta — where she also coaches the next generation.", photo: "assets/players/daphne-de-poot.jpg", quote: "Better together" },
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
  W35I: { label: "Women O35 IMC", short: "W35 IMC", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  W45: { label: "Women O45", short: "WO45", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  W50: { label: "Women O50", short: "WO50", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  M45: { label: "Men O45", short: "MO45", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },
  M50: { label: "Men O50", short: "MO50", venue: "HC Rotterdam / Victoria, Netherlands", dates: "July 22 – August 1", inJuly: true, players: [] },

  // ---- Belgium · Brasschaat & Antwerp · Aug 6 – 16 ----
  W55: { label: "Women O55", short: "WO55", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  W60: { label: "Women O60", short: "WO60", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  W65: { label: "Women O65", short: "WO65", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  M55: { label: "Men O55", short: "MO55", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },
  M60: { label: "Men O60", short: "MO60", venue: "KHC Dragons / HC Olympia, Belgium", dates: "August 6 – 16", inJuly: false, players: [] },

  // ---- O65 · Breda · Aug 6 – 16 ----
  M65: { label: "Men O65", short: "MO65", venue: "BHV Push, Breda, Netherlands", dates: "August 6 – 16", inJuly: false, players: [] },
};

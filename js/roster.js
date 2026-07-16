// ============================================================
// USA Masters roster data — one entry per team, keyed by the
// division code used across the site (team.html?div=CODE).
//
// TO FILL IN A TEAM: copy the player-object template below into
// that team's `players` array — one object per player.
//
//   { name: "First Last",            // required
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
      { name: "Christine Watts", position: "Defense", college: "William & Mary", hometown: "Williamsburg, VA → Atlanta, GA", fact: "Four-year Tribe defender who started every match as a junior, three-time NFHCA All-Academic pick — and now President of the Georgia Field Hockey Association.", photo: "assets/action-point.jpg", quote: null },
      { name: "Missy Arenz", position: "Defense", college: "University of Delaware", hometown: "Fredericksburg, VA → Landenberg, PA", fact: "All-CAA defender at Delaware (as Missy Woodie), then coached on the Blue Hens' staff that won the 2016 national championship.", photo: "", quote: null },
      { name: "Kristie Blumer", position: "Forward/Midfield", college: "Towson University", hometown: "Columbia, MD → Falls Church, VA", fact: "21 career goals and All-CAA honors at Towson — and back for another World Cup after making the 2024 squad.", photo: "", quote: null },
      { name: "Katie Braun", position: null, college: null, hometown: "Mars, PA", fact: "U.S. Masters veteran — 2022 World Cup in Nottingham, and pulling double duty on the 2026 indoor AND outdoor World Cup teams.", photo: "", quote: null },
      { name: "Daphne de Poot", position: null, college: null, hometown: "Roswell, GA (via the Netherlands)", fact: "Grew up in the Dutch club game before bringing her hockey brain to Atlanta — where she also coaches the next generation.", photo: "", quote: null },
      { name: "Katharina Helling", position: "Defense", college: "University at Albany", hometown: "Hamburg, Germany → Philadelphia, PA", fact: "First Team All-America East at UAlbany, after a club career spanning Mannheim, Melbourne, Prague and Hong Kong.", photo: "", quote: null },
      { name: "Ashley Johnston", position: "Forward", college: "Duke University", hometown: "Royersford, PA", fact: "Duke forward (as Ashley Pultorak) with three Academic All-ACC nods and a run to the 2005 national title game — now coaching at Ursinus.", photo: "", quote: null },
      { name: "Michelle Kasold", position: "Midfield", college: "Wake Forest University", hometown: "Chapel Hill, NC", fact: "Three-time All-American at Wake Forest, 227 caps for the U.S. National Team, and a 2012 London Olympian.", photo: "", quote: null },
      { name: "Melissa Katz", position: "Goalkeeper", college: "Monmouth University", hometown: "Atlanta, GA", fact: "Four-year starter in goal at Monmouth (60 starts, All-NEC) — now training the next generation of Atlanta goalkeepers.", photo: "", quote: null },
      { name: "Amy Krompinger", position: "Defense", college: "University of Connecticut", hometown: "Newtown, CT", fact: "NCAA Final Four defender at UConn who now runs AIM Athletes FH Club — and won silver with USA O-35 at the Pan Am Continental Cup.", photo: "", quote: null },
      { name: "Melissa McCarthy", position: "Midfield/Defense", college: "Hofstra University", hometown: "Havertown, PA", fact: "All-America Rookie at Millersville, CAA Scholar-Athlete of the Year at Hofstra, now head coach at Widener — on BOTH the 2026 indoor and outdoor World Cup teams.", photo: "", quote: null },
      { name: "Nicole Morgan", position: "Forward/Midfield", college: "Appalachian State", hometown: "Virginia Beach, VA", fact: "NorPac Offensive Player of the Year at App State and top-10 in program history in career points — with years of USA Masters coaching on top.", photo: "", quote: null },
      { name: "Hillary Paul Metcalf", position: "Defense", college: "Stevens Institute of Technology", hometown: "Concord, NH → Chelsea, MA", fact: "Anchored the back line for the Stevens Ducks in Hoboken.", photo: "", quote: null },
      { name: "Kim Romansky", position: "Forward", college: "Wake Forest University", hometown: "Malvern, PA", fact: "Started all 26 games for Wake Forest in 2008, went NFHCA All-Region, and buried the NCAA-quarterfinal winner over Virginia.", photo: "", quote: null },
      { name: "Erin Tarburton", position: "Forward", college: "University of Delaware", hometown: "New Castle, DE", fact: "Delaware forward (as Erin Marihugh), U.S. U-16 alum and U.S. Indoor National Teamer.", photo: "", quote: null },
      { name: "Courtney Veinotte", position: "Midfield", college: "University of Maine", hometown: "Skowhegan, ME", fact: "Four-year Black Bear and senior captain, former Hofstra head coach — and just rejoined Maine's coaching staff this spring.", photo: "", quote: null },
      { name: "Maria Vergara", position: null, college: null, hometown: "Hyattsville, MD", fact: null, photo: "", quote: null },
      { name: "Alesha Widdall", position: "Goalkeeper", college: "UMass Amherst", hometown: "Whitney Point, NY", fact: "Two-time All-American in goal at UMass, 57 caps for the U.S. National Team, and a 2016 Rio Olympian.", photo: "", quote: null },
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

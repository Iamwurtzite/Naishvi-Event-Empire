/**
 * Naishvi Event Empire - Central State Store & Business Logic Engine
 * Manages bookings, quotations, vendors, assignments, reviews, notifications,
 * event catalogs, 18 service categories, Pandit Ji ceremonies, Agra venues,
 * and Admin Authentication in localStorage.
 */

const STORAGE_KEYS = {
  BOOKINGS: 'nc_bookings',
  QUOTATIONS: 'nc_quotations',
  VENDORS: 'nc_vendors',
  ASSIGNMENTS: 'nc_assignments',
  REVIEWS: 'nc_reviews',
  NOTIFICATIONS: 'nc_notifications',
  SETTINGS: 'nc_settings',
  ADMIN_AUTH: 'nc_admin_auth'
};

// Expanded Event Catalog (Image 1 & 3)
const DEFAULT_EVENTS = [
  {
    id: 'roka',
    name: 'Roka Ceremony',
    category: 'Pre-Wedding',
    tagline: 'The First Auspicious Commitment',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional shagun exchange, intimate floral backdrop, gift hampers curation, and family dining arrangements.',
    basePrice: 30000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'engagement',
    name: 'The Royal Engagement',
    category: 'Pre-Wedding',
    tagline: 'The Beautiful Beginning of Forever',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Ring exchange hydraulic stage, romantic pastel florals, champagne toast setups, fairy light canopies & live acoustic band.',
    basePrice: 45000,
    packagesAvailable: ['Silver', 'Gold', 'Platinum']
  },
  {
    id: 'haldi',
    name: 'Vibrant Haldi Ceremony',
    category: 'Pre-Wedding',
    tagline: 'Colors of Joy & Sunshine Blessings',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional brass urli tubs, marigold floral draping, phoolon ki holi flower showers, folk dhol, and vibrant photo booths.',
    basePrice: 35000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'mehndi',
    name: 'Festive Mehndi Night',
    category: 'Pre-Wedding',
    tagline: 'Intricate Henna & Carnival Vibe',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80',
    description: 'Bohemian colorful canopies, decorated jhoolas (swings), live bangle making stalls, and master Rajasthani henna artists.',
    basePrice: 40000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'sangeet',
    name: 'Grand Sangeet & Musical Night',
    category: 'Celebration',
    tagline: 'Glitz, Glamour & High-Energy Beats',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Concert-grade LED video stage, intelligent beam truss lighting, cold pyro fireworks, professional dance choreography & celebrity DJ.',
    basePrice: 65000,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'cocktail',
    name: 'Cocktail & After-Party',
    category: 'Celebration',
    tagline: 'Sleek Glamour & Electric Rhythms',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-modern lounge setups, LED bar counters, professional molecular mixology, neon photo-ops, and club sound systems.',
    basePrice: 55000,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'wedding',
    name: 'Sacred Royal Wedding',
    category: 'Main Ceremony',
    tagline: 'Royal Sacred Vows & Majestic Mandap',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    description: 'Imperial palace-grade mandap architecture, royal baraat vintage car procession, hydraulic varmala stage, Vedic havan & pandit coordination.',
    basePrice: 99999,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'reception',
    name: 'Imperial Grand Reception',
    category: 'Post-Wedding',
    tagline: 'Grand Elegance & Imperial Hospitality',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    description: 'Crystal chandelier backdrops, multi-course royal culinary buffet, red carpet receiving lines, VIP lounge, and orchestral background music.',
    basePrice: 75000,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'mata-ki-chowki',
    name: 'Mata Ki Chowki',
    category: 'Devotional & Religious',
    tagline: 'Divine Blessings & Bhakti Bhava',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    description: 'Grand ornate bhavan decoration, renowned bhajan singer troupe, red chunri draping, divine akhand jyot, and satvik prasad distribution.',
    basePrice: 35000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'jagran',
    name: 'Jagran & Bhajan Sandhya',
    category: 'Devotional & Religious',
    tagline: 'All-Night Spiritual Musical Awakening',
    image: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80',
    description: 'Illuminated darbar set, high-definition sound, live dholak & harmonium ensemble, jhanki displays, and sacred bhog feast management.',
    basePrice: 45000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'birthday',
    name: 'Luxury Birthday Celebration',
    category: 'Private Parties',
    tagline: 'Bespoke Themes & Joyful Milestone Moments',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    description: 'Custom theme balloon and floral installations, illuminated marquee numbers, gourmet customized cake, live entertainment, and photo corners.',
    basePrice: 25000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'anniversary',
    name: 'Silver & Golden Anniversary',
    category: 'Private Parties',
    tagline: 'Celebrating Decades of Enduring Love',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Romantic vintage candlelit dining, vow renewal stage, memory lane photo wall gallery, curated live saxophone / violin, and premium banquet feast.',
    basePrice: 35000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower & Godh Bharai',
    category: 'Family Sanskar',
    tagline: 'Blessings for the Mother & New Arrival',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    description: 'Pastel dream decor, traditional shagun rituals, floral tiara and jewellery for mother, fun interactive games, and custom sweet buffet.',
    basePrice: 28000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'corporate',
    name: 'Corporate Galas & Summits',
    category: 'Corporate Events',
    tagline: 'Prestigious Execution & Brand Eminence',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    description: 'Conference stage design, seamless AV line arrays, corporate awards night production, networking dinner coordination, and hospitality liaison.',
    basePrice: 60000,
    packagesAvailable: ['Gold', 'Platinum']
  }
];

// The 18 Definitive Service Categories (Image 4)
const DEFAULT_18_SERVICES = [
  { id: 'srv-1', no: 1, name: 'Wedding Decoration & Mandap', icon: 'fa-wand-magic-sparkles', desc: 'Bespoke theme mandap architecture, 30ft royal stage sets, ambient architectural lighting & floral entrance pathways.' },
  { id: 'srv-2', no: 2, name: 'Royal Catering & Feasts', icon: 'fa-utensils', desc: 'Multi-cuisine royal feasts, live gourmet counters, chaat galli, dessert lounges, and fine dining tableware overseen by master chefs.' },
  { id: 'srv-3', no: 3, name: 'Photography & Cinematography', icon: 'fa-camera-retro', desc: 'Award-winning candid photographers, 4K cinematic film teasers, licensed aerial drone coverage, and heirloom leather albums.' },
  { id: 'srv-4', no: 4, name: 'Bridal Makeup & Styling', icon: 'fa-spa', desc: 'Celebrity bridal artists, HD airbrush makeup, couture hair styling, saree/lehenga draping, and pre-bridal skin luxury.' },
  { id: 'srv-5', no: 5, name: 'Mehndi Artists', icon: 'fa-hand-sparkles', desc: 'Master Rajasthani and Marwari bridal henna artists crafting intricate customized love stories and portraits in organic henna.' },
  { id: 'srv-6', no: 6, name: 'Pandit Ji & Religious Ceremonies', icon: 'fa-om', desc: 'Learned Vedic Brahmins for Vivah Sanskar, Pheras, Havan, Satyanarayan Katha, Griha Pravesh, Mata Ki Chowki & all 16 Vedic rituals.' },
  { id: 'srv-7', no: 7, name: 'DJ, Sound & Entertainment', icon: 'fa-compact-disc', desc: 'Concert line-array sound systems, intelligent beam truss lights, celebrity DJs, LED video walls, and interactive dance floors.' },
  { id: 'srv-8', no: 8, name: 'Dhol, Band & Baraat', icon: 'fa-drum', desc: 'Traditional Punjabi & Nashik dhol ensembles, royal brass brass band, decorated elephants/horses, and choreographed baraat energy.' },
  { id: 'srv-9', no: 9, name: 'Floral Decoration', icon: 'fa-seedling', desc: 'Imported Dutch roses, cascading orchids, white hydrangeas, traditional marigolds, and fragrant mogra installations.' },
  { id: 'srv-10', no: 10, name: 'Bridal & Groom Entry', icon: 'fa-gem', desc: 'Signature grand entries with phoolon ki chadar, vintage royal palki, low-smoke dry ice cloud fog, and eco cold pyro fireworks.' },
  { id: 'srv-11', no: 11, name: 'Wedding Venue Booking', icon: 'fa-landmark', desc: 'Exclusive negotiated partner rates across Agra’s finest 5-star hotels, palaces, banquet halls, and luxury farmhouses.' },
  { id: 'srv-12', no: 12, name: 'Tent, Furniture & Lighting', icon: 'fa-campground', desc: 'German hanger air-conditioned waterproof superstructures, imperial royal couches, Chiavari chairs, and fairy light mesh.' },
  { id: 'srv-13', no: 13, name: 'Wedding Invitations & Gifts', icon: 'fa-envelope-open-text', desc: 'Bespoke laser-cut invitation suites, animated video cards, customized sweets hampers, and guest welcome gift bags.' },
  { id: 'srv-14', no: 14, name: 'Dance Choreography & Anchoring', icon: 'fa-person-booth', desc: 'Professional Sangeet choreographers, celebrity anchors/emcees, concept scripts, and family performance coaching.' },
  { id: 'srv-15', no: 15, name: 'Transportation & Logistics', icon: 'fa-car-side', desc: 'Royal vintage cars for groom’s baraat, luxury Mercedes/Audi convoys, AC sleeper coaches for guests, and airport pickups.' },
  { id: 'srv-16', no: 16, name: 'Guest Hospitality & Security', icon: 'fa-user-shield', desc: 'Dedicated hotel helpdesks, personalized baggage concierges, RSVP management, trained bouncers, and valet services.' },
  { id: 'srv-17', no: 17, name: 'Complete Wedding Planning', icon: 'fa-clipboard-check', desc: 'Comprehensive 360-degree turnkey planning, budget optimization, vendor liaison, timeline scheduling, and run-of-show execution.' },
  { id: 'srv-18', no: 18, name: 'Destination Wedding Management', icon: 'fa-plane-departure', desc: 'Full destination orchestration in Agra, Jaipur, Udaipur, Goa, and Delhi NCR with local vendor negotiation and logistics.' }
];

// Music & Live Entertainment Sub-Services
const DEFAULT_MUSIC_SERVICES = [
  { id: 'mus-1', name: 'Ghazal Night & Sufi Mehfil', category: 'Mehfil & Sufi', duration: '3 - 4 Hours', price: 25000, icon: 'fa-microphone-lines', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', desc: 'Soulful live Mehfil-e-Ghazal singers with harmonium, tabla, and acoustic instruments creating a serene poetic ambiance.', popular: true },
  { id: 'mus-2', name: 'Jagran & Bhajan Sandhya', category: 'Devotional & Sacred', duration: 'All Night / 4-6 Hours', price: 25000, icon: 'fa-hands-praying', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', desc: 'Devotional singer troupes, akhand darbar, live dholak, chimta, harmonium, and spiritual aarti for uplifting divine celebrations.', popular: true },
  { id: 'mus-3', name: 'Mata Ki Chowki', category: 'Devotional & Sacred', duration: '3 - 4 Hours', price: 30000, icon: 'fa-fire', image: 'https://images.unsplash.com/photo-1609800318047-9ea8848a2872?auto=format&fit=crop&w=800&q=80', desc: 'Traditional red floral darbar setup, devotional sangeet, and live bhajans seeking divine blessings for bride and groom.', popular: true },
  { id: 'mus-4', name: 'Interactive Karaoke Night', category: 'DJ & Modern', duration: '3 - 4 Hours', price: 12000, icon: 'fa-microphone', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', desc: 'Engaging family interactive singing setups with dual screens, wireless microphones, curated song playlists & host.' },
  { id: 'mus-5', name: 'Classical Instrumental Ensemble', category: 'Live Bands & Classical', duration: '3 - 4 Hours', price: 18000, icon: 'fa-guitar', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', desc: 'Melodious classical ensembles: Shehnai for baraat, Sitar, Flute, and live Violinists for dining and reception hours.' },
  { id: 'mus-6', name: 'Rajasthani Folk & Chari Dancers', category: 'Folk & Cultural', duration: '2 - 3 Hours', price: 20000, icon: 'fa-sun', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', desc: 'Authentic Manganiyar folk singers, Morchang players, and graceful Chari fire dancers for royal traditional charm.', popular: true },
  { id: 'mus-7', name: 'Acoustic Bollywood & Sufi Band', category: 'Live Bands & Classical', duration: '3 - 4 Hours', price: 22000, icon: 'fa-music', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80', desc: 'Unplugged Bollywood and Sufi acoustic bands for intimate cocktail parties, poolside mehendi, and sundowner hours.' },
  { id: 'mus-8', name: 'Wedding Sangeet Performances', category: 'Live Bands & Classical', duration: 'Full Evening', price: 25000, icon: 'fa-people-group', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80', desc: 'Custom audio soundtracks, concert sound engineering, choreographed family group dances & grand stage entries.' },
  { id: 'mus-9', name: 'Dance Troupe & LED Tron Acts', category: 'Dancers & Anchors', duration: '2 - 3 Hours', price: 35000, icon: 'fa-person-running', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', desc: 'Professional Bollywood dancers, LED Tron light dancers, Russian performers, and international welcome troupes.' },
  { id: 'mus-10', name: 'Celebrity Anchor & Music Host', category: 'Dancers & Anchors', duration: 'Full Function', price: 15000, icon: 'fa-bullhorn', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', desc: 'High-energy bilingual celebrity anchors to engage guests, conduct interactive games, and host functions seamlessly.' },
  { id: 'mus-11', name: 'Live Sufi Qawwali Ensemble', category: 'Mehfil & Sufi', duration: '3 - 4 Hours', price: 28000, icon: 'fa-compact-disc', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80', desc: 'Mesmerizing Sufi Qawwali troupe with traditional clapping clappers, harmonium, and dholak creating a mystical spiritual high.' },
  { id: 'mus-12', name: 'Royal Punjabi Dhol & Bhangra Squad', category: 'Folk & Cultural', duration: '2 - 3 Hours', price: 22000, icon: 'fa-drum', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', desc: 'Energetic Punjabi dhol beats, festive boliyan, and vibrant Bhangra dancers to electrify baraat processions and sangeet night.' }
];

// 15 Pandit Ji & Religious Pooja Ceremonies (Image 6 & 7)
const DEFAULT_PANDIT_CEREMONIES = [
  { id: 'puj-1', name: 'Wedding Pandit Ji & Vivah Sanskar', duration: '3 - 4 Hours', price: 11000, image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', desc: 'Complete Vedic wedding rites: Kanyadaan, Panigrahana, Saptapadi (7 Pheras), Havan, and sacred mantras.' },
  { id: 'puj-2', name: 'Roka & Engagement Puja', duration: '1 - 2 Hours', price: 5100, image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80', desc: 'Lord Ganesha invocation, Tilak ceremony, Kundali Milan review, and shagun blessings.' },
  { id: 'puj-3', name: 'Ganesh Puja (Vighnaharta Sthapana)', duration: '1 Hour', price: 3100, image: 'https://images.unsplash.com/photo-1567591414240-e2ff0c48e895?auto=format&fit=crop&w=800&q=80', desc: 'Inaugural ceremony before all festivities to remove obstacles and invoke auspicious grace.' },
  { id: 'puj-4', name: 'Haldi & Mehndi Puja', duration: '1 Hour', price: 3500, image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', desc: 'Traditional Vedic cleansing rituals, turmeric blessing, and prayers for health and radiance.' },
  { id: 'puj-5', name: 'Griha Pravesh Puja & Vastu Shanti', duration: '2 - 3 Hours', price: 7100, image: 'https://images.unsplash.com/photo-1609800318047-9ea8848a2872?auto=format&fit=crop&w=800&q=80', desc: 'Navagraha havan, Vastu Purush invocation, cow worship, and boiling milk ritual for new homes.' },
  { id: 'puj-6', name: 'Satyanarayan Katha', duration: '2 Hours', price: 4100, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', desc: 'Sacred narrative recital of Lord Vishnu, panchamrit offering, havan, and satvik prasad.' },
  { id: 'puj-7', name: 'Havan & Yagya', duration: '1.5 - 2 Hours', price: 5100, image: 'https://images.unsplash.com/photo-1609800318047-9ea8848a2872?auto=format&fit=crop&w=800&q=80', desc: 'Purifying fire rituals with authentic Vedic samagri, ghee, and mantras for positive household energy.' },
  { id: 'puj-8', name: 'Mata Ki Chowki', duration: '3 - 4 Hours', price: 11000, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', desc: 'Devotional prayers, Akhand Jyot invocation, Mata ki bhent recital, and Aarti.' },
  { id: 'puj-9', name: 'Mundan Sanskar (Chudakarana)', duration: '1 Hour', price: 3100, image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', desc: 'First sacred haircut ceremony for the child with Vedic purification rites.' },
  { id: 'puj-10', name: 'Naamkaran Sanskar (Naming Ceremony)', duration: '1 Hour', price: 3100, image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80', desc: 'Auspicious naming of the newborn based on Janma Nakshatra and astrological guidance.' },
  { id: 'puj-11', name: 'Anniversary Puja', duration: '1.5 Hours', price: 4100, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', desc: 'Gauri-Shankar prayers celebrating matrimonial harmony and seeking long-term prosperity.' },
  { id: 'puj-12', name: 'Vastu Shanti Puja', duration: '2 Hours', price: 6100, image: 'https://images.unsplash.com/photo-1567591414240-e2ff0c48e895?auto=format&fit=crop&w=800&q=80', desc: 'Rectification of residential/commercial directional energies for peace and abundance.' },
  { id: 'puj-13', name: 'Rudrabhishek (Lord Shiva Puja)', duration: '2 Hours', price: 5100, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', desc: 'Sacred Jal and Panchamrit abhishek of Shivlingam with chanting of Shri Rudram.' },
  { id: 'puj-14', name: 'Mahamrityunjaya Jaap', duration: 'Custom', price: 15000, image: 'https://images.unsplash.com/photo-1609800318047-9ea8848a2872?auto=format&fit=crop&w=800&q=80', desc: 'Chanting and havan for health, longevity, and liberation from chronic adversity.' },
  { id: 'puj-15', name: 'Other Religious & Custom Sanskars', duration: 'Flexible', price: 5100, image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', desc: 'Customized rituals according to your regional traditions (North Indian, Marwari, Punjabi, Gujarati).' }
];

// Agra Venue Directory (Image 1, 2 & 3)
const DEFAULT_AGRA_VENUES = [
  {
    id: 'vn-1',
    name: 'Jaypee Palace Hotel & Convention Centre',
    location: 'Fatehabad Road, Agra',
    category: '5-Star Luxury Resort & Palatial Lawn',
    capacity: '200 - 3,000 Guests',
    pricePerPlate: '₹2,800+',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: '25 acres of landscaped Mughal gardens, regal banqueting halls, red sandstone palatial facades, and state-of-the-art wedding spaces.'
  },
  {
    id: 'vn-2',
    name: 'ITC Mughal - A Luxury Collection Hotel',
    location: 'Taj Ganj, Agra',
    category: 'Heritage 5-Star Hotel',
    capacity: '150 - 1,500 Guests',
    pricePerPlate: '₹3,200+',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Winner of the Aga Khan Award for Architecture, offering sprawling royal lawns, majestic ballroom dining, and proximity to the Taj Mahal.'
  },
  {
    id: 'vn-3',
    name: 'Taj Hotel & Convention Centre, Agra',
    location: 'Taj East Gate Road, Agra',
    category: 'Premium Convention Resort',
    capacity: '250 - 2,000 Guests',
    pricePerPlate: '₹2,600+',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    description: 'Breathtaking rooftop views of the Taj Mahal, pillar-less grand ballroom, luxury bridal dressing suites, and contemporary elegance.'
  },
  {
    id: 'vn-4',
    name: 'Courtyard by Marriott Agra',
    location: 'Fatehabad Road, Agra',
    category: 'Contemporary 5-Star Hotel',
    capacity: '100 - 800 Guests',
    pricePerPlate: '₹2,200+',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    description: 'Sophisticated event spaces, outdoor poolside party zones, renowned culinary banquet spreads, and high-touch hospitality.'
  },
  {
    id: 'vn-5',
    name: 'Hotel Clarks Shiraz',
    location: 'Idgah, Agra Cantt',
    category: 'Heritage Luxury Hotel',
    capacity: '100 - 1,200 Guests',
    pricePerPlate: '₹1,900+',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    description: 'Agra’s legacy hospitality destination with lush manicured lawns, classical Mughal interiors, and banquet suites for grand sangeets.'
  },
  {
    id: 'vn-6',
    name: 'Shahdra & Yamuna Riverside Royal Lawns',
    location: 'Shahdra, Agra',
    category: 'Sprawling Wedding Farmhouse & Lawns',
    capacity: '300 - 2,500 Guests',
    pricePerPlate: '₹1,500+ / Custom Lawn Hire',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Large open-air green acreage ideal for majestic mandaps, super-structure German hangers, massive parking, and grand fireworks.'
  }
];

class Store {
  constructor() {
    this.initStore();
  }

  initStore() {
    // Initial settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        companyPhone: '+91 8279622416',
        companyLocation: 'Shahdra, Agra, Uttar Pradesh'
      }));
    }

    // Clean real customer database: Start with empty array (no mock data)
    const existingBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!existingBookings) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    } else {
      // Purge any legacy sample mock data IDs
      try {
        const parsed = JSON.parse(existingBookings);
        const cleaned = parsed.filter(b => b.id !== 'NC-2026-001' && b.id !== 'NC-2026-002' && b.id !== 'NC-2026-003');
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(cleaned));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
      }
    }

    // Initialize dynamic events in localStorage if not set
    if (!localStorage.getItem('nc_events')) {
      localStorage.setItem('nc_events', JSON.stringify(DEFAULT_EVENTS));
    }
  }

  // Purge all sample / test data tool for clean database
  purgeAllMockData() {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    return true;
  }

  // --- Two-Tier Admin Security & Role Management ---
  _safeSetSession(key, val) {
    try { sessionStorage.setItem(key, val); } catch (e) {}
    try { localStorage.setItem(key, val); } catch (e) {}
    if (typeof window !== 'undefined') window[key] = val;
  }

  _safeGetSession(key) {
    try {
      const v = sessionStorage.getItem(key);
      if (v) return v;
    } catch (e) {}
    try {
      const v = localStorage.getItem(key);
      if (v) return v;
    } catch (e) {}
    if (typeof window !== 'undefined') return window[key] || null;
    return null;
  }

  checkAdminAuth() {
    return this._safeGetSession(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  getAdminRole() {
    return this._safeGetSession('nc_admin_role') || 'SUPER_ADMIN';
  }

  isSuperAdmin() {
    return this.getAdminRole() === 'SUPER_ADMIN';
  }

  loginAdmin(inputPassword) {
<<<<<<< HEAD
    const p = String(inputPassword || '').trim();
    const pLower = p.toLowerCase();

    // If empty or matches any of these, grant access
    let superPass = 'Iamwurtzite@8445';
    try { superPass = localStorage.getItem('nc_admin_super_password') || 'Iamwurtzite@8445'; } catch (e) {}

    let staffPass = 'naishvi@123';
    try { staffPass = localStorage.getItem('nc_admin_staff_password') || 'naishvi@123'; } catch (e) {}

    const isSuper = (
      p === '' ||
=======
    if (!inputPassword) return false;
    const p = String(inputPassword).trim();
    const pLower = p.toLowerCase();

    // Super Admin Passwords (case-insensitive & easy master fallbacks)
    const superPass = localStorage.getItem('nc_admin_super_password') || 'Iamwurtzite@8445';
    const isSuper = (
>>>>>>> 0e1c2776e124518e5d5d38bec6903831d10f78fa
      p === superPass ||
      pLower === 'iamwurtzite@8445' ||
      pLower === 'iamwurtzite' ||
      pLower === 'admin' ||
      pLower === 'admin123' ||
      pLower === 'admin@123' ||
<<<<<<< HEAD
      pLower === 'naishviadmin' ||
      pLower === 'rishik' ||
      pLower === 'shyam'
    );

    if (isSuper) {
      this._safeSetSession(STORAGE_KEYS.ADMIN_AUTH, 'true');
      this._safeSetSession('nc_admin_role', 'SUPER_ADMIN');
      return { success: true, role: 'SUPER_ADMIN' };
    }

=======
      pLower === 'naishviadmin'
    );

    if (isSuper) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      sessionStorage.setItem('nc_admin_role', 'SUPER_ADMIN');
      return { success: true, role: 'SUPER_ADMIN' };
    }

    // Staff Admin Passwords (case-insensitive)
    const staffPass = localStorage.getItem('nc_admin_staff_password') || 'naishvi@123';
>>>>>>> 0e1c2776e124518e5d5d38bec6903831d10f78fa
    const isStaff = (
      p === staffPass ||
      pLower === 'naishvi@123' ||
      pLower === 'naishvi123' ||
      pLower === 'naishvi'
    );

    if (isStaff) {
<<<<<<< HEAD
      this._safeSetSession(STORAGE_KEYS.ADMIN_AUTH, 'true');
      this._safeSetSession('nc_admin_role', 'STAFF_ADMIN');
=======
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      sessionStorage.setItem('nc_admin_role', 'STAFF_ADMIN');
>>>>>>> 0e1c2776e124518e5d5d38bec6903831d10f78fa
      return { success: true, role: 'STAFF_ADMIN' };
    }

    return false;
  }

  changeAdminPassword(currentPass, newPass, targetRole = 'SUPER_ADMIN') {
    if (!currentPass || !newPass) {
      return { success: false, message: 'Please provide current and new passwords.' };
    }
    const curr = currentPass.trim();
    const superPass = localStorage.getItem('nc_admin_super_password') || 'Iamwurtzite@8445';

    // Strictly enforce: Only Super Admin can modify passwords
    if (curr !== superPass && curr !== 'Iamwurtzite@8445') {
      return { success: false, message: 'Access Denied: Only Super Administrator can update access passwords.' };
    }
    if (newPass.trim().length < 5) {
      return { success: false, message: 'New password must be at least 5 characters long.' };
    }

    if (targetRole === 'STAFF_ADMIN') {
      localStorage.setItem('nc_admin_staff_password', newPass.trim());
      return { success: true, message: `Staff Password updated successfully to: ${newPass.trim()}` };
    } else {
      localStorage.setItem('nc_admin_super_password', newPass.trim());
      return { success: true, message: 'Super Admin Password (Iamwurtzite) updated successfully!' };
    }
  }

  logoutAdmin() {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    sessionStorage.removeItem('nc_admin_role');
  }

  // --- Notification Multi-Email Settings (Protected for Super Admin) ---
  getNotificationEmails() {
    return localStorage.getItem('nc_notification_emails') || 'naishvieventempire@gmail.com';
  }

  setNotificationEmails(emailsString) {
    if (!this.isSuperAdmin()) {
      return { error: true, message: 'Access Denied: Only Super Admin can change notification emails.' };
    }
    if (!emailsString || !emailsString.trim()) {
      emailsString = 'naishvieventempire@gmail.com';
    }
    localStorage.setItem('nc_notification_emails', emailsString.trim());
    return { success: true, value: emailsString.trim() };
  }

  // --- Dynamic Events & Ceremony Management ---
  getEvents() {
    const custom = localStorage.getItem('nc_events');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error reading nc_events:', e);
      }
    }
    localStorage.setItem('nc_events', JSON.stringify(DEFAULT_EVENTS));
    return DEFAULT_EVENTS;
  }

  saveEvents(events) {
    localStorage.setItem('nc_events', JSON.stringify(events));
    return events;
  }

  addEvent(eventData) {
    const events = this.getEvents();
    const newEvent = {
      id: eventData.id || ('evt_' + Date.now()),
      name: eventData.name,
      category: eventData.category || 'Celebration',
      tagline: eventData.tagline || '',
      image: eventData.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      description: eventData.description || '',
      basePrice: Number(eventData.basePrice) || 35000,
      packagesAvailable: eventData.packagesAvailable || ['Silver', 'Gold', 'Platinum']
    };
    events.unshift(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  updateEvent(eventId, updateData) {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...updateData };
      this.saveEvents(events);
      return events[idx];
    }
    return null;
  }

  deleteEvent(eventId) {
    let events = this.getEvents();
    events = events.filter(e => e.id !== eventId);
    this.saveEvents(events);
    return true;
  }

  resetEventsToDefault() {
    localStorage.setItem('nc_events', JSON.stringify(DEFAULT_EVENTS));
    return DEFAULT_EVENTS;
  }

  // --- Central Webhook Helper ---
  getGoogleSheetWebhookUrl() {
    return (typeof window !== 'undefined' && window.NC_CONFIG && window.NC_CONFIG.GOOGLE_SHEET_WEBHOOK)
      || (typeof localStorage !== 'undefined' && localStorage.getItem('nc_google_sheet_webhook'))
      || '';
<<<<<<< HEAD
  }
=======
  },
>>>>>>> 0e1c2776e124518e5d5d38bec6903831d10f78fa

  // --- Dynamic Gallery Photo Management ---
  getCustomGalleryPhotos() {
    return JSON.parse(localStorage.getItem('nc_custom_gallery') || '[]');
  },

  async fetchLiveGalleryPhotos() {
    const webhookUrl = this.getGoogleSheetWebhookUrl();
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const sep = webhookUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${webhookUrl}${sep}action=getGallery&t=${Date.now()}`);
        if (res.ok) {
          const result = await res.json();
          if (result && result.status === 'success' && Array.isArray(result.photos)) {
            localStorage.setItem('nc_custom_gallery', JSON.stringify(result.photos));
            return result.photos;
          }
        }
      } catch (err) {
        console.warn('Notice: Could not fetch live photos from Google Sheet, using local cache:', err);
      }
    }
    return this.getCustomGalleryPhotos();
<<<<<<< HEAD
  }
=======
  },
>>>>>>> 0e1c2776e124518e5d5d38bec6903831d10f78fa

  async uploadGalleryPhotoToGoogle(photoData) {
    const webhookUrl = this.getGoogleSheetWebhookUrl();
    const tempId = 'gal_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newPhoto = {
      id: tempId,
      category: (photoData.category || 'roka').toLowerCase(),
      title: photoData.title || 'Royal Celebration Moment',
      location: photoData.location || 'Agra, UP',
      image: photoData.image,
      createdAt: new Date().toISOString()
    };

    // Save to local cache first for instant optimistic update
    const photos = this.getCustomGalleryPhotos();
    photos.unshift(newPhoto);
    localStorage.setItem('nc_custom_gallery', JSON.stringify(photos));
<<<<<<< HEAD

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const payload = {
          action: 'uploadGallery',
          sheet: 'Gallery',
          photo: newPhoto
        };

        // Standard fetch to receive universal Google Drive CDN link
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.status === 'success' && json.photo) {
            // Update photo in local cache with the public Google Drive CDN URL
            const updatedPhotos = this.getCustomGalleryPhotos().map(p => {
              if (p.id === tempId) {
                return { ...p, id: json.photo.id, image: json.photo.image };
              }
              return p;
            });
            localStorage.setItem('nc_custom_gallery', JSON.stringify(updatedPhotos));
            return json.photo;
          }
        }
      } catch (err) {
        // Fallback with no-cors if browser blocked reading response
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'uploadGallery', sheet: 'Gallery', photo: newPhoto })
          });
        } catch (noCorsErr) {
          console.warn('Network sync notice on upload:', noCorsErr);
        }
      }
    }
    return newPhoto;
  }

  addCustomGalleryPhoto(photoData) {
    return this.uploadGalleryPhotoToGoogle(photoData);
  }
=======

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const payload = {
          action: 'uploadGallery',
          sheet: 'Gallery',
          photo: newPhoto
        };

        // Standard fetch to receive universal Google Drive CDN link
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.status === 'success' && json.photo) {
            // Update photo in local cache with the public Google Drive CDN URL
            const updatedPhotos = this.getCustomGalleryPhotos().map(p => {
              if (p.id === tempId) {
                return { ...p, id: json.photo.id, image: json.photo.image };
              }
              return p;
            });
            localStorage.setItem('nc_custom_gallery', JSON.stringify(updatedPhotos));
            return json.photo;
          }
        }
      } catch (err) {
        // Fallback with no-cors if browser blocked reading response
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'uploadGallery', sheet: 'Gallery', photo: newPhoto })
          });
        } catch (noCorsErr) {
          console.warn('Network sync notice on upload:', noCorsErr);
        }
      }
    }
    return newPhoto;
  },

  addCustomGalleryPhoto(photoData) {
    return this.uploadGalleryPhotoToGoogle(photoData);
  },
>>>>>>> 0e1c2776e124518e5d5d38bec6903831d10f78fa

  async deleteCustomGalleryPhoto(id) {
    let photos = this.getCustomGalleryPhotos();
    photos = photos.filter(p => p.id !== id);
    localStorage.setItem('nc_custom_gallery', JSON.stringify(photos));

    const webhookUrl = this.getGoogleSheetWebhookUrl();
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'deleteGallery', id: id })
        });
      } catch (err) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'deleteGallery', id: id })
          });
        } catch (e) {}
      }
    }
    return true;
  }

  getSettings() {
    return {
      companyPhone: '+91 8279622416',
      companyLocation: 'Shahdra, Agra, Uttar Pradesh'
    };
  }

  // --- Catalogs & Dynamic Card Management ---
  get18Services() { return DEFAULT_18_SERVICES; }

  // Venues Dynamic Management
  getAgraVenues() {
    const custom = localStorage.getItem('nc_venues');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('nc_venues', JSON.stringify(DEFAULT_AGRA_VENUES));
    return DEFAULT_AGRA_VENUES;
  }
  updateAgraVenue(id, updateData) {
    const list = this.getAgraVenues();
    const idx = list.findIndex(v => v.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      localStorage.setItem('nc_venues', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }
  resetVenuesToDefault() {
    localStorage.setItem('nc_venues', JSON.stringify(DEFAULT_AGRA_VENUES));
    return DEFAULT_AGRA_VENUES;
  }

  // Music Services Dynamic Management
  getMusicServices() {
    const custom = localStorage.getItem('nc_music');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('nc_music', JSON.stringify(DEFAULT_MUSIC_SERVICES));
    return DEFAULT_MUSIC_SERVICES;
  }
  updateMusicService(id, updateData) {
    const list = this.getMusicServices();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      localStorage.setItem('nc_music', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }
  resetMusicToDefault() {
    localStorage.setItem('nc_music', JSON.stringify(DEFAULT_MUSIC_SERVICES));
    return DEFAULT_MUSIC_SERVICES;
  }

  // Pandit Ceremonies Dynamic Management
  getPanditCeremonies() {
    const custom = localStorage.getItem('nc_pandit');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('nc_pandit', JSON.stringify(DEFAULT_PANDIT_CEREMONIES));
    return DEFAULT_PANDIT_CEREMONIES;
  }
  updatePanditCeremony(id, updateData) {
    const list = this.getPanditCeremonies();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      localStorage.setItem('nc_pandit', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }
  resetPanditToDefault() {
    localStorage.setItem('nc_pandit', JSON.stringify(DEFAULT_PANDIT_CEREMONIES));
    return DEFAULT_PANDIT_CEREMONIES;
  }

  // --- Bookings ---
  getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  getBookingById(id) {
    const list = this.getBookings();
    return list.find(b => b.id.toLowerCase() === id.toLowerCase() || b.mobile.replace(/[^0-9]/g, '') === id.replace(/[^0-9]/g, ''));
  }

  // --- Duplicate & Rate Limit Check (Same Day Multiple Order Prevention) ---
  canSubmitBooking(mobile, eventDate = null) {
    if (!mobile) return { allowed: false, message: 'Please provide a valid WhatsApp mobile number.' };

    const cleanMobile = String(mobile).replace(/[^0-9]/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      return { allowed: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const list = this.getBookings();
    const todayDateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Enforce: Same user and mobile number cannot submit multiple orders on the same day
    const existing = list.find(b => {
      const bMobile = String(b.mobile || '').replace(/[^0-9]/g, '').slice(-10);
      if (bMobile !== cleanMobile) return false;

      // 1. Same-day submission restriction:
      const bCreated = (b.createdAt || '').slice(0, 10);
      if (bCreated === todayDateStr) {
        return true;
      }

      // 2. Same event date restriction:
      if (eventDate && b.eventDate && b.eventDate === eventDate) {
        return true;
      }

      return false;
    });

    if (existing) {
      return {
        allowed: false,
        isDuplicate: true,
        existingBooking: existing,
        message: `An active booking request (Ref: ${existing.id}) has already been registered today for mobile number +91 ${cleanMobile}. Multiple orders on the same day with the same mobile number are restricted to avoid duplicate entries.`
      };
    }

    return { allowed: true };
  }

  createBooking(data) {
    // Validate same-day duplicate order prevention
    const check = this.canSubmitBooking(data.mobile, data.eventDate);
    if (!check.allowed) {
      return {
        error: true,
        code: 'DUPLICATE_ORDER',
        message: check.message,
        existingBooking: check.existingBooking
      };
    }

    const list = this.getBookings();
    const newId = `NC-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const newBooking = {
      id: newId,
      customerName: data.customerName,
      mobile: data.mobile,
      email: data.email || '',
      events: data.events || ['Wedding'],
      eventDate: data.eventDate || '',
      location: data.location || 'Agra',
      guests: data.guests || '250-500',
      packageId: data.packageId || 'custom',
      packageName: data.packageName || 'Custom Package',
      budget: data.budget || 'Custom',
      services: data.services || [],
      panditRequirements: data.panditRequirements || null,
      specialNotes: data.specialNotes || '',
      status: 'Pending',
      coordinator: 'Assigned on Booking Confirmation',
      coordinatorPhone: '',
      createdAt: new Date().toISOString(),
      advancePaid: 0,
      totalQuoted: 0,
      quotationId: null
    };

    list.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));

    // Automatically sync order to Google Sheets and dispatch email to naishvieventempire@gmail.com
    this.dispatchOrderToGoogleSheetsAndEmail(newBooking);

    return newBooking;
  }

  // --- Google Sheets & Instant Email Dispatcher Engine ---
  async dispatchOrderToGoogleSheetsAndEmail(booking) {
    const WEBHOOK_URL = this.getGoogleSheetWebhookUrl();
    const ADMIN_EMAIL = this.getNotificationEmails();

    const payload = {
      sheet: booking.panditRequirements ? 'Pandit_Ji_Poojas' : 'Bookings',
      adminEmail: ADMIN_EMAIL,
      data: {
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        bookingId: booking.id,
        customerName: booking.customerName,
        mobile: booking.mobile,
        email: booking.email || 'Not provided',
        eventDate: booking.eventDate || 'Upcoming',
        location: booking.location || 'Agra',
        guests: booking.guests || 'N/A',
        events: Array.isArray(booking.events) ? booking.events.join(', ') : (booking.events || 'Wedding'),
        services: Array.isArray(booking.services) ? booking.services.join(', ') : (booking.services || 'Bespoke Package'),
        package: booking.packageName || 'Custom Package',
        budget: booking.budget || 'Custom',
        notes: booking.specialNotes || 'None',
        status: booking.status || 'Pending Review',
        ceremony: booking.panditRequirements ? booking.panditRequirements.ceremony : '',
        language: booking.panditRequirements ? booking.panditRequirements.language : '',
        samagri: booking.panditRequirements ? booking.panditRequirements.samagri : ''
      }
    };

    if (WEBHOOK_URL && WEBHOOK_URL.startsWith('http')) {
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log('✅ Real-time sync: Logged to Google Sheet and email dispatched to ' + ADMIN_EMAIL);
      } catch (err) {
        console.warn('Network sync notice:', err);
      }
    }
  }

  // --- Quotations ---
  getQuotations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
  }

  getQuotationById(id) {
    const list = this.getQuotations();
    return list.find(q => q.id.toLowerCase() === id.toLowerCase() || q.bookingId.toLowerCase() === id.toLowerCase());
  }

  createQuotation(quoteData) {
    const list = this.getQuotations();
    const newId = `QUO-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const subtotal = quoteData.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const discount = Number(quoteData.discount || 0);
    const totalAmount = subtotal - discount;
    const advanceRequired = Math.round(totalAmount * 0.3);

    const newQuote = {
      id: newId,
      bookingId: quoteData.bookingId,
      customerName: quoteData.customerName,
      mobile: quoteData.mobile,
      date: new Date().toISOString().split('T')[0],
      items: quoteData.items,
      subtotal,
      discount,
      totalAmount,
      advanceRequired: quoteData.advanceRequired || advanceRequired,
      advancePaid: 0,
      remainingBalance: totalAmount,
      status: 'Sent',
      paymentMethod: null,
      paymentDate: null,
      txnId: null
    };

    list.unshift(newQuote);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(list));

    // Update booking
    const bookings = this.getBookings();
    const bIndex = bookings.findIndex(b => b.id === quoteData.bookingId);
    if (bIndex !== -1) {
      bookings[bIndex].status = 'Quoted';
      bookings[bIndex].totalQuoted = totalAmount;
      bookings[bIndex].quotationId = newId;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

    return newQuote;
  }

  recordPayment(quoteId, paymentDetails) {
    const quotations = this.getQuotations();
    const qIndex = quotations.findIndex(q => q.id === quoteId);
    if (qIndex === -1) return null;

    const q = quotations[qIndex];
    const amountPaid = Number(paymentDetails.amount);
    q.advancePaid = (q.advancePaid || 0) + amountPaid;
    q.remainingBalance = Math.max(0, q.totalAmount - q.advancePaid);
    q.status = q.remainingBalance === 0 ? 'Fully Paid' : 'Approved';
    q.paymentMethod = paymentDetails.method;
    q.paymentDate = new Date().toISOString();
    q.txnId = paymentDetails.txnId || `TXN-${Date.now()}`;

    quotations[qIndex] = q;
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));

    // Update booking status & assign dedicated coordinator (Feature 7)
    const bookings = this.getBookings();
    const bIndex = bookings.findIndex(b => b.id === q.bookingId);
    if (bIndex !== -1) {
      bookings[bIndex].status = 'Confirmed';
      bookings[bIndex].advancePaid = q.advancePaid;
      bookings[bIndex].coordinator = 'Vikram Singh (Senior Wedding Director)';
      bookings[bIndex].coordinatorPhone = '+91 8279622416';
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

    return q;
  }

  // --- Vendors ---
  getVendors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
  }

  getAssignments(vendorId = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
    if (vendorId) return list.filter(a => a.vendorId === vendorId);
    return list;
  }

  assignVendor(bookingId, vendorId, serviceName, notes = '') {
    const vendors = this.getVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    const booking = this.getBookingById(bookingId);
    if (!vendor || !booking) return null;

    const assignments = this.getAssignments();
    const newAsg = {
      id: `ASG-${Date.now()}`,
      bookingId,
      vendorId,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      serviceName,
      customerName: booking.customerName,
      eventDate: booking.eventDate,
      location: booking.location,
      notes,
      status: 'Assigned',
      assignedAt: new Date().toISOString()
    };

    assignments.unshift(newAsg);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return newAsg;
  }

  // --- Reviews ---
  getReviews() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  }

  addReview(reviewData) {
    const list = this.getReviews();
    const newRev = {
      id: `REV-${Date.now()}`,
      customerName: reviewData.customerName,
      event: reviewData.event,
      rating: Number(reviewData.rating) || 5,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      quote: reviewData.quote,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    };
    list.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));
    return newRev;
  }
}

// Global store initialization
if (typeof window !== 'undefined') {
  window.ncStore = new Store();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Store;
}

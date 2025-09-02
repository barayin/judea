// This file provides a fallback for loading icon categories when fetching JSON fails (e.g., file protocol issues).
window.iconsData = {
  categories: [
    {
      category: "Transportation",
      items: [
        {id: "car", icon: "fa-car", nameHe: "מכונית", nameLat: "Mechonit"},
        {id: "bus", icon: "fa-bus", nameHe: "אוטובוס", nameLat: "Otobus"},
        {id: "bicycle", icon: "fa-bicycle", nameHe: "אופניים", nameLat: "Ofanayim"},
        {id: "train", icon: "fa-train", nameHe: "רכבת", nameLat: "Rakevet"},
        {id: "plane", icon: "fa-plane", nameHe: "מטוס", nameLat: "Matos"},
        {id: "ship", icon: "fa-ship", nameHe: "אנייה", nameLat: "Oniya"},
        {id: "motorcycle", icon: "fa-motorcycle", nameHe: "אופנוע", nameLat: "Ofnoa"}
      ]
    },
    {
      category: "Animals & Nature",
      items: [
        {id: "dog", icon: "fa-dog", nameHe: "כלב", nameLat: "Kelev"},
        {id: "cat", icon: "fa-cat", nameHe: "חתול", nameLat: "Ḥatul"},
        {id: "horse", icon: "fa-horse", nameHe: "סוס", nameLat: "Sus"},
        {id: "fish", icon: "fa-fish", nameHe: "דג", nameLat: "Dag"},
        {id: "frog", icon: "fa-frog", nameHe: "צפרדע", nameLat: "Tsfardea"},
        {id: "tree", icon: "fa-tree", nameHe: "עץ", nameLat: "Ets"},
        {id: "sun", icon: "fa-sun", nameHe: "שמש", nameLat: "Shemesh"},
        {id: "moon", icon: "fa-moon", nameHe: "ירח", nameLat: "Yareaḥ"}
      ]
    },
    {
      category: "Food & Drink",
      items: [
        {id: "apple", icon: "fa-apple-whole", nameHe: "תפוח", nameLat: "Tapuaḥ"},
        {id: "carrot", icon: "fa-carrot", nameHe: "גזר", nameLat: "Gezer"},
        {id: "bread", icon: "fa-bread-slice", nameHe: "לחם", nameLat: "Leḥem"},
        {id: "cheese", icon: "fa-cheese", nameHe: "גבינה", nameLat: "Gvina"},
        {id: "pizza", icon: "fa-pizza-slice", nameHe: "פיצה", nameLat: "Pizza"},
        {id: "burger", icon: "fa-burger", nameHe: "המבורגר", nameLat: "Hamburger"},
        {id: "icecream", icon: "fa-ice-cream", nameHe: "גלידה", nameLat: "Glida"},
        {id: "mug", icon: "fa-mug-hot", nameHe: "ספל", nameLat: "Sefel"}
      ]
    },
    {
      category: "Household & Places",
      items: [
        {id: "house", icon: "fa-house", nameHe: "בית", nameLat: "Bayit"},
        {id: "building", icon: "fa-building", nameHe: "בניין", nameLat: "Binyan"},
        {id: "school", icon: "fa-school", nameHe: "בית ספר", nameLat: "Beit Sefer"},
        {id: "hospital", icon: "fa-hospital", nameHe: "בית חולים", nameLat: "Beit Ḥolim"},
        {id: "bed", icon: "fa-bed", nameHe: "מיטה", nameLat: "Mita"},
        {id: "chair", icon: "fa-chair", nameHe: "כיסא", nameLat: "Kise"},
        {id: "couch", icon: "fa-couch", nameHe: "ספה", nameLat: "Sapa"},
        {id: "lightbulb", icon: "fa-lightbulb", nameHe: "נורה", nameLat: "Nura"}
      ]
    },
    {
      category: "People & Actions",
      items: [
        {id: "user", icon: "fa-user", nameHe: "אדם", nameLat: "Adam"},
        {id: "users", icon: "fa-users", nameHe: "אנשים", nameLat: "Anashim"},
        {id: "child", icon: "fa-child", nameHe: "ילד", nameLat: "Yeled"},
        {id: "running", icon: "fa-person-running", nameHe: "רץ", nameLat: "Rats"},
        {id: "walking", icon: "fa-person-walking", nameHe: "הולך", nameLat: "Holeḥ"},
        {id: "swimming", icon: "fa-person-swimming", nameHe: "שוחה", nameLat: "Soḥe"},
        {id: "biking", icon: "fa-person-biking", nameHe: "רכיבה", nameLat: "Rekhiva"},
        {id: "hiking", icon: "fa-person-hiking", nameHe: "טיול", nameLat: "Tiyul"},
        {id: "snowboarding", icon: "fa-person-snowboarding", nameHe: "סנובורד", nameLat: "Snowboard"},
        {id: "skiing", icon: "fa-person-skiing", nameHe: "סקי", nameLat: "Ski"}
      ]
    },
    {
      category: "UI Actions",
      items: [
        {id: "download", icon: "fa-download", nameHe: "הורדה", nameLat: "Horada"},
        {id: "upload", icon: "fa-upload", nameHe: "העלאה", nameLat: "Haala"},
        {id: "share", icon: "fa-share", nameHe: "שיתוף", nameLat: "Shituf"},
        {id: "pause", icon: "fa-pause", nameHe: "השהיה", nameLat: "Hashhaya"},
        {id: "stop", icon: "fa-stop", nameHe: "עצור", nameLat: "Atzor"}
      ]
    },
    {
      category: "Education & Office",
      items: [
        {id: "book", icon: "fa-book", nameHe: "ספר", nameLat: "Sefer"},
        {id: "pen", icon: "fa-pen", nameHe: "עט", nameLat: "Et"},
        {id: "pencil", icon: "fa-pencil", nameHe: "עיפרון", nameLat: "Iparon"},
        {id: "ruler", icon: "fa-ruler", nameHe: "סרגל", nameLat: "Sargel"},
        {id: "graduation", icon: "fa-graduation-cap", nameHe: "כובע סיום", nameLat: "Kova Siyum"},
        {id: "folder", icon: "fa-folder", nameHe: "תיקיה", nameLat: "Tikiya"}
      ]
    },
    {
      category: "Media & Music",
      items: [
        {id: "camera", icon: "fa-camera", nameHe: "מצלמה", nameLat: "Matslema"},
        {id: "music", icon: "fa-music", nameHe: "מוזיקה", nameLat: "Muzika"},
        {id: "headphones", icon: "fa-headphones", nameHe: "אוזניות", nameLat: "Ozniyot"},
        {id: "microphone", icon: "fa-microphone", nameHe: "מיקרופון", nameLat: "Mikrofon"},
        {id: "film", icon: "fa-film", nameHe: "סרט", nameLat: "Seret"},
        {id: "play", icon: "fa-play", nameHe: "נגן", nameLat: "Nagen"}
      ]
    }
  ]
};

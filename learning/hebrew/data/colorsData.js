// Fallback data for colors game when fetch of colors.json fails
// This file defines a global `colorsData` object with the same structure
// as the JSON file located at `data/colors.json`. It will be used when
// the application is run via the file protocol and cannot fetch JSON.

window.colorsData = {
  categories: [
    {
      category: "Basic",
      items: [
        { id: "red",      color: "#FF0000", nameHe: "אָדֹם",    nameLat: "Adom" },
        { id: "blue",     color: "#0000FF", nameHe: "כָּחֹל",  nameLat: "Kahol" },
        { id: "yellow",   color: "#FFFF00", nameHe: "צָהֹב",  nameLat: "Tzahov" },
        { id: "green",    color: "#008000", nameHe: "יָרֹוק", nameLat: "Yarok" },
        { id: "orange",   color: "#FFA500", nameHe: "כָּתֹם",  nameLat: "Katom" },
        { id: "purple",   color: "#800080", nameHe: "סָגֹול", nameLat: "Sagol" },
        { id: "pink",     color: "#FFC0CB", nameHe: "וָרֹוד", nameLat: "Varod" },
        { id: "brown",    color: "#A52A2A", nameHe: "חוּם",   nameLat: "Chum" },
        { id: "gray",     color: "#808080", nameHe: "אָפֹור", nameLat: "Afor" },
        { id: "black",    color: "#000000", nameHe: "שָׁחֹור", nameLat: "Shachor" },
        { id: "white",    color: "#FFFFFF", nameHe: "לָבָן",   nameLat: "Lavan" }
      ]
    },
    {
      category: "Extended",
      items: [
        { id: "turquoise", color: "#40E0D0", nameHe: "טורקיז",    nameLat: "Turkiz" },
        { id: "beige",     color: "#F5F5DC", nameHe: "בז׳",      nameLat: "Beige" },
        { id: "maroon",    color: "#800000", nameHe: "בּוּרְדוֹ", nameLat: "Bordo" },
        { id: "olive",     color: "#808000", nameHe: "זַיִת",     nameLat: "Zayit" },
        { id: "gold",      color: "#FFD700", nameHe: "זָהָב",    nameLat: "Zahav" },
        { id: "silver",    color: "#C0C0C0", nameHe: "כֶּסֶף",  nameLat: "Kesef" },
        { id: "lightblue", color: "#ADD8E6", nameHe: "תְּכֵלֶת", nameLat: "Tchelet" }
      ]
    }
  ]
};
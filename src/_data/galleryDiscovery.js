import occasions from "./occasions.json" with { type: "json" };
import themes from "./themes.json" with { type: "json" };

const occasionItems = [
  ["all", "All Cakes", "all", ""],
  ["wedding", "Wedding", "occasions", "engagement-wedding"],
  ["anniversary", occasions.anniversary.name, "occasions", "anniversary"],
  ["birthday", occasions.birthday.name, "occasions", "birthday"],
  ["first-birthday-boy", occasions["first-birthday-boy"].name, "occasions", "first-birthday-boy"],
  ["first-birthday-girl", occasions["first-birthday-girl"].name, "occasions", "first-birthday-girl"],
  ["bridal-shower", occasions["bridal-shower"].name, "occasions", "bridal-shower"],
  ["baby-shower", occasions["baby-shower"].name, "occasions", "baby-shower"],
  ["half-birthday", occasions["half-birthday"].name, "occasions", "half-birthday"],
  ["bon-voyage", occasions["bon-voyage"].name, "occasions", "bon-voyage"],
  ["corporate", occasions.corporate.name, "occasions", "corporate"],
  ["smash-cake", occasions["smash-cake"].name, "occasions", "smash-cake"],
  ["baby-announcement", occasions["baby-announcement"].name, "occasions", "baby-announcement"]
];
const themeKeys = ["butterfly", "floral", "jungle", "princess", "superhero", "spider-man", "unicorn", "animal", "car"];
const make = ([key, label, field, value]) => ({ key, label, field, value });
export default {
  occasions: occasionItems.map(make),
  themes: themeKeys.map((key) => ({ key, label: themes[key].name, field: "themes", value: key }))
};

/* ============================================================
   E68 Ingredients - Translations (English / Spanish)
   ============================================================ */

const I18N = {
  en: {
    // End-user view page
    viewTitle: "Food Ingredients",
    viewInstructions:
      "Find your food below. Tap a picture to see its ingredients. Pinch to zoom in.",
    selectInstructions:
      "Tap “Select” to choose several items, then print all their ingredients at once.",
    select: "Select",
    cancel: "Cancel",
    printSelected: "Print selected",
    selectedCount: "{n} selected",
    noItems: "No items have been added yet. Please check back later.",
    loading: "Loading…",
    close: "Close",
    ingredientsFor: "Ingredients",
    switchLang: "Español",
    tapToZoom: "Pinch, scroll, or use + / − to zoom",
    printTitle: "Ingredients",
    nothingSelected: "Please select at least one item first.",
  },
  es: {
    viewTitle: "Ingredientes de Alimentos",
    viewInstructions:
      "Encuentre su alimento abajo. Toque una imagen para ver sus ingredientes. Pellizque para acercar.",
    selectInstructions:
      "Toque “Seleccionar” para elegir varios artículos y luego imprimir todos sus ingredientes a la vez.",
    select: "Seleccionar",
    cancel: "Cancelar",
    printSelected: "Imprimir selección",
    selectedCount: "{n} seleccionados",
    noItems: "Aún no se han agregado artículos. Vuelva a consultar más tarde.",
    loading: "Cargando…",
    close: "Cerrar",
    ingredientsFor: "Ingredientes",
    switchLang: "English",
    tapToZoom: "Pellizque, desplace o use + / − para acercar",
    printTitle: "Ingredientes",
    nothingSelected: "Por favor seleccione al menos un artículo primero.",
  },
};

function getLang() {
  const p = new URLSearchParams(window.location.search).get("lang");
  return p === "es" ? "es" : "en";
}

function t(key, lang) {
  lang = lang || getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

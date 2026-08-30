import React from "react";

const ResultatClassification = ({ resultat }) => {

  // =========================================================
  // CAS : AUCUN RÉSULTAT
  // =========================================================

  if (!resultat) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400">

        <svg
          className="w-12 h-12 mx-auto mb-3 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>

        <p className="font-medium text-sm text-slate-500">
          Aucun résultat à afficher
        </p>

        <p className="text-xs mt-1">
          Saisissez une réclamation puis cliquez sur "Classer la réclamation"
        </p>

      </div>
    );
  }


  // =========================================================
  // DONNÉES DU BACKEND
  // =========================================================

  const {
    id,
    texte,
    langue = "fr",
    categorie,
    score_confiance,
    statut,
    date
  } = resultat;


  // =========================================================
  // TRADUCTIONS INTERFACE
  // =========================================================

  const traductions = {

    fr: {
      resultat: "Résultat de prédiction",
      categorie: "Catégorie attribuée :",
      confiance: "Score de confiance IA :",
      texte: "Texte analysé :",

      haute: "Haute confiance",
      moyenne: "Confiance moyenne",
      faible: "Faible (À vérifier)",

      confiant: "Confiant",
      incertain: "Incertain",
      invalide: "Invalide"
    },

    ar: {
      resultat: "نتيجة التصنيف",
      categorie: "الفئة المصنفة :",
      confiance: "نسبة ثقة الذكاء الاصطناعي :",
      texte: "النص الذي تم تحليله :",

      haute: "ثقة عالية",
      moyenne: "ثقة متوسطة",
      faible: "ثقة ضعيفة",

      confiant: "موثوق",
      incertain: "غير مؤكد",
      invalide: "غير صالح"
    },

    en: {
      resultat: "Prediction Result",
      categorie: "Assigned category:",
      confiance: "AI confidence score:",
      texte: "Analyzed text:",

      haute: "High confidence",
      moyenne: "Medium confidence",
      faible: "Low confidence",

      confiant: "Confident",
      incertain: "Uncertain",
      invalide: "Invalid"
    }
  };


  const t = traductions[langue] || traductions.fr;


  // =========================================================
  // SCORE EN POURCENTAGE
  // =========================================================

  const scorePercent = Math.round(
    Number(score_confiance || 0) * 100
  );


  // =========================================================
  // COULEURS SELON LE SCORE / STATUT
  // =========================================================

  let badgeColor =
    "bg-emerald-100 text-emerald-800 border-emerald-300";

  let barColor =
    "bg-emerald-500";

  let levelLabel =
    t.haute;


  // Cas invalide
  if (statut === "invalide") {

    badgeColor =
      "bg-red-100 text-red-800 border-red-300";

    barColor =
      "bg-red-500";

    levelLabel =
      t.invalide;

  }

  // Cas faible confiance
  else if (scorePercent < 50) {

    badgeColor =
      "bg-red-100 text-red-800 border-red-300";

    barColor =
      "bg-red-500";

    levelLabel =
      t.faible;

  }

  // Cas confiance moyenne
  else if (scorePercent < 80) {

    badgeColor =
      "bg-amber-100 text-amber-800 border-amber-300";

    barColor =
      "bg-amber-500";

    levelLabel =
      t.moyenne;
  }


  // =========================================================
  // LABEL DU STATUT
  // =========================================================

  const statutLabel =
    statut === "confiant"
      ? t.confiant
      : statut === "incertain"
      ? t.incertain
      : statut === "invalide"
      ? t.invalide
      : "";


  // =========================================================
  // ICÔNES PAR CATÉGORIE
  // =========================================================

  const getCategoryIcon = (cat) => {

    const icons = {

      // Français
      "Carte bancaire": "",
      "Paiements par carte": "",
      "Virements": "",
      "Prélèvements": "",
      "Retraits d'espèces": "",
      "Recharges": "",
      "Compte bancaire": "",
      "Change et devises": "",
      "Identité et sécurité": "",
      "Services bancaires": "",
      "Non reconnue": "",

      // Arabe
      "البطاقات المصرفية": "",
      "المدفوعات بالبطاقة": "",
      "التحويلات": "",
      "الخصم المباشر": "",
      "السحب النقدي": "",
      "شحن الرصيد": "",
      "الحساب المصرفي": "",
      "صرف العملات والعملات الأجنبية": "",
      "الهوية والأمان": "",
      "الخدمات المصرفية": "",
      "غير معروفة": "",

      // Anglais
      "Bank Cards": "",
      "Card Payments": "",
      "Transfers": "",
      "Direct Debits": "",
      "Cash Withdrawals": "",
      "Top Ups": "",
      "Bank Account": "",
      "Foreign Exchange": "",
      "Identity and Security": "",
      "Banking Services": "",
      "Not recognized": ""
    };

    return icons[cat] || "";
  };


  // =========================================================
  // AFFICHAGE
  // =========================================================

  return (

    <div
      dir={langue === "ar" ? "rtl" : "ltr"}
      className="
        bg-white
        rounded-2xl
        shadow-md
        border
        border-blue-100
        p-6
        animate-fade-in
        transition-all
      "
    >

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">

        <span
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-blue-600
            bg-blue-50
            px-2.5
            py-1
            rounded-md
          "
        >
          {t.resultat}
        </span>


        {date && (

          <span className="text-xs text-slate-400 font-mono">

            {date}

            {id ? ` #${id}` : ""}

          </span>
        )}

      </div>


      {/* =====================================================
          CATÉGORIE
      ===================================================== */}

      <div className="mb-6">

        <p className="text-xs text-slate-500 font-medium mb-1">
          {t.categorie}
        </p>

        <div className="flex items-center gap-3">

          <span className="text-3xl">
            {getCategoryIcon(categorie)}
          </span>

          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {categorie}
          </h3>

        </div>

      </div>


      {/* =====================================================
          SCORE DE CONFIANCE
      ===================================================== */}

      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">

        <div className="flex items-center justify-between mb-2">

          <span className="text-sm font-semibold text-slate-700">
            {t.confiance}
          </span>


          <div className="flex items-center gap-2">

            <span
              className={`
                text-xs
                px-2
                py-0.5
                rounded-full
                border
                font-semibold
                ${badgeColor}
              `}
            >
              {levelLabel}
            </span>


            <span className="text-lg font-bold text-slate-900 font-mono">
              {scorePercent}%
            </span>

          </div>

        </div>


        {/* Barre de progression */}

        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">

          <div
            className={`
              h-2.5
              rounded-full
              transition-all
              duration-500
              ${barColor}
            `}
            style={{
              width: `${Math.min(scorePercent, 100)}%`
            }}
          />

        </div>


        {/* Statut */}

        {statutLabel && (

          <div className="mt-3 text-xs text-slate-500">

            <span className="font-semibold">
              {langue === "ar"
                ? "الحالة : "
                : langue === "en"
                ? "Status: "
                : "Statut : "}
            </span>

            {statutLabel}

          </div>

        )}

      </div>


      {/* =====================================================
          TEXTE ORIGINAL
      ===================================================== */}

      <div>

        <p className="text-xs text-slate-500 font-medium mb-1">
          {t.texte}
        </p>

        <p
          dir={langue === "ar" ? "rtl" : "ltr"}
          className="
            text-sm
            text-slate-700
            bg-slate-50
            p-3
            rounded-lg
            border
            border-slate-200/60
            italic
            leading-relaxed
          "
        >
          "{texte}"
        </p>

      </div>

    </div>
  );
};


export default ResultatClassification;
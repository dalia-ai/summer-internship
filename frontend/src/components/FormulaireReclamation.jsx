import React, { useState } from "react";
import { classerReclamation } from "../services/api";


const FormulaireReclamation = ({ onClassificationSuccess }) => {

  const [texte, setTexte] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [langue, setLangue] = useState("fr");




  const traductions = {

    fr: {
      titre: "Saisir une Réclamation",
      placeholder: "Saisissez votre réclamation...",
      bouton: "Classer la réclamation",
      loading: "Analyse en cours...",
      effacer: "Effacer",
      erreurVide:
        "Veuillez saisir le texte de la réclamation avant de valider."
    },

    ar: {
      titre: "إدخال شكوى",
      placeholder: "اكتب شكواك المصرفية هنا...",
      bouton: "تصنيف الشكوى",
      loading: "جاري التحليل...",
      effacer: "مسح",
      erreurVide:
        "يرجى إدخال نص الشكوى قبل المتابعة."
    },

    en: {
      titre: "Enter a Complaint",
      placeholder: "Enter your banking complaint...",
      bouton: "Classify complaint",
      loading: "Analyzing...",
      effacer: "Clear",
      erreurVide:
        "Please enter the complaint text before submitting."
    }
  };


  const t = traductions[langue];




  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!texte.trim()) {

      setError(t.erreurVide);

      return;
    }

    setLoading(true);
    setError(null);

    try {

      const resultat = await classerReclamation(
        texte.trim(),
        langue
      );

      onClassificationSuccess(resultat);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };



  const handleClear = () => {

    setTexte("");
    setError(null);
  };




  const handleLangueChange = (nouvelleLangue) => {

    setLangue(nouvelleLangue);

    // On supprime éventuellement un ancien message d'erreur
    setError(null);
  };




  return (

    <div
      className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        p-6
        transition-all
        duration-200
      "
    >

     

      <div className="flex items-center justify-between mb-4">

        <h2
          className="
            text-xl
            font-bold
            text-slate-900
            flex
            items-center
            gap-2
          "
        >

          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="
                M11 5H6a2 2 0 00-2 2v11
                a2 2 0 002 2h11
                a2 2 0 002-2v-5
                m-1.414-9.414
                a2 2 0 112.828 2.828
                L11.828 15H9v-2.828
                l8.586-8.586z
              "
            />

          </svg>

          {t.titre}

        </h2>

      </div>


      <form onSubmit={handleSubmit}>

        <div className="mb-4">



          <div className="flex items-center gap-3 mb-4 flex-wrap">

            {/* Français */}

            <button
              type="button"
              onClick={() => handleLangueChange("fr")}
              className={`
                px-4
                py-2
                rounded-lg
                font-medium
                border
                transition-colors
                ${
                  langue === "fr"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              Français
            </button>


            {/* Arabe */}

            <button
              type="button"
              onClick={() => handleLangueChange("ar")}
              className={`
                px-4
                py-2
                rounded-lg
                font-medium
                border
                transition-colors
                ${
                  langue === "ar"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              العربية
            </button>


            {/* Anglais */}

            <button
              type="button"
              onClick={() => handleLangueChange("en")}
              className={`
                px-4
                py-2
                rounded-lg
                font-medium
                border
                transition-colors
                ${
                  langue === "en"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              English
            </button>

          </div>


      

          <textarea

            rows="5"

            value={texte}

            dir={
              langue === "ar"
                ? "rtl"
                : "ltr"
            }

            lang={langue}

            onChange={(e) => {

              setTexte(e.target.value);

              if (error) {
                setError(null);
              }
            }}

            placeholder={t.placeholder}

            className="
              w-full
              p-4
              rounded-xl
              border
              border-slate-200
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
              text-slate-800
              text-sm
              placeholder-slate-400
              outline-none
              transition-all
              resize-none
              shadow-inner
              bg-slate-50/50
            "

            disabled={loading}

          />

        </div>


     

        {error && (

          <div
            className="
              mb-4
              p-3.5
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-xl
              text-sm
              flex
              items-start
              gap-2.5
            "
          >

            <svg
              className="
                w-5
                h-5
                text-red-500
                shrink-0
                mt-0.5
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="
                  M12 8v4m0 4h.01
                  M21 12
                  a9 9 0 11-18 0
                  9 9 0 0118 0z
                "
              />

            </svg>

            <span>{error}</span>

          </div>

        )}



        <div className="flex items-center justify-between gap-3">


          {/* Effacer */}

          <button

            type="button"

            onClick={handleClear}

            disabled={
              loading || !texte
            }

            className="
              px-4
              py-2.5
              rounded-xl
              border
              border-slate-200
              text-slate-600
              text-sm
              font-medium
              hover:bg-slate-100
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition-colors
            "
          >

            {t.effacer}

          </button>


          {/* Classer */}

          <button

            type="submit"

            disabled={
              loading || !texte.trim()
            }

            className="
              flex-1
              md:flex-none
              px-6
              py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              text-white
              font-semibold
              text-sm
              shadow-md
              shadow-blue-500/20
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-all
              flex
              items-center
              justify-center
              gap-2
              cursor-pointer
            "
          >

            {loading ? (

              <>

                <svg
                  className="
                    animate-spin
                    -ml-1
                    mr-2
                    h-4
                    w-4
                    text-white
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                >

                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="
                      M4 12a8 8 0 018-8V0
                      C5.373 0 0 5.373 0 12h4
                      zm2 5.291
                      A7.962 7.962 0 014 12H0
                      c0 3.042 1.135 5.824 3 7.938
                      l3-2.647z
                    "
                  />

                </svg>

                {t.loading}

              </>

            ) : (

              <>
                {t.bouton}
              </>

            )}

          </button>

        </div>

      </form>

    </div>
  );
};


export default FormulaireReclamation;
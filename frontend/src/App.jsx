import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import FormulaireReclamation
  from "./components/FormulaireReclamation";

import ResultatClassification
  from "./components/ResultatClassification";

import Historique
  from "./components/Historique";

import Statistiques
  from "./components/Statistiques";

import ImportBatch
  from "./components/ImportBatch";


function App() {

  const [
    dernierResultat,
    setDernierResultat,
  ] = useState(null);

  const [
    refreshHistoriqueCounter,
    setRefreshHistoriqueCounter,
  ] = useState(0);

  const handleClassificationSuccess =
    (resultat) => {

      setDernierResultat(
        resultat
      );
   setRefreshHistoriqueCounter(
        (prev) => prev + 1
      );
    };
  return (

    <BrowserRouter>

      <div
        className="
          min-h-screen
          bg-slate-50
          text-slate-800
        "
      >
        <aside
          className="
            fixed
            top-0
            left-0
            h-screen
            w-64
            bg-slate-900
            text-white
            border-r
            border-slate-800
            shadow-xl
            z-50
            flex
            flex-col
          "
        ><div
            className="
              px-6
              py-6
              border-b
              border-slate-800
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  font-black
                  text-xl
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                "
              >

                B

              </div>


              <div>

                <h1
                  className="
                    font-bold
                    text-lg
                    text-white
                    leading-none
                  "
                >
                  Smart Bank
                </h1>


                <p
                  className="
                    text-xs
                    text-slate-400
                    mt-1
                  "
                >
                  Classification IA
                </p>

              </div>

            </div>

          </div>

          <nav
            className="
              flex-1
              px-4
              py-6
              space-y-2
            "
          >


            {/* ACCUEIL */}

            <NavLink
              to="/"
              end

              className={({
                isActive,
              }) =>

                `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    isActive

                      ? `
                          bg-blue-600
                          text-white
                          shadow-md
                          shadow-blue-500/20
                        `

                      : `
                          text-slate-300
                          hover:bg-slate-800
                          hover:text-white
                        `
                  }
                `
              }
            >

              <span
                className="
                  text-lg
                  w-6
                  text-center
                "
              >
            
              </span>

              <span>
                Accueil
              </span>

            </NavLink>


            {/* IMPORT */}

            <NavLink
              to="/import"

              className={({
                isActive,
              }) =>

                `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    isActive

                      ? `
                          bg-blue-600
                          text-white
                          shadow-md
                          shadow-blue-500/20
                        `

                      : `
                          text-slate-300
                          hover:bg-slate-800
                          hover:text-white
                        `
                  }
                `
              }
            >

              <span
                className="
                  text-lg
                  w-6
                  text-center
                "
              >
              
              </span>

              <span>
                Import
              </span>

            </NavLink>


            {/* STATISTIQUES */}

            <NavLink
              to="/statistiques"

              className={({
                isActive,
              }) =>

                `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    isActive

                      ? `
                          bg-blue-600
                          text-white
                          shadow-md
                          shadow-blue-500/20
                        `

                      : `
                          text-slate-300
                          hover:bg-slate-800
                          hover:text-white
                        `
                  }
                `
              }
            >

              <span
                className="
                  text-lg
                  w-6
                  text-center
                "
              >
                
              </span>

              <span>
                Statistiques
              </span>

            </NavLink>

          </nav>


          <div
            className="
              px-6
              py-5
              border-t
              border-slate-800
            "
          >

            <p
              className="
                text-xs
                text-slate-400
              "
            >
              Proxym - 2026
            </p>

           

          </div>

        </aside>

        <main
          className="
            ml-64
            min-h-screen
            px-8
            py-8
          "
        >

          <div
            className="
              max-w-7xl
              mx-auto
            "
          >


            <Routes>

              <Route
                path="/"

                element={

                  <>

                    {/* FORMULAIRE + RÉSULTAT */}

                    <div
                      className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-8
                        items-start
                      "
                    >


                      <div>

                        <FormulaireReclamation

                          onClassificationSuccess={
                            handleClassificationSuccess
                          }

                        />

                      </div>


                      <div>

                        <ResultatClassification

                          resultat={
                            dernierResultat
                          }

                        />

                      </div>


                    </div>

                    <div className="mt-10">

                      <Historique

                        refreshTrigger={
                          refreshHistoriqueCounter
                        }

                      />

                    </div>

                  </>

                }
              />

              <Route
                path="/import"
                element={
                  <ImportBatch />
                }
              />

              <Route
                path="/statistiques"
                element={
                  <Statistiques />
                }
              />


            </Routes>

          </div>

        </main>


      </div>

    </BrowserRouter>
  );
}


export default App;
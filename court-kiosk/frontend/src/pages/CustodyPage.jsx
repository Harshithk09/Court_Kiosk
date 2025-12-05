import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useKioskMode } from "../contexts/KioskModeContext";
import ModernCourtHeader from "../components/ModernCourtHeader";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import "../components/ModernCard.css";
import "../components/ModernButton.css";
import { CheckCircle, Clock, FileText as FileTextIcon, ArrowLeft, Home } from "lucide-react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:4000';

const CustodyPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { isKioskMode } = useKioskMode();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueNumber, setQueueNumber] = useState(null);
  const [caseSummary, setCaseSummary] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [error, setError] = useState("");

  const t = (en, es) => (language === "es" ? es : en);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!reason) {
      setError(
        t(
          "Please select what you need help with.",
          "Por favor seleccione con qué necesita ayuda."
        )
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate queue number - matching UserKiosk.jsx pattern
      const response = await fetch(`${API_BASE_URL}/api/generate-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_type: "CUSTODY",
          priority: "B",
          language: language,
          reason: reason, // Store the sub-type user selected
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate queue number");
      }

      const data = await response.json();
      setQueueNumber(data.queue_number);
      setCaseSummary(data.summary || "");
      setNextSteps(data.next_steps || "");

      // Optionally trigger an email summary here using your email endpoints
      // await fetch(`${API_BASE_URL}/api/send-summary`, { ... })
    } catch (err) {
      console.error(err);
      setError(
        t(
          "Something went wrong while creating your queue number. Please go to the facilitator window for help.",
          "Ocurrió un error al crear su número de turno. Por favor vaya a la ventanilla del facilitador para recibir ayuda."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/experiment");
  };

  const handleHome = () => {
    navigate("/");
  };

  const resetKiosk = () => {
    setQueueNumber(null);
    setCaseSummary("");
    setNextSteps("");
    setReason("");
    setError("");
  };

  const modeClass = isKioskMode ? 'kiosk-mode' : 'website-mode';

  // If queue number is created, show completion/confirmation UI
  if (queueNumber) {
    return (
      <div className={`min-h-screen bg-gray-50 ${modeClass}`}>
        <ModernCourtHeader 
          onLanguageToggle={toggleLanguage} 
          currentLanguage={language} 
        />
        
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="max-w-4xl w-full space-y-6">
            <ModernCard variant="elevated" className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className={`${isKioskMode ? 'text-5xl' : 'text-4xl'} font-bold text-gray-900 mb-8`}>
                {t("YOUR QUEUE NUMBER", "TU NÚMERO DE COLA")}
              </h1>
              
              <ModernCard variant="gradient" className="mb-8">
                <div className={`${isKioskMode ? 'text-9xl' : 'text-7xl'} font-black text-white mb-4`}>
                  #{queueNumber}
                </div>
              </ModernCard>

              <div className="mb-8">
                <h2 className={`${isKioskMode ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'} font-black text-gray-800 mb-4`}>
                  {t("Child Custody & Support", "Custodia y Manutención de Menores")}
                </h2>
                <p className={`text-gray-600 ${isKioskMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
                  {t(
                    "Child custody arrangements, support calculations, and visitation rights.",
                    "Arreglos de custodia de menores, cálculos de manutención y derechos de visita."
                  )}
                </p>
              </div>
            </ModernCard>

            {caseSummary && (
              <ModernCard variant="outlined" className="text-left">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">
                  {t("Case Summary", "Resumen del Caso")}
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                  {caseSummary}
                </div>
              </ModernCard>
            )}

            {nextSteps && (
              <ModernCard variant="info" className="text-left">
                <h3 className="font-bold text-white mb-4 flex items-center text-xl">
                  <FileTextIcon className="w-6 h-6 mr-3" />
                  {t("Next Steps", "Próximos Pasos")}
                </h3>
                <div className="text-white whitespace-pre-line leading-relaxed text-lg">
                  {nextSteps}
                </div>
              </ModernCard>
            )}

            <ModernCard variant="warning" className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white mr-3" />
                <span className="text-white font-bold text-xl">
                  {t("Please wait to be called", "Por favor espera a ser llamado")}
                </span>
              </div>
              <p className="text-white text-lg">
                {t(
                  "A facilitator will call your number when it's your turn. Please have a seat and wait.",
                  "Un facilitador llamará su número cuando sea su turno. Por favor tome asiento y espere."
                )}
              </p>
              <ul className="list-disc pl-5 mt-4 text-left text-white text-base space-y-2">
                <li>
                  {t(
                    "Keep this number visible on your phone or on the printed ticket.",
                    "Mantenga este número visible en su teléfono o en el comprobante impreso."
                  )}
                </li>
                <li>
                  {t(
                    "If you have court papers, keep them handy.",
                    "Si tiene documentos de la corte, téngalos a la mano."
                  )}
                </li>
              </ul>
            </ModernCard>

            <div className="text-center">
              <ModernButton
                variant="secondary"
                size="large"
                onClick={resetKiosk}
                className="mr-4"
              >
                {t("Start New Case", "Iniciar Nuevo Caso")}
              </ModernButton>
              <ModernButton
                variant="primary"
                size="large"
                onClick={handleHome}
              >
                {t("Return to Home", "Volver al Inicio")}
              </ModernButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main intake screen
  return (
    <div className={`min-h-screen bg-gray-50 ${modeClass}`}>
      <ModernCourtHeader 
        onLanguageToggle={toggleLanguage} 
        currentLanguage={language} 
      />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("Back to Case Types", "Regresar a Tipos de Caso")}
          </button>
          <button
            onClick={handleHome}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            {t("Home", "Inicio")}
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <FileTextIcon className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className={`${isKioskMode ? 'text-4xl' : 'text-2xl md:text-3xl'} font-semibold text-gray-900 mb-2`}>
                {t(
                  "Child Custody & Support Help",
                  "Ayuda con Custodia y Manutención de Menores"
                )}
              </h1>
              <p className="text-gray-700">
                {t(
                  "Answer a few quick questions so the Family Law Facilitator can better assist you today.",
                  "Responda unas preguntas rápidas para que el Facilitador de Ley Familiar pueda ayudarle mejor hoy."
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <fieldset>
              <legend className={`font-medium text-gray-900 mb-4 ${isKioskMode ? 'text-2xl' : 'text-lg'}`}>
                {t(
                  "What are you here for today?",
                  "¿Para qué está aquí hoy?"
                )}
              </legend>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setReason("custody-visitation")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? 'text-xl min-h-[120px]' : 'text-sm md:text-base'
                  } ${
                    reason === "custody-visitation"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t(
                      "Custody / Visitation",
                      "Custodia / Visitas"
                    )}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "Parenting time, schedule changes, move-away requests.",
                      "Tiempo de crianza, cambios de horario, solicitudes para mudarse."
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReason("child-support")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? 'text-xl min-h-[120px]' : 'text-sm md:text-base'
                  } ${
                    reason === "child-support"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t(
                      "Child Support",
                      "Manutención de Menores"
                    )}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "Starting, changing, or stopping child support.",
                      "Iniciar, cambiar o terminar manutención de menores."
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReason("enforcement")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? 'text-xl min-h-[120px]' : 'text-sm md:text-base'
                  } ${
                    reason === "enforcement"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t("Enforcement / Problems", "Cumplimiento / Problemas")}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "The other parent is not following court orders.",
                      "La otra parte no está cumpliendo las órdenes de la corte."
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReason("other")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? 'text-xl min-h-[120px]' : 'text-sm md:text-base'
                  } ${
                    reason === "other"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t("Not Sure / Something Else", "No está seguro / Otra cosa")}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "We will ask you more questions in person.",
                      "Le haremos más preguntas en persona."
                    )}
                  </div>
                </button>
              </div>
            </fieldset>

            <div className="border-t pt-4 mt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  {t(
                    "If you have court papers, please keep them with you when your number is called.",
                    "Si tiene documentos de la corte, por favor téngalos con usted cuando llamen su número."
                  )}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-between items-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  {t("Back to main menu", "Regresar al menú principal")}
                </button>

                <ModernButton
                  type="submit"
                  disabled={isSubmitting || !reason}
                  variant="primary"
                  size={isKioskMode ? "large" : "medium"}
                >
                  {isSubmitting
                    ? t("Creating your queue number…", "Creando su número de turno…")
                    : t("Continue and get my number", "Continuar y obtener mi número")}
                </ModernButton>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CustodyPage;


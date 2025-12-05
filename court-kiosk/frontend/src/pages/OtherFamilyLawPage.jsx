import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useKioskMode } from "../contexts/KioskModeContext";
import ModernCourtHeader from "../components/ModernCourtHeader";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import "../components/ModernCard.css";
import "../components/ModernButton.css";
import {
  CheckCircle,
  Clock,
  FileText as FileTextIcon,
  ArrowLeft,
  Home,
} from "lucide-react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const OtherFamilyLawPage = () => {
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

      // Generate queue number - mirrors UserKiosk for OTHER case types
      const response = await fetch(`${API_BASE_URL}/api/generate-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_type: "OTHER",
          priority: "E",
          language,
          reason, // store subtype for staff context
          source: "other-family-page",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate queue number");
      }

      const data = await response.json();
      setQueueNumber(data.queue_number);
      setCaseSummary(data.summary || "");
      setNextSteps(data.next_steps || "");
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

  const handleBack = () => navigate("/experiment");
  const handleHome = () => navigate("/");

  const resetState = () => {
    setQueueNumber(null);
    setCaseSummary("");
    setNextSteps("");
    setReason("");
    setError("");
  };

  const modeClass = isKioskMode ? "kiosk-mode" : "website-mode";

  // Completion view
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

              <h1
                className={`${
                  isKioskMode ? "text-5xl" : "text-4xl"
                } font-bold text-gray-900 mb-8`}
              >
                {t("YOUR QUEUE NUMBER", "TU NÚMERO DE COLA")}
              </h1>

              <ModernCard variant="gradient" className="mb-8">
                <div
                  className={`${
                    isKioskMode ? "text-9xl" : "text-7xl"
                  } font-black text-white mb-4`}
                >
                  #{queueNumber}
                </div>
              </ModernCard>

              <div className="mb-8">
                <h2
                  className={`${
                    isKioskMode ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
                  } font-black text-gray-800 mb-4`}
                >
                  {t("Other Family Law", "Otros Asuntos de Ley Familiar")}
                </h2>
                <p
                  className={`text-gray-600 ${
                    isKioskMode ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                  } font-bold`}
                >
                  {t(
                    "Parentage, guardianship, name changes, and other family matters.",
                    "Paternidad, tutela, cambios de nombre y otros asuntos familiares."
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
                onClick={resetState}
                className="mr-4"
              >
                {t("Start New Case", "Iniciar Nuevo Caso")}
              </ModernButton>
              <ModernButton variant="primary" size="large" onClick={handleHome}>
                {t("Return to Home", "Volver al Inicio")}
              </ModernButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intake screen
  return (
    <div className={`min-h-screen bg-gray-50 ${modeClass}`}>
      <ModernCourtHeader
        onLanguageToggle={toggleLanguage}
        currentLanguage={language}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
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
          <div className="flex items-start mb-4">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <FileTextIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1
                className={`${
                  isKioskMode ? "text-4xl" : "text-2xl md:text-3xl"
                } font-semibold text-gray-900 mb-2`}
              >
                {t("Other Family Law Help", "Ayuda en Otros Asuntos de Ley Familiar")}
              </h1>
              <p className="text-gray-700">
                {t(
                  "Choose the option that best describes why you are here today.",
                  "Elija la opción que mejor describe por qué está aquí hoy."
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <fieldset>
              <legend
                className={`font-medium text-gray-900 mb-4 ${
                  isKioskMode ? "text-2xl" : "text-lg"
                }`}
              >
                {t("What are you here for today?", "¿Para qué está aquí hoy?")}
              </legend>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setReason("spousal-support")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? "text-xl min-h-[120px]" : "text-sm md:text-base"
                  } ${
                    reason === "spousal-support"
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-600"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t("Spousal / Partner Support", "Manutención de cónyuge / pareja")}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "Starting or changing support between adults.",
                      "Iniciar o cambiar manutención entre adultos."
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReason("parentage")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? "text-xl min-h-[120px]" : "text-sm md:text-base"
                  } ${
                    reason === "parentage"
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-600"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t(
                      "Parentage (Who is the legal parent?)",
                      "Paternidad / maternidad legal"
                    )}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "Cases to establish who the legal parent is.",
                      "Casos para establecer quién es el padre o la madre legal."
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReason("property-debts")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? "text-xl min-h-[120px]" : "text-sm md:text-base"
                  } ${
                    reason === "property-debts"
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-600"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t("Property / Debts", "Bienes / Deudas")}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {t(
                      "Dividing property or debts between you and the other party.",
                      "Dividir bienes o deudas entre usted y la otra parte."
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReason("other")}
                  className={`border rounded-xl px-4 py-3 text-left transition ${
                    isKioskMode ? "text-xl min-h-[120px]" : "text-sm md:text-base"
                  } ${
                    reason === "other"
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-600"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {t("Something else / Not sure", "Otra cosa / No está seguro")}
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
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-800">
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
                  className="bg-purple-700 hover:bg-purple-800"
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

export default OtherFamilyLawPage;


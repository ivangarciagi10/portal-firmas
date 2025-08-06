"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GuestSignPage() {
  const { token } = useParams();
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [comentario, setComentario] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  
  // Estados para firma simplificada
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Cuestionario tipo Typeform
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({
    calificacionGeneral: null,
    calidadDesarrollo: null,
    comunicacion: null,
    cumplimientoTiempos: null,
    recomendacion: null,
    feedback: ""
  });
  
  // Preguntas del cuestionario
  const surveyQuestions = [
    {
      id: 'calificacionGeneral',
      question: '¿Cómo calificarías tu experiencia general con nuestro servicio?',
      type: 'rating',
      options: [
        { value: 1, label: 'Muy mala', emoji: '😞' },
        { value: 2, label: 'Mala', emoji: '😕' },
        { value: 3, label: 'Regular', emoji: '😐' },
        { value: 4, label: 'Buena', emoji: '🙂' },
        { value: 5, label: 'Excelente', emoji: '😍' }
      ]
    },
    {
      id: 'calidadDesarrollo',
      question: '¿Qué opinas sobre la calidad del desarrollo web?',
      type: 'rating',
      options: [
        { value: 1, label: 'Muy deficiente', emoji: '😞' },
        { value: 2, label: 'Deficiente', emoji: '😕' },
        { value: 3, label: 'Aceptable', emoji: '😐' },
        { value: 4, label: 'Buena', emoji: '🙂' },
        { value: 5, label: 'Excelente', emoji: '😍' }
      ]
    },
    {
      id: 'comunicacion',
      question: '¿Cómo evaluarías la comunicación con nuestro equipo?',
      type: 'rating',
      options: [
        { value: 1, label: 'Muy mala', emoji: '😞' },
        { value: 2, label: 'Mala', emoji: '😕' },
        { value: 3, label: 'Regular', emoji: '😐' },
        { value: 4, label: 'Buena', emoji: '🙂' },
        { value: 5, label: 'Excelente', emoji: '😍' }
      ]
    },
    {
      id: 'cumplimientoTiempos',
      question: '¿Cómo calificarías el cumplimiento de los tiempos de entrega?',
      type: 'rating',
      options: [
        { value: 1, label: 'Muy retrasado', emoji: '😞' },
        { value: 2, label: 'Retrasado', emoji: '😕' },
        { value: 3, label: 'A tiempo', emoji: '😐' },
        { value: 4, label: 'Anticipado', emoji: '🙂' },
        { value: 5, label: 'Muy anticipado', emoji: '😍' }
      ]
    },
    {
      id: 'recomendacion',
      question: '¿Recomendarías nuestro servicio a otros?',
      type: 'rating',
      options: [
        { value: 1, label: 'Definitivamente no', emoji: '😞' },
        { value: 2, label: 'Probablemente no', emoji: '😕' },
        { value: 3, label: 'Tal vez', emoji: '😐' },
        { value: 4, label: 'Probablemente sí', emoji: '🙂' },
        { value: 5, label: 'Definitivamente sí', emoji: '😍' }
      ]
    },
    {
      id: 'feedback',
      question: '¿Tienes algún comentario o sugerencia para mejorar nuestro servicio?',
      type: 'text',
      placeholder: 'Comparte tus ideas con nosotros...'
    }
  ];


  useEffect(() => {
    fetch(`/api/signatures/token/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setSignature(data);
        setLoading(false);
      });
  }, [token]);

  const handleAcceptReview = async e => {
    e.preventDefault();
    setError("");
    
    // Mostrar encuesta después de aceptar la revisión
    setShowSurvey(true);
  };

  // Funciones para el cuestionario tipo Typeform
  const handleSurveyAnswer = (questionId, value) => {
    setSurveyAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitSurvey = async e => {
    e.preventDefault();
    setError("");
    
    // Verificar que todas las preguntas obligatorias estén respondidas
    const requiredQuestions = surveyQuestions.filter(q => q.type === 'rating');
    const unanswered = requiredQuestions.filter(q => surveyAnswers[q.id] === null);
    
    if (unanswered.length > 0) {
      setError("Por favor responde todas las preguntas antes de continuar");
      return;
    }
    
    const res = await fetch(`/api/signatures/token/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "ACCEPTED",
        comentario,
        nombreCompleto: signature.name, // Usar el nombre del firmante ya definido
        calificacionGeneral: surveyAnswers.calificacionGeneral,
        calidadDesarrollo: surveyAnswers.calidadDesarrollo,
        comunicacion: surveyAnswers.comunicacion,
        cumplimientoTiempos: surveyAnswers.cumplimientoTiempos,
        recomendacion: surveyAnswers.recomendacion,
        feedback: surveyAnswers.feedback,
      }),
    });
    if (res.ok) {
      setSigned(true);
      setSignature({ ...signature, signedAt: new Date().toISOString(), estado: "ACCEPTED" });
    } else {
      setError("Error al firmar");
    }
  };

  const handleReject = async e => {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/signatures/token/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "REJECTED",
        motivoRechazo,
        comentario,
      }),
    });
    if (res.ok) {
      setRejected(true);
      setSignature({ ...signature, estado: "REJECTED" });
    } else {
      setError("Error al rechazar");
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!signature) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-8 bg-white rounded-xl shadow-lg">
      {/* Título del proyecto */}
      {signature?.projectName && (
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-orange-700">{signature.projectName}</h2>
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Revisión de Proyecto</h1>
        <p className="text-gray-600">Proceso simplificado de evaluación</p>
      </div>

      {/* Información del documento */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8"> 
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Información del Documento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2"><span className="font-semibold text-gray-800">Firmante:</span> <span className="text-gray-900">{signature.name}</span></p>
            <p className="mb-2"><span className="font-semibold text-gray-800">Rol:</span> <span className="text-gray-900">{signature.role}</span></p>
            <p className="mb-2"><span className="font-semibold text-gray-800">Email:</span> <span className="text-gray-900">{signature.email || '-'}</span></p>
          </div>
          <div>
            <p className="mb-2"><span className="font-semibold text-gray-800">Estado:</span> <span className="text-gray-900">{signature.estado === 'REJECTED' ? 'Rechazado' : signature.signedAt ? `Firmado el ${signature.signedAt.slice(0,10)}` : 'Pendiente'}</span></p>
            <p className="mb-2"><span className="font-semibold text-gray-800">Fecha:</span> <span className="text-gray-900">{new Date().toLocaleDateString('es-ES')}</span></p>
          </div>
        </div>
      </div>

      {/* Si ya firmó o rechazó */}
      {(signature.signedAt || signed) && signature.estado !== 'REJECTED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-800 text-lg font-semibold mb-2">✅ Firma registrada exitosamente</div>
          <div className="text-green-600">Tu firma digital y encuesta han sido enviadas correctamente.</div>
        </div>
      )}
      
      {rejected || signature.estado === 'REJECTED' ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-800 text-lg font-semibold mb-2">❌ Firma rechazada</div>
          <div className="text-red-600">Gracias por tus comentarios y feedback.</div>
        </div>
      ) : null}

      {/* Opciones simplificadas de revisión */}
      {!signature.signedAt && !signed && !rejected && signature.estado !== 'REJECTED' && !showSurvey && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">📋 Revisión del Proyecto</h3>
            <p className="text-green-700 mb-4">
              Revisa la información del proyecto y procede con tu evaluación. 
              Solo necesitas hacer clic en un botón para continuar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAcceptReview}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
              >
                ✅ Proceder con Revisión
              </button>
              <button
                onClick={() => setRejected('pending')}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition shadow-lg"
              >
                ❌ Rechazar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Formulario de rechazo */}
      {rejected === 'pending' && (
        <form onSubmit={handleReject} className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Motivo del rechazo</h3>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Explica por qué rechazas la firma *
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                placeholder="Proporciona detalles sobre el motivo del rechazo"
                required
                rows="3"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Comentarios adicionales
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder={'¿Tienes algún comentario adicional? (opcional)'}
                rows="3"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-lg mt-4"
            >
              Enviar rechazo
            </button>
          </div>
        </form>
      )}

      {/* Cuestionario tipo Typeform */}
      {showSurvey && !signed && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 shadow-lg">
          {/* Header del cuestionario */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cuestionario de Satisfacción</h2>
            <p className="text-gray-600">Ayúdanos a mejorar nuestro servicio</p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-2">
                {surveyQuestions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentQuestion
                        ? 'bg-orange-500'
                        : index < currentQuestion
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pregunta actual */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              {surveyQuestions[currentQuestion].question}
            </h3>

            {surveyQuestions[currentQuestion].type === 'rating' ? (
              <div className="space-y-4">
                {surveyQuestions[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSurveyAnswer(surveyQuestions[currentQuestion].id, option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      surveyAnswers[surveyQuestions[currentQuestion].id] === option.value
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{option.emoji}</span>
                        <span className="text-lg font-medium text-gray-800">{option.label}</span>
                      </div>
                      {surveyAnswers[surveyQuestions[currentQuestion].id] === option.value && (
                        <div className="text-orange-500">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <textarea
                  value={surveyAnswers[surveyQuestions[currentQuestion].id] || ''}
                  onChange={(e) => handleSurveyAnswer(surveyQuestions[currentQuestion].id, e.target.value)}
                  placeholder={surveyQuestions[currentQuestion].placeholder}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows="4"
                />
              </div>
            )}
          </div>

          {/* Navegación */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              ← Anterior
            </button>

            <div className="text-sm text-gray-500">
              {currentQuestion + 1} de {surveyQuestions.length}
            </div>

            {currentQuestion < surveyQuestions.length - 1 ? (
              <button
                type="button"
                onClick={nextQuestion}
                disabled={surveyAnswers[surveyQuestions[currentQuestion].id] === null || 
                         (surveyQuestions[currentQuestion].type === 'text' && 
                          !surveyAnswers[surveyQuestions[currentQuestion].id])}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  surveyAnswers[surveyQuestions[currentQuestion].id] === null || 
                  (surveyQuestions[currentQuestion].type === 'text' && 
                   !surveyAnswers[surveyQuestions[currentQuestion].id])
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitSurvey}
                disabled={surveyAnswers[surveyQuestions[currentQuestion].id] === null || 
                         (surveyQuestions[currentQuestion].type === 'text' && 
                          !surveyAnswers[surveyQuestions[currentQuestion].id])}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  surveyAnswers[surveyQuestions[currentQuestion].id] === null || 
                  (surveyQuestions[currentQuestion].type === 'text' && 
                   !surveyAnswers[surveyQuestions[currentQuestion].id])
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                ✅ Completar
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

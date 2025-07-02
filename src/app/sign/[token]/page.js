"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";

export default function GuestSignPage() {
  const { token } = useParams();
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [comentario, setComentario] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  
  // Estados para firma oficial
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showDesktopForm, setShowDesktopForm] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
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

  const desktopFormRef = useRef(null);

  // Detectar si es dispositivo móvil y si viene del QR
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      
      // Si es móvil y viene del QR, mostrar formulario móvil directamente
      const urlParams = new URLSearchParams(window.location.search);
      if (isMobileDevice && urlParams.get('mobile') === 'true') {
        setShowDesktopForm(true);
      }
    };
    checkMobile();
  }, []);

  // Generar captcha aleatorio
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
  }, []);

  // Generar QR Code
  useEffect(() => {
    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const mobileUrl = `${baseUrl}/sign/${token}?mobile=true`;
      QRCode.toDataURL(mobileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      }).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error('Error generando QR:', err);
      });
    }
  }, [token]);

  // Inicializar canvas
  useEffect(() => {
    if (!showCanvas) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configurar canvas
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = isMobile ? 4 : 2;
    
    // Establecer tamaño
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    contextRef.current = ctx;
    
    console.log('Canvas inicializado:', { width: canvas.width, height: canvas.height, isMobile });
  }, [showCanvas, isMobile]);

  useEffect(() => {
    fetch(`/api/signatures/token/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setSignature(data);
        setLoading(false);
      });
  }, [token]);

  // Función unificada para obtener coordenadas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (e.touches && e.touches[0]) {
      // Evento táctil
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Función unificada para iniciar dibujo
  const startDrawing = (e) => {
    e.preventDefault();
    
    if (!contextRef.current) {
      console.log('Contexto no disponible');
      return;
    }
    
    const coords = getCoordinates(e);
    console.log('Iniciando dibujo:', coords);
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    
    // Feedback visual
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.border = '2px solid #ea580c';
    }
  };

  // Función unificada para dibujar
  const draw = (e) => {
    e.preventDefault();
    
    if (!isDrawing || !contextRef.current) {
      return;
    }
    
    const coords = getCoordinates(e);
    console.log('Dibujando:', coords);
    
    contextRef.current.lineTo(coords.x, coords.y);
    contextRef.current.stroke();
  };

  // Función unificada para terminar dibujo
  const stopDrawing = (e) => {
    e.preventDefault();
    
    if (!contextRef.current) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Guardar firma
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setSignatureImage(dataUrl);
      console.log('Firma guardada:', dataUrl.substring(0, 50) + '...');
      
      // Restaurar borde
      canvas.style.border = '2px solid #e5e7eb';
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureImage(null);
      console.log('Firma limpiada');
    }
  };

  const startDrawingMode = () => {
    setShowCanvas(true);
    console.log('Modo dibujo activado');
  };

  const resetDrawingMode = () => {
    setShowCanvas(false);
    setSignatureImage(null);
    clearSignature();
    console.log('Modo dibujo reseteado');
  };

  const handleSign = async e => {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (!nombreCompleto.trim()) {
      setError("Por favor ingresa tu nombre completo");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }
    if (captchaInput.toUpperCase() !== captchaValue) {
      setError("El código de verificación es incorrecto");
      return;
    }
    if (!signatureImage) {
      setError("Por favor dibuja tu firma");
      return;
    }
    
    console.log('Procediendo con firma:', { nombreCompleto, signatureImage: signatureImage.substring(0, 50) + '...' });
    
    // Mostrar encuesta después de validaciones
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
        nombreCompleto,
        signatureImage,
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
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Firma Digital de Documento</h1>
        <p className="text-gray-600">Proceso oficial de firma electrónica</p>
      </div>

      {/* Información del documento */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Información del Documento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2"><span className="font-semibold text-gray-700">Firmante:</span> {signature.name}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Rol:</span> {signature.role}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Email:</span> {signature.email || '-'}</p>
          </div>
          <div>
            <p className="mb-2"><span className="font-semibold text-gray-700">Estado:</span> 
              {signature.estado === 'REJECTED' ? 'Rechazado' : signature.signedAt ? `Firmado el ${signature.signedAt.slice(0,10)}` : 'Pendiente'}
            </p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Fecha:</span> {new Date().toLocaleDateString('es-ES')}</p>
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

      {/* Opciones de firma */}
      {!signature.signedAt && !signed && !rejected && signature.estado !== 'REJECTED' && !showSurvey && (
        <div className="space-y-6">
          {/* Opción para desktop */}
          {!isMobile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Firma desde tu computadora</h3>
              <p className="text-blue-700 mb-4">Usa tu mouse para dibujar tu firma directamente en la pantalla.</p>
              <button
                onClick={() => {
                  setShowDesktopForm(true);
                  setTimeout(() => {
                    if (desktopFormRef.current) {
                      desktopFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Firmar con Mouse
              </button>
            </div>
          )}

          {/* Opción para móvil: mostrar QR solo en desktop, en móvil mostrar formulario directo */}
          {!isMobile && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Firma desde tu celular</h3>
              <p className="text-orange-700 mb-4">Escanea el código QR con tu celular para firmar de forma más cómoda.</p>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code para firma móvil" className="mx-auto border-2 border-gray-300 rounded-lg" />
                  )}
                  <p className="text-sm text-gray-600 mt-2">Escanea con tu cámara</p>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">Ventajas de firmar en móvil:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Firma más natural con el dedo</li>
                    <li>• Interfaz optimizada para pantalla táctil</li>
                    <li>• Proceso más rápido y cómodo</li>
                    <li>• Mejor precisión al firmar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* En móvil, mostrar el formulario de firma directamente */}
          {isMobile && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Firma desde tu celular</h3>
              <p className="text-orange-700 mb-4">Utiliza tu dedo para firmar directamente en la pantalla.</p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de firma para desktop */}
      {!signature.signedAt && !signed && !rejected && signature.estado !== 'REJECTED' && !showSurvey && showDesktopForm && !isMobile && (
        <form ref={desktopFormRef} onSubmit={handleSign} className="space-y-6">
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Nombre completo del firmante *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
              value={nombreCompleto}
              onChange={e => setNombreCompleto(e.target.value)}
              placeholder="Ingresa tu nombre completo tal como aparece en documentos oficiales"
              required
            />
          </div>

          {/* Canvas para firma */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Firma digital *
            </label>
            
            {!showCanvas ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 text-center">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Listo para firmar?</h3>
                <p className="text-gray-600 mb-4">Haz clic en el botón para comenzar a dibujar tu firma</p>
                <button
                  type="button"
                  onClick={startDrawingMode}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition shadow-lg"
                >
                  Comenzar a dibujar firma
                </button>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <span className="text-lg">🖱️</span>
                    <span className="font-semibold">Instrucciones para Mouse:</span>
                  </div>
                  <ul className="text-sm text-blue-700 mt-1 ml-6 list-disc">
                    <li>Haz clic y mantén presionado el botón izquierdo del mouse</li>
                    <li>Arrastra el mouse para dibujar tu firma</li>
                    <li>Suelta el botón cuando termines</li>
                  </ul>
                </div>
                
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="cursor-crosshair mx-auto block w-full max-w-md h-32"
                  />
                  <div className="text-center mt-2 space-y-2">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      Limpiar firma
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={resetDrawingMode}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Cancelar dibujo
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Dibuja tu firma en el área de arriba
                  </p>
                  <div className="text-center mt-1 text-xs text-blue-600">
                    {signatureImage ? "✅ Firma guardada" : "⏳ Sin firma"}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Verificación de seguridad *
            </label>
            <div className="flex items-center gap-4">
              <div className="captcha-display px-6 py-3 rounded-lg border-2 border-gray-300">
                <span className="text-2xl font-bold text-gray-800">{captchaValue}</span>
              </div>
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                placeholder="Ingresa el código de verificación"
                required
              />
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={e => setAceptaTerminos(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terminos" className="text-sm text-gray-700">
                <span className="font-semibold">Acepto los términos y condiciones de firma digital:</span>
                <br />
                Declaro que soy la persona autorizada para firmar este documento, que he leído y comprendido su contenido, 
                y que mi firma digital tiene la misma validez legal que una firma manuscrita. 
                Esta firma se realiza de manera voluntaria y consciente.
              </label>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Comentarios sobre el proyecto
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder={'¿Tienes algún comentario sobre el proyecto? (opcional)'}
              rows="3"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition shadow-lg"
            >
              Proceder con la firma
            </button>
            <button 
              type="button" 
              className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition shadow-lg"
              onClick={() => setRejected('pending')}
            >
              Rechazar firma
            </button>
          </div>
        </form>
      )}

      {/* Formulario de firma para móvil */}
      {!signature?.signedAt && !signed && !rejected && signature?.estado !== 'REJECTED' && !showSurvey && isMobile && (
        <form onSubmit={handleSign} className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-orange-800">
              <span className="text-lg">📱</span>
              <span className="font-semibold">Modo móvil activado</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">Interfaz optimizada para pantalla táctil</p>
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Nombre completo del firmante *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
              value={nombreCompleto}
              onChange={e => setNombreCompleto(e.target.value)}
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>

          {/* Canvas para firma móvil */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Firma digital *
            </label>
            
            {!showCanvas ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Listo para firmar?</h3>
                <p className="text-gray-600 mb-4">Toca el botón para comenzar a dibujar tu firma con el dedo</p>
                <button
                  type="button"
                  onClick={startDrawingMode}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition shadow-lg"
                >
                  Comenzar a dibujar firma
                </button>
              </div>
            ) : (
              <>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <span className="text-lg">📱</span>
                    <span className="font-semibold">Instrucciones para móvil:</span>
                  </div>
                  <ul className="text-sm text-orange-700 mt-1 ml-6 list-disc">
                    <li>Toca la pantalla y mantén presionado</li>
                    <li>Desliza tu dedo para dibujar tu firma</li>
                    <li>Levanta el dedo cuando termines</li>
                    <li>Área más grande para facilitar el uso</li>
                  </ul>
                </div>
                
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-pointer mx-auto block w-full h-40"
                  />
                  <div className="text-center mt-2 text-xs text-gray-500">
                    {isDrawing ? "🟢 Dibujando..." : "⚪ Dibuja tu firma"}
                  </div>
                  <div className="text-center mt-1 text-xs text-blue-600">
                    {signatureImage ? "✅ Firma guardada" : "⏳ Sin firma"}
                  </div>
                  <div className="text-center mt-2 space-y-2">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      Limpiar firma
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={resetDrawingMode}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Cancelar dibujo
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Toca y desliza para dibujar tu firma
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Verificación de seguridad *
            </label>
            <div className="flex flex-col gap-3">
              <div className="captcha-display px-6 py-3 rounded-lg border-2 border-gray-300 text-center">
                <span className="text-2xl font-bold text-gray-800">{captchaValue}</span>
              </div>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                placeholder="Ingresa el código de verificación"
                required
              />
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terminos-mobile"
                checked={aceptaTerminos}
                onChange={e => setAceptaTerminos(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terminos-mobile" className="text-sm text-gray-700">
                <span className="font-semibold">Acepto los términos y condiciones de firma digital:</span>
                <br />
                Declaro que soy la persona autorizada para firmar este documento, que he leído y comprendido su contenido, 
                y que mi firma digital tiene la misma validez legal que una firma manuscrita. 
                Esta firma se realiza de manera voluntaria y consciente.
              </label>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Comentarios sobre el proyecto
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder={'¿Tienes algún comentario sobre el proyecto? (opcional)'}
              rows="3"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition shadow-lg"
            >
              Proceder con la firma
            </button>
            <button 
              type="button" 
              className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition shadow-lg"
              onClick={() => setRejected('pending')}
            >
              Rechazar firma
            </button>
          </div>
        </form>
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

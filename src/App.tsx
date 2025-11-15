import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const App = () => {
    // 1. Estados de la Aplicación
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('¡Hola! Soy tu asistente de IA. Ingresa un tema o pregunta para comenzar a generar contenido.');
    const [loading, setLoading] = useState(false);
    
    // Estados de Firebase/Auth
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);

    // 2. Inicialización y Autenticación de Firebase (CONFIGURACIÓN LOCAL)
    useEffect(() => {
        // --- COMIENZO DE LA SECCIÓN A CONFIGURAR LOCALMENTE ---
        
        // DEVFEST PASO 1
        // 1. Reemplaza este objeto con tu configuración REAL de Firebase
        const firebaseConfigLocal = {
           
        };

        // 2. Reemplaza este string con tu CLAVE DE API de Gemini
        // NOTA: Para producción real, usa variables de entorno (ej: import.meta.env.VITE_GEMINI_API_KEY)
        
        // DEVFEST PASO 2
        const geminiApiKey = ""; 
        
        // --- FIN DE LA SECCIÓN A CONFIGURAR LOCALMENTE ---

        try {
            const app = initializeApp(firebaseConfigLocal);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(dbInstance);

            // Manejo de la autenticación anónima
            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        await signInAnonymously(authInstance);
                    } catch (e) {
                        console.error("Firebase Sign-in failed:", e);
                    } finally {
                        setIsAuthReady(true);
                    }
                }
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Error during Firebase initialization:", e);
        }
    }, []);

    // 3. Función para llamar a la API de Gemini
    const generateContent = useCallback(async () => {
        if (!prompt || loading || !isAuthReady) return;

        setLoading(true);
        setResponse("Generando respuesta...");

        // Usar la clave de Gemini
        
        // DEVFEST PASO 3
        const apiKey = ""; 
        // DEVFEST PASO 4
        // ----- Inicio Paso 4




        
        // ----- Fin Paso 4

        const maxRetries = 3;
        let result = null;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (response.status >= 500) throw new Error(`Server error: ${response.status}`);
                    throw new Error(`API error: ${response.status} - ${await response.text()}`);
                }

                result = await response.json();
                break;
            } catch (error) {
                console.error(`Intento ${i + 1} fallido:`, error.message);
                if (i === maxRetries - 1) {
                    setResponse("Error: No se pudo conectar con el servicio de IA. Inténtalo de nuevo más tarde.");
                    setLoading(false);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }

        if (result) {
            const candidate = result.candidates?.[0];
            let generatedText = "No se pudo generar una respuesta.";
            let sources = [];
            
            if (candidate && candidate.content?.parts?.[0]?.text) {
                generatedText = candidate.content.parts[0].text;
                
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }
            }
            
            let fullResponse = generatedText;
            if (sources.length > 0) {
                fullResponse += "\n\n---\nFuentes de Google Search:\n";
                sources.forEach((source, index) => {
                    fullResponse += `${index + 1}. ${source.title} (${source.uri})\n`;
                });
            }
            
            setResponse(fullResponse);
        }
        setLoading(false);
    }, [prompt, loading, isAuthReady]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            generateContent();
        }
    };

    // 4. Renderizado del UI
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto w-full">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
                        <span className="text-blue-500">Gemini</span> Assistant
                    </h1>
                    <p className="text-gray-500">Impulsado por Firebase AI Logic (Gemini API)</p>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                        Escribe tu consulta o tema:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            id="ai-prompt"
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ej. ¿Qué es la fusión nuclear?"
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                            disabled={loading || !isAuthReady}
                        />
                        <button
                            onClick={generateContent}
                            disabled={loading || !isAuthReady || prompt.trim() === ''}
                            className={`
                                p-3 rounded-lg text-white font-semibold shadow-md 
                                transition duration-200 ease-in-out transform hover:scale-[1.01]
                                ${loading || !isAuthReady || prompt.trim() === '' 
                                    ? 'bg-blue-300 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                }
                            `}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cargando...
                                </div>
                            ) : (
                                'Generar'
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                        Respuesta de la IA
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[150px] overflow-auto whitespace-pre-wrap text-gray-700">
                        {response}
                    </div>
                </div>
                
                <footer className="mt-8 text-center text-xs text-gray-500 p-2">
                    <p className="mb-1">
                        Estado de autenticación: 
                        <span className={`font-mono text-sm ml-1 ${userId ? 'text-green-600' : 'text-yellow-600'}`}>
                            {userId ? 'AUTENTICADO' : (isAuthReady ? 'ERROR/ANÓNIMO' : 'Cargando...')}
                        </span>
                    </p>
                    <p className="break-all">
                        ID de Usuario (Firebase): 
                        <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded-md text-gray-800">
                            {userId || 'Cargando ID...'}
                        </span>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;
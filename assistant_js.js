/* ====================================
   COBRASYSTEM ASSISTANT JAVASCRIPT
   Archivo: assets/js/assistant.js
==================================== */

// VARIABLES GLOBALES
let assistantIsOpen = false;
let conversationHistory = [];

// INICIALIZAR ASISTENTE
document.addEventListener('DOMContentLoaded', function() {
    initializeAssistant();
});

// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
function initializeAssistant() {
    // Crear HTML del asistente
    createAssistantHTML();
    
    // Configurar eventos
    setupAssistantEvents();
    
    // Mostrar notificación inicial si es primera vez
    setTimeout(() => {
        if (!assistantIsOpen && !localStorage.getItem('cobrasystem_assistant_visited')) {
            showWelcomeNotification();
            localStorage.setItem('cobrasystem_assistant_visited', 'true');
        }
    }, 3000);
    
    console.log('🤖 Asistente IA de CobraSystem inicializado');
}

// CREAR HTML DEL ASISTENTE
function createAssistantHTML() {
    const assistantHTML = `
        <!-- FLOATING ASSISTANT BUTTON -->
        <button class="assistant-trigger" onclick="toggleAssistantChat()" id="assistantTrigger">
            <i class="fas fa-robot"></i>
        </button>

        <!-- CHAT CONTAINER -->
        <div class="chat-container" id="chatContainer">
            <!-- HEADER -->
            <div class="chat-header">
                <div class="chat-title">
                    <div class="ai-avatar">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600;">Asistente IA</div>
                        <div style="font-size: 0.8rem; opacity: 0.9;">CobraSystem Assistant</div>
                    </div>
                </div>
                <button class="close-btn" onclick="toggleAssistantChat()">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- QUICK ACTIONS -->
            <div class="quick-actions">
                <div class="quick-action" onclick="sendQuickAction('¿Cuántos clientes tengo con cuotas vencidas?')">
                    <i class="fas fa-exclamation-triangle"></i> Cuotas Vencidas
                </div>
                <div class="quick-action" onclick="sendQuickAction('Muéstrame el resumen de ingresos de hoy')">
                    <i class="fas fa-chart-line"></i> Ingresos Hoy
                </div>
                <div class="quick-action" onclick="sendQuickAction('¿Qué clientes debo contactar urgentemente?')">
                    <i class="fas fa-phone"></i> Contactos
                </div>
            </div>

            <!-- SUGGESTIONS -->
            <div class="suggestions" id="suggestions">
                <div class="suggestions-title">💡 Sugerencias:</div>
                <div class="suggestion-item" onclick="sendQuickAction('¿Cómo está mi flujo de caja este mes?')">
                    ¿Cómo está mi flujo de caja este mes?
                </div>
                <div class="suggestion-item" onclick="sendQuickAction('Muéstrame mis mejores clientes')">
                    Muéstrame mis mejores clientes
                </div>
                <div class="suggestion-item" onclick="sendQuickAction('¿Cuál es mi tasa de morosidad actual?')">
                    ¿Cuál es mi tasa de morosidad actual?
                </div>
            </div>

            <!-- MESSAGES -->
            <div class="chat-messages" id="chatMessages">
                <div class="message assistant">
                    ¡Hola! 👋 Soy tu asistente inteligente de CobraSystem. 
                    
                    Puedo ayudarte con:
                    • 📊 Análisis de datos y reportes
                    • 💰 Estado de cuotas y pagos
                    • 📱 Gestión de clientes
                    • 📈 Tendencias y predicciones
                    • ⚡ Acciones rápidas

                    ¿En qué puedo ayudarte hoy?
                </div>
            </div>

            <!-- INPUT -->
            <div class="chat-input">
                <div class="input-container">
                    <textarea 
                        class="input-field" 
                        id="messageInput" 
                        placeholder="Escribe tu pregunta..." 
                        rows="1"
                        onkeydown="handleAssistantKeyDown(event)"
                        oninput="autoResizeTextarea(this)"
                    ></textarea>
                    <button class="send-btn" id="sendBtn" onclick="sendAssistantMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insertar HTML al final del body
    document.body.insertAdjacentHTML('beforeend', assistantHTML);
}

// CONFIGURAR EVENTOS
function setupAssistantEvents() {
    // Atajos de teclado
    document.addEventListener('keydown', function(event) {
        // Alt + A = Toggle Assistant
        if (event.altKey && event.key === 'a') {
            event.preventDefault();
            toggleAssistantChat();
        }
        
        // Escape = Close if open
        if (event.key === 'Escape' && assistantIsOpen) {
            toggleAssistantChat();
        }
    });
}

// TOGGLE CHAT
function toggleAssistantChat() {
    const container = document.getElementById('chatContainer');
    const trigger = document.getElementById('assistantTrigger');
    
    assistantIsOpen = !assistantIsOpen;
    
    if (assistantIsOpen) {
        container.classList.add('show');
        trigger.innerHTML = '<i class="fas fa-times"></i>';
        document.getElementById('messageInput').focus();
    } else {
        container.classList.remove('show');
        trigger.innerHTML = '<i class="fas fa-robot"></i>';
    }
}

// AUTO RESIZE TEXTAREA
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// HANDLE ENTER KEY
function handleAssistantKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAssistantMessage();
    }
}

// SEND QUICK ACTION
function sendQuickAction(message) {
    document.getElementById('messageInput').value = message;
    sendAssistantMessage();
}

// SEND MESSAGE
async function sendAssistantMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    addAssistantMessage(message, 'user');
    input.value = '';
    autoResizeTextarea(input);

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Show typing indicator
    showTypingIndicator();

    try {
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response
        addAssistantMessage(response, 'assistant');
        
        // Add to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: response
        });

    } catch (error) {
        console.error('Error getting AI response:', error);
        removeTypingIndicator();
        addAssistantMessage('Lo siento, ocurrió un error. Por favor intenta nuevamente.', 'assistant');
    }
}

// GET AI RESPONSE
async function getAIResponse(userMessage) {
    // Construir prompt del sistema con contexto de CobraSystem
    const systemPrompt = `Eres un asistente inteligente para CobraSystem, un sistema de gestión de cobranza y préstamos. 

CONTEXTO DEL SISTEMA:
- Sistema para gestionar clientes, préstamos, cuotas y pagos
- Incluye módulos de: Dashboard, Clientes, Préstamos, Pagos, Reportes, Notificaciones WhatsApp
- Base de datos en Supabase con tablas: clientes, creditos, cuotas, pagos, recordatorios_whatsapp
- Sistema de cobranza profesional para pequeñas y medianas empresas

TU FUNCIÓN:
- Ayudar con análisis de datos y reportes
- Proporcionar insights sobre el negocio
- Sugerir acciones para mejorar la cobranza
- Explicar funcionalidades del sistema
- Asistir con dudas sobre gestión financiera

CARACTERÍSTICAS DE TUS RESPUESTAS:
- Concisas pero informativas (máximo 3 párrafos)
- Usa emojis relevantes para hacer más amigable la conversación
- Incluye sugerencias de acciones concretas cuando sea apropiado
- Si necesitas datos específicos, menciona qué información necesitarías del sistema
- Mantén un tono profesional pero accesible

DATOS DISPONIBLES EN EL SISTEMA:
- Información de clientes (nombre, cédula, teléfono, dirección)
- Préstamos/créditos (monto, tasa, cuotas, fechas, estado)
- Cuotas (número, monto, vencimiento, estado de pago)
- Pagos (montos, fechas, métodos de pago)
- Notificaciones WhatsApp enviadas

Responde en español y enfócate en ser útil para la gestión del negocio de cobranza.`;

    const fullPrompt = `${systemPrompt}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}

Usuario: ${userMessage}

Responde de manera útil y concisa:`;

    try {
        // Intentar usar Claude API si está disponible
        if (window.claude && window.claude.complete) {
            const response = await window.claude.complete(fullPrompt);
            return response;
        } else {
            // Usar respuestas locales si Claude no está disponible
            return generateLocalResponse(userMessage);
        }
    } catch (error) {
        console.error('Claude API error:', error);
        return generateLocalResponse(userMessage);
    }
}

// RESPUESTAS LOCALES INTELIGENTES
function generateLocalResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cuotas vencidas') || lowerMessage.includes('mora')) {
        return `📊 **Análisis de Cuotas Vencidas**

Para revisar las cuotas vencidas te recomiendo:

• Ve al módulo **Reportes** → **Reporte de Morosidad**
• Usa filtros por días de atraso (30+, 60+ días)
• El sistema te mostrará clientes, montos y días de atraso

💡 **Sugerencia:** Prioriza contactar clientes con más de 60 días de atraso y utiliza el módulo de WhatsApp para recordatorios automáticos.

<div class="action-buttons">
<button class="action-btn" onclick="window.open('reportes.html', '_blank')">Ver Reportes</button>
<button class="action-btn secondary" onclick="sendQuickAction('¿Cómo contacto a clientes morosos?')">¿Cómo contactar?</button>
</div>`;
    }
    
    if (lowerMessage.includes('ingresos') || lowerMessage.includes('pagos') || lowerMessage.includes('cobrado')) {
        return `💰 **Análisis de Ingresos y Pagos**

Para revisar tus ingresos:

• **Dashboard** muestra ingresos del día y mes actual
• **Módulo Pagos** tiene el historial completo con filtros
• **Reportes** incluye análisis de flujo de caja y tendencias

📈 **KPIs importantes:** Total cobrado hoy, promedio diario, tendencias mensuales y tasa de cumplimiento de pagos.

<div class="action-buttons">
<button class="action-btn" onclick="window.open('dashboard.html', '_blank')">Ver Dashboard</button>
<button class="action-btn secondary" onclick="window.open('pagos.html', '_blank')">Ver Pagos</button>
</div>`;
    }
    
    if (lowerMessage.includes('cliente') || lowerMessage.includes('contactar')) {
        return `📱 **Gestión de Clientes**

Para gestionar tus clientes eficientemente:

• **Módulo Clientes:** Lista completa con datos de contacto
• **Notificaciones WhatsApp:** Envío automático de recordatorios
• **Portal del Cliente:** Acceso directo para que vean su estado

🚀 **Función destacada:** Recordatorios automáticos 3 días antes del vencimiento y seguimiento de cuotas pendientes.

<div class="action-buttons">
<button class="action-btn" onclick="window.open('clientes.html', '_blank')">Gestionar Clientes</button>
<button class="action-btn secondary" onclick="window.open('notificaciones.html', '_blank')">WhatsApp</button>
</div>`;
    }
    
    if (lowerMessage.includes('préstamo') || lowerMessage.includes('crédito')) {
        return `💰 **Gestión de Préstamos**

En el módulo de préstamos puedes:

• **Crear nuevos préstamos** con cálculo automático de cuotas
• **Ver cronogramas** de pago detallados
• **Usar la calculadora** para simular diferentes escenarios
• **Gestionar estados** (activo, cancelado, completado)

💡 **Tip:** Usa la calculadora antes de crear préstamos para mostrar opciones al cliente.

<div class="action-buttons">
<button class="action-btn" onclick="window.open('prestamos.html', '_blank')">Ver Préstamos</button>
<button class="action-btn secondary" onclick="sendQuickAction('¿Cómo calcular un préstamo?')">Calculadora</button>
</div>`;
    }
    
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('funciones') || lowerMessage.includes('qué puedes hacer')) {
        return `🤖 **Funciones de CobraSystem**

**📊 Dashboard:** Resumen ejecutivo en tiempo real
**👥 Clientes:** Gestión completa de base de datos
**💰 Préstamos:** Crear y administrar créditos
**💳 Pagos:** Registrar cobros y cuotas
**📈 Reportes:** Análisis avanzado de morosidad
**📱 WhatsApp:** Recordatorios automáticos

¿Sobre qué módulo específico te gustaría saber más?

<div class="action-buttons">
<button class="action-btn" onclick="sendQuickAction('Explícame el dashboard')">Dashboard</button>
<button class="action-btn secondary" onclick="sendQuickAction('¿Cómo funciona WhatsApp?')">WhatsApp</button>
</div>`;
    }
    
    // Respuesta genérica
    return `🤔 **Asistente CobraSystem**

Entiendo tu consulta. Te puedo ayudar con:

• 📊 Análisis de datos del sistema
• 💰 Estado de cuotas y pagos  
• 👥 Gestión de clientes
• 📈 Reportes y tendencias
• 📱 Configuración de notificaciones

¿Podrías ser más específico sobre qué información necesitas?

<div class="action-buttons">
<button class="action-btn" onclick="sendQuickAction('Muéstrame el resumen de mi negocio')">Resumen General</button>
<button class="action-btn secondary" onclick="sendQuickAction('¿Cómo mejoro mi cobranza?')">Mejores Prácticas</button>
</div>`;
}

// ADD MESSAGE TO CHAT
function addAssistantMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = content;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Hide suggestions after first user message
    if (sender === 'user' && conversationHistory.length === 1) {
        const suggestions = document.getElementById('suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }
}

// SHOW TYPING INDICATOR
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="loading-animation">
            <div class="loading-spinner"></div>
            Analizando datos...
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// REMOVE TYPING INDICATOR
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// SHOW WELCOME NOTIFICATION
function showWelcomeNotification() {
    const notification = document.createElement('div');
    notification.className = 'assistant-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-robot" style="font-size: 1.2rem;"></i>
            <div>
                <div style="font-weight: 600; margin-bottom: 4px;">¡Asistente IA disponible!</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">Haz clic para obtener ayuda inteligente</div>
            </div>
        </div>
    `;
    
    notification.onclick = () => {
        notification.remove();
        toggleAssistantChat();
    };
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 8000);
}

// FUNCIÓN PARA PREGUNTAR DIRECTAMENTE (DESDE OTRAS PÁGINAS)
function askAssistant(question) {
    // Abrir chat si no está abierto
    if (!assistantIsOpen) {
        toggleAssistantChat();
    }
    
    // Enviar pregunta automáticamente
    setTimeout(() => {
        document.getElementById('messageInput').value = question;
        sendAssistantMessage();
    }, 300);
}

// NOTIFICACIÓN PROACTIVA
function showAssistantNotification(message) {
    if (!assistantIsOpen) {
        const trigger = document.getElementById('assistantTrigger');
        if (trigger) {
            trigger.style.animation = 'pulse 0.5s ease 3';
            
            // Tooltip opcional
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: fixed;
                bottom: 110px;
                right: 30px;
                background: #1f2937;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.8rem;
                white-space: nowrap;
                z-index: 1001;
                animation: fadeInMessage 0.3s ease;
            `;
            tooltip.textContent = message;
            document.body.appendChild(tooltip);
            
            setTimeout(() => tooltip.remove(), 3000);
        }
    }
}

// INTEGRACIÓN CON DATOS DEL SISTEMA
function getSystemData() {
    // Esta función puede conectarse con tus datos de Supabase
    try {
        // Ejemplo de datos que podrías obtener
        return {
            totalClientes: document.getElementById('totalClientes')?.textContent || '0',
            creditosActivos: document.getElementById('creditosActivos')?.textContent || '0',
            cuotasVencidas: document.getElementById('cuotasVencidas')?.textContent || '0',
            totalPagado: document.getElementById('totalPagado')?.textContent || '$0',
            // Añade más campos según tus IDs
        };
    } catch (error) {
        console.log('No se pudieron obtener datos del sistema');
        return {};
    }
}

// EXPORTAR FUNCIONES GLOBALMENTE
window.CobraSystemAssistant = {
    toggle: toggleAssistantChat,
    ask: askAssistant,
    notify: showAssistantNotification,
    isOpen: () => assistantIsOpen,
    sendMessage: (msg) => {
        document.getElementById('messageInput').value = msg;
        sendAssistantMessage();
    }
};

// FUNCIONES GLOBALES (para compatibilidad)
window.toggleAssistantChat = toggleAssistantChat;
window.askAssistant = askAssistant;
window.sendQuickAction = sendQuickAction;
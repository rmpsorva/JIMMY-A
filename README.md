# 🎰 JimmyA Digital Casino - Fortuna de la Empanada

## 🚀 Visión General del Proyecto

JimmyA Digital Casino es una dApp (Aplicación Descentralizada) de juego de casino, construida con una arquitectura de frontend de alta calidad para interactuar con la **blockchain de Solana**.

El objetivo es ofrecer una experiencia de usuario fluida y divertida, utilizando el token de utilidad **$JIMMYA** como moneda de apuesta, donde los jugadores giran la "Slot de la Empanada" para ganar el gran Jackpot.

***

## 🔥 Arquitectura y Tecnologías (Nivel Dios)

El proyecto está estructurado profesionalmente en tres archivos, lo que facilita el desarrollo y el mantenimiento.

| Componente | Archivo | Tecnologías Clave |
| :--- | :--- | :--- |
| **Estructura** | `index.html` | HTML5, Meta Tags (SEO/PWA) |
| **Estilos** | `style.css` | CSS3 (Variables, Animaciones Neon, Responsive Design) |
| **Funcionalidad** | `script.js` | Solana Web3.js, SPL Token, Event Listeners, ES Modules |
| **Wallet** | (Integración) | **Phantom Wallet SDK** (`window.solana`) |

***

## ⚙️ Configuración y Ejecución Local

Para que la dApp funcione y se conecte a tu Phantom Wallet, **debes ejecutarla desde un servidor local**. Abrir `index.html` directamente (`file:///...`) causará errores de conexión por seguridad.

### 1. Instalación de Servidor Local

Utiliza Python (si lo tienes instalado) para levantar un servidor simple:

```bash
# 1. Navega a la carpeta del proyecto
cd /ruta/a/tu/carpeta/jimmy-casino

# 2. Ejecuta el servidor HTTP de Python
python3 -m http.server 8000

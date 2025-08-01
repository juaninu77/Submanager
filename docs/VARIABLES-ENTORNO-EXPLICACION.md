# 🔐 Variables de Entorno - Guía Completa para Principiantes

## ¿Qué son las Variables de Entorno?

Las **variables de entorno** son como "configuraciones secretas" que tu aplicación usa cuando está funcionando en producción (en Internet). Es como tener una caja fuerte donde guardas información importante que tu app necesita, pero que no quieres que aparezca en tu código público.

---

## 🔒 Variables de Seguridad JWT

### `JWT_SECRET` y `JWT_REFRESH_SECRET`
- **¿Qué son?** Claves secretas súper importantes para la seguridad
- **¿Para qué sirven?** Cuando un usuario se registra o hace login, tu app crea un "token" (como un pase VIP digital) que demuestra que es un usuario válido
- **¿Por qué son importantes?** Estas claves firman esos tokens para que nadie pueda falsificarlos
- **Analogía:** Es como el sello oficial de un banco en un cheque - sin él, cualquiera podría falsificar cheques

### `JWT_EXPIRES_IN` y `JWT_REFRESH_EXPIRES_IN`
- **¿Qué son?** Tiempo de vida de los tokens de usuario
- **¿Para qué sirven?** 
  - `JWT_EXPIRES_IN = 15m`: El token principal dura 15 minutos (por seguridad)
  - `JWT_REFRESH_EXPIRES_IN = 7d`: El token de renovación dura 7 días
- **¿Por qué así?** Si alguien roba tu token, solo sirve 15 minutos. Pero tu sesión puede durar 7 días renovándose automáticamente
- **Analogía:** Es como un pase de acceso temporal - se vence rápido, pero puedes renovarlo sin volver a hacer login

---

## 🛡️ Variables de Protección

### `BCRYPT_ROUNDS`
- **¿Qué es?** Nivel de encriptación para las contraseñas
- **¿Para qué sirve?** Cuando guardas tu contraseña, la app la "revuelve" 12 veces para que sea súper difícil de descifrar
- **¿Por qué 12?** Es el balance perfecto entre seguridad y velocidad
- **Analogía:** Es como pasar tu contraseña por una máquina trituradora 12 veces - cada vez se vuelve más irreconocible

### `COOKIE_SECRET`
- **¿Qué es?** Clave secreta para proteger las cookies del navegador
- **¿Para qué sirve?** Las cookies (datos que guarda tu navegador) se firman con esta clave para que nadie las modifique
- **Analogía:** Es como un sello de seguridad en un paquete - si alguien lo abre, te das cuenta

---

## 🌐 Variables de Conexión

### `CORS_ORIGIN`
- **¿Qué es?** Define qué sitios web pueden comunicarse con tu app
- **¿Para qué sirve?** Solo `https://submanager-zeta.vercel.app` puede hacer peticiones a tu backend
- **¿Por qué importante?** Evita que sitios maliciosos roben datos de tus usuarios
- **Analogía:** Es como una lista de invitados en una fiesta exclusiva - solo los que están en la lista pueden entrar

### `NEXT_PUBLIC_API_URL`
- **¿Qué es?** La dirección donde tu frontend busca el backend
- **¿Para qué sirve?** Le dice a tu app web dónde encontrar los datos (usuarios, suscripciones, etc.)
- **¿Por qué "PUBLIC"?** Esta variable SÍ se ve en el código del navegador (no es secreta)
- **Analogía:** Es como la dirección de tu casa - tu app necesita saber dónde ir a buscar la información

---

## ⚙️ Variables de Configuración

### `NODE_ENV`
- **¿Qué es?** Le dice a tu app que está en "modo producción"
- **¿Para qué sirve?** La app se comporta diferente:
  - Más rápida (código optimizado)
  - Menos mensajes de debug
  - Más segura
- **Analogía:** Es como cambiar de "modo práctica" a "modo partido oficial" en un videojuego

### `LOG_LEVEL`
- **¿Qué es?** Controla cuánta información se guarda en los logs
- **¿Para qué sirve?** `info` significa que solo se guardan eventos importantes, no todos los detalles
- **Analogía:** Es como configurar un diario para que solo escriba cosas importantes, no cada respiración

---

## 🔒 ¿Por qué no van en el código?

### ❌ **MAL - En el código:**
```javascript
const secret = "mi-clave-secreta-123" // ¡TODOS LO VEN!
```

### ✅ **BIEN - Variable de entorno:**
```javascript
const secret = process.env.JWT_SECRET // Solo tú lo sabes
```

**¿Por qué?** Tu código está en GitHub (público). Si pones secretos ahí, cualquiera puede robar las claves y hackear tu app.

---

## 🚀 ¿Cómo las usa tu app?

1. **Usuario hace login** → App usa `JWT_SECRET` para crear token seguro
2. **Usuario navega por la app** → Token se verifica con `JWT_SECRET`
3. **Frontend necesita datos** → Busca en `NEXT_PUBLIC_API_URL`
4. **Contraseña se guarda** → Se encripta con `BCRYPT_ROUNDS`
5. **Solo tu dominio** → Puede acceder gracias a `CORS_ORIGIN`

---

## 🎯 Resumen para Principiantes

**Variables de Entorno = Configuración Secreta de tu App**

- 🔐 **Secretos JWT**: Para que los tokens de usuario sean seguros
- 🛡️ **Protección**: Para que las contraseñas y cookies estén protegidas  
- 🌐 **Conexiones**: Para que solo tu app pueda acceder a los datos
- ⚙️ **Configuración**: Para que la app funcione en modo producción

**¡Es como tener una caja fuerte digital para tu aplicación!** 🔒✨
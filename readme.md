# Webhook Tester

Una aplicación moderna para probar, depurar y monitorear webhooks y APIs con endpoints dinámicos y respuestas personalizables.

## Características

- ✨ Creación de endpoints personalizados bajo demanda
- 🔄 Visualización en tiempo real de peticiones recibidas
- ⚙️ Configuración de respuestas por endpoint
- ⏱️ Simulación de latencia de red
- 🔎 Inspección detallada de peticiones y headers
- 💾 Persistencia de datos con SQLite
- 🌐 Interfaz web interactiva

## Instalación

### Con Docker (recomendado)

1. Asegúrate de tener Docker instalado

2. Construye la imagen Docker:
   ```bash
   docker build -t webhook-tester .
   ```

3. Ejecuta el contenedor:
   ```bash
   docker run -p 1994:1994 -v webhookdata:/app/data webhook-tester
   ```

4. Accede a la aplicación en tu navegador:
   ```
   http://localhost:1994
   ```

### Instalación manual

1. Asegúrate de tener Node.js instalado (v14 o superior)

2. Clona este repositorio o descarga los archivos

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Inicia la aplicación:
   ```bash
   npm start
   ```

5. Accede a la aplicación en tu navegador:
   ```
   http://localhost:1994
   ```

## Uso

### Crear un nuevo endpoint

1. Haz clic en el botón `+` en la sección de Endpoints
2. Ingresa el nombre del endpoint (por ejemplo, `pagos`)
3. Haz clic en "Crear"

Esto creará un nuevo endpoint disponible en `http://localhost:1994/pagos`

### Configurar respuestas personalizadas

1. Selecciona un endpoint de la lista
2. Ve a la pestaña "Configuración"
3. Configura:
    - Código de estado HTTP (por ejemplo, 200, 201, 400, 500)
    - Content-Type de la respuesta
    - Retraso de respuesta (en milisegundos)
    - Cuerpo de la respuesta (JSON, texto, HTML, etc.)
4. Haz clic en "Guardar Configuración"

### Ver peticiones recibidas

1. Selecciona un endpoint de la lista
2. Ve a la pestaña "Peticiones"
3. Todas las peticiones recibidas se mostrarán ordenadas por fecha
4. Haz clic en "Ver Headers" para ver detalles adicionales

### Probar el endpoint

Puedes enviar peticiones al endpoint creado usando herramientas como curl, Postman, o desde tu aplicación:

```bash
# Ejemplo con curl
curl -X POST http://localhost:1994/pagos \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "USD"}'
```

### Integración con tu aplicación

1. Configura tu aplicación para enviar peticiones a la URL del endpoint (ejemplo: `http://localhost:1994/pagos`)
2. Las peticiones recibidas aparecerán automáticamente en la interfaz

## Casos de uso

- Desarrollo y prueba de integraciones de pagos
- Depuración de webhooks de terceros
- Pruebas de sistemas de notificaciones
- Simulación de APIs para desarrollo frontend
- Educación y demostración de APIs

## Licencia

MIT
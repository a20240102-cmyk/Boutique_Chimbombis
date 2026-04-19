# Documentación de API - Boutique de Chimbombis

Esta API permite gestionar el inventario de la boutique (Ropa, Perfumes y Muebles).

**URL Base:** `http://localhost:3000`

## Reglas Generales
1. **Formato:** Todas las peticiones y respuestas son en formato JSON.
2. **Tipos de Datos:**
   - `precio`: Debe ser un número (puede tener decimales).
   - `stock`: Debe ser un número entero.
   - `material`: Se utiliza para definir la **categoría** (Ej: "Perfumes", "Ropa Mujer", "Ropa Hombre").

---

## Endpoints (Puntos de Acceso)

### 1. Obtener todos los productos
Recupera la lista completa del inventario, ordenada por los más recientes primero.

- **Método:** `GET`
- **Ruta:** `/api/muebles`
- **Respuesta Exitosa (200 OK):**
  ```json
  [
    {
      "id": 1,
      "nombre": "Perfume Chanel",
      "descripcion": "Fragancia floral...",
      "material": "Perfumes",
      "precio": 3200.00,
      "stock": 10
    },
    ...
  ]
  ```

### 2. Obtener un producto por ID
- **Método:** `GET`
- **Ruta:** `/api/muebles/:id`
- **Ejemplo:** `/api/muebles/5`
- **Regla:** Si el ID no existe, devuelve error 404.

### 3. Crear un producto (Agregar al inventario)
- **Método:** `POST`
- **Ruta:** `/api/muebles`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "Camisa de Seda",       // OBLIGATORIO
    "precio": 1200.50,                // OBLIGATORIO
    "descripcion": "Camisa suave...", // Opcional
    "material": "Ropa Mujer",         // Opcional (Usar para categoría)
    "stock": 50                       // Opcional (Default: 0)
  }
  ```
- **Reglas de Validación:**
  - Si falta `nombre` o `precio`, la API devolverá error 400.

### 4. Actualizar un producto
- **Método:** `PUT`
- **Ruta:** `/api/muebles/:id`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "Camisa de Seda Editada",
    "descripcion": "Nueva descripción...",
    "material": "Ropa Mujer",
    "precio": 1100.00,
    "stock": 45
  }
  ```

### 5. Eliminar un producto
- **Método:** `DELETE`
- **Ruta:** `/api/muebles/:id`
- **Respuesta Exitosa:**
  ```json
  { "message": "Mueble eliminado correctamente" }
  ```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200`  | Éxito (OK) |
| `201`  | Creado exitosamente |
| `400`  | Error del cliente (Faltan datos obligatorios) |
| `404`  | No encontrado (El ID no existe) |
| `500`  | Error del servidor (Fallo en base de datos) |

## Categorías Sugeridas (Campo 'material')
Para que los filtros del frontend funcionen correctamente, se recomienda usar estos valores en el campo `material`:
- `Perfumes`
- `Ropa Mujer`
- `Ropa Hombre`
- `Ofertas`
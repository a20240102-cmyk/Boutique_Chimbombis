/**
 * SCRIPT DE PRUEBA DE LA API
 * 
 * Para ejecutar este script:
 * 1. Asegúrate de que tu servidor principal esté corriendo (node server.js en otra terminal).
 * 2. Abre una terminal en esta carpeta.
 * 3. Ejecuta: node cliente_demo.js
 */

const API_URL = 'http://localhost:3000/api/muebles';

// Función auxiliar para mostrar resultados
const log = (titulo, data) => {
    console.log(`\n=== ${titulo} ===`);
    console.log(JSON.stringify(data, null, 2));
};

async function probarSistema() {
    console.log("Iniciando pruebas de conexión con la Boutique...");

    try {
        // 1. LISTAR PRODUCTOS
        const respuestaLista = await fetch(API_URL);
        const lista = await respuestaLista.json();
        log("1. Lista de productos (primeros 2)", lista.slice(0, 2));

        // 2. CREAR UN PRODUCTO NUEVO (Reglas: Nombre y Precio obligatorios)
        const nuevoProducto = {
            nombre: "Producto de Prueba API",
            descripcion: "Generado automáticamente por script",
            material: "Pruebas",
            precio: 999.99,
            stock: 10
        };

        const respuestaCrear = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        const creado = await respuestaCrear.json();
        log("2. Producto Creado", creado);

        if (creado.id) {
            // 3. ACTUALIZAR EL PRODUCTO CREADO
            const datosActualizar = { ...nuevoProducto, precio: 500.00, stock: 5 };
            const respuestaUpdate = await fetch(`${API_URL}/${creado.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizar)
            });
            const actualizado = await respuestaUpdate.json();
            log("3. Producto Actualizado (Precio bajó)", actualizado);

            // 4. ELIMINAR EL PRODUCTO (Limpieza)
            const respuestaDelete = await fetch(`${API_URL}/${creado.id}`, { method: 'DELETE' });
            const eliminado = await respuestaDelete.json();
            log("4. Producto Eliminado", eliminado);
        }

    } catch (error) {
        console.error("Error conectando con la API. ¿Está encendido el servidor?", error.message);
    }
}

probarSistema();
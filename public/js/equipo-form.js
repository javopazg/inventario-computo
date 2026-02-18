// Función para manejar el envío del formulario de equipo
document.addEventListener('DOMContentLoaded', async function() {
    const equipoForm = document.getElementById('equipoForm');
    const isEditing = window.location.pathname.includes('/editar/');
    
    // Extraer ID del equipo de la URL para edición
    const pathParts = window.location.pathname.split('/');
    const equipoId = pathParts[pathParts.length - 1];
    
    // Variable para almacenar el usuario original
    let usuarioOriginal = '';
    
    // Cargar datos del equipo si estamos editando y tenemos un ID válido
    if (isEditing && equipoId && equipoId !== 'editar') {
        await cargarDatosEquipo(equipoId);
        usuarioOriginal = document.querySelector('[name="usuarioAsignado"]').value;
    }
    
    // Manejar envío del formulario
    equipoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar campos obligatorios
        const camposObligatorios = ['numeroActivo', 'tipoEquipo', 'marca', 'modelo', 'cpu', 'ram', 'disco', 'numeroSerie', 'anioCompra', 'ubicacion', 'usuarioAsignado'];
        
        for (const campo of camposObligatorios) {
            const input = document.querySelector(`[name="${campo}"]`);
            if (!input.value.trim()) {
                alert(`El campo "${campo.replace(/([A-Z])/g, ' $1').trim()}" es obligatorio`);
                input.focus();
                return;
            }
        }
        
        // Validar año de compra
        const anioCompra = parseInt(document.querySelector('[name="anioCompra"]').value);
        const anioActual = new Date().getFullYear();
        if (anioCompra < 1900 || anioCompra > anioActual + 1) {
            alert(`El año de compra debe estar entre 1900 y ${anioActual + 1}`);
            document.querySelector('[name="anioCompra"]').focus();
            return;
        }
        
        // Recopilar datos del formulario
        const formData = new FormData(equipoForm);
        const equipoData = {};
        
        for (const [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                // Convertir campos numéricos
                if (key === 'anioCompra') {
                    equipoData[key] = parseInt(value);
                } else {
                    equipoData[key] = value.trim();
                }
            }
        }
        
        try {
            let response;
            const url = isEditing ? `/api/equipos/${equipoId}` : '/api/equipos';
            const method = isEditing ? 'PUT' : 'POST';
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(equipoData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Si estamos editando y cambió el usuario, mostrar confirmación
                if (isEditing && usuarioOriginal && equipoData.usuarioAsignado && usuarioOriginal !== equipoData.usuarioAsignado) {
                    alert(`Equipo actualizado correctamente.\n\nHistorial guardado:\nUsuario anterior: ${usuarioOriginal}\nUsuario nuevo: ${equipoData.usuarioAsignado}`);
                } else {
                    alert(isEditing ? 'Equipo actualizado correctamente' : 'Equipo agregado correctamente');
                }
                window.location.href = '/';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al guardar el equipo');
        }
    });
});

// Función para cargar datos de un equipo específico
async function cargarDatosEquipo(id) {
    try {
        const response = await fetch(`/api/equipos/${id}`);
        const equipo = await response.json();
        
        if (response.ok) {
            // Llenar formulario con los datos del equipo
            Object.keys(equipo).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    if (key === 'anioCompra' && equipo[key]) {
                        input.value = new Date(equipo[key]).getFullYear();
                    } else if (key === 'estado') {
                        input.value = equipo[key] || 'Usado';
                    } else {
                        input.value = equipo[key] || '';
                    }
                }
            });
        } else {
            alert('Error al cargar los datos del equipo: ' + equipo.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al cargar los datos del equipo');
    }
}
// Función para confirmar eliminación
function confirmDelete(id, tipo) {
    if (confirm(`¿Estás seguro de que deseas eliminar este ${tipo}?`)) {
        fetch(`/api/${tipo}s/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => console.error('Error:', error));
    }
}

// Función para cargar datos en formulario
function cargarDatos(id, tipo) {
    fetch(`/api/${tipo}s/${id}`)
        .then(response => response.json())
        .then(data => {
            // Llenar formulario con los datos
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            });
        })
        .catch(error => console.error('Error:', error));
}
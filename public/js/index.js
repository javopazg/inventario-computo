        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container || !window.bootstrap) {
                console.error('Toast container or Bootstrap not available');
                return;
            }
            const toastEl = document.createElement('div');
            toastEl.className = `toast align-items-center text-bg-${type} border-0`;
            toastEl.setAttribute('role', 'alert');
            toastEl.setAttribute('aria-live', 'assertive');
            toastEl.setAttribute('aria-atomic', 'true');
            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
                </div>
            `;
            container.appendChild(toastEl);
            const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
            toast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        }

        // Función para confirmar eliminación
        function confirmDelete(id, tipo) {
            if (confirm(`¿Estás seguro de que deseas eliminar este ${tipo}?`)) {
                fetch(`/api/${tipo}s/${id}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    showToast(data.message, 'success');
                    location.reload();
                })
                .catch(error => console.error('Error:', error));
            }
        }

        // Función para cargar datos en formulario (versión corregida)
        function cargarDatosEnFormulario(id, tipo) {
            console.log('🔄 Cargando datos para', tipo, 'con ID:', id);
            
            fetch(`/api/${tipo}s/${id}`)
                .then(response => response.json())
                .then(data => {
                    console.log('✅ Datos recibidos:', data);
                    
                    // ID del modal
                    const modalId = 'editarEquipoModal';
                    const modal = document.getElementById(modalId);
                    
                    if (!modal) {
                        console.error('❌ Modal no encontrado:', modalId);
                        return;
                    }
                    
                    console.log('📝 Llenando formulario en modal:', modalId);
                    
                    // Mapeo de campos especiales para equipos
                    const campoMapping = {
                        'numeroActivo': 'numeroActivo',
                        'tipoEquipo': 'tipoEquipo',
                        'marca': 'marca',
                        'modelo': 'modelo',
                        'cpu': 'cpu',
                        'ram': 'ram',
                        'disco': 'disco',
                        'numeroSerie': 'numeroSerie',
                        'anioCompra': 'anioCompra',
                        'ubicacion': 'ubicacion',
                        'usuarioAsignado': 'usuarioAsignado',
                        'claveAdministrador': 'claveAdministrador',
                        'claveRemota': 'claveRemota',
                        'claveBIOS': 'claveBIOS',
                        'tipoEscritorioRemoto': 'tipoEscritorioRemoto',
                        'comentario': 'comentario'
                    };
                    
                    let camposLlenados = 0;
                    
                    // Llenar campos usando el mapeo
                    Object.keys(campoMapping).forEach(dataKey => {
                        const formFieldName = campoMapping[dataKey];
                        const input = modal.querySelector(`[name="${formFieldName}"]`);
                        
                        if (input) {
                            input.value = data[dataKey] || '';
                            console.log(`✅ Campo "${formFieldName}" llenado con: "${data[dataKey] || ''}"`);
                            camposLlenados++;
                        } else {
                            console.warn(`⚠️ Campo no encontrado en formulario: "${formFieldName}"`);
                        }
                    });
                    
                    console.log(`📊 Resumen: ${camposLlenados} campos llenados de ${Object.keys(campoMapping).length} totales`);
                    
                    // Verificación final
                    setTimeout(() => {
                        console.log('🔍 Verificación final de valores:');
                        Object.keys(campoMapping).forEach(dataKey => {
                            const formFieldName = campoMapping[dataKey];
                            const input = modal.querySelector(`[name="${formFieldName}"]`);
                            if (input) {
                                console.log(`  ${formFieldName}: "${input.value}"`);
                            }
                        });
                    }, 100);
                    
                })
                .catch(error => {
                    console.error('❌ Error al cargar datos:', error);
                    showToast('Error al cargar los datos del formulario', 'danger');
                });
        }

        // Función para confirmar eliminación
        function confirmarEliminacion(id, tipo) {
            confirmDelete(id, tipo);
        }
    

        // Variable global para almacenar todos los equipos
        let todosLosEquipos = [];

        // Cargar listado de equipos
        async function cargarEquipos() {
            console.log('Cargando equipos...');
            try {
                const response = await fetch('/api/equipos');
                const equipos = await response.json();
                console.log('Equipos cargados:', equipos.length);
                
                todosLosEquipos = equipos;
                document.getElementById('loadingAlert').style.display = 'none';
                
                if (equipos.length === 0) {
                    document.getElementById('emptyAlert').style.display = 'block';
                } else {
                    document.getElementById('equiposContainer').style.display = 'block';
                    mostrarEquipos(equipos);
                    actualizarResumen(equipos);
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('loadingAlert').innerHTML = 'Error al cargar equipos';
            }
        }

        // Aplicar filtros combinados
        function aplicarFiltros() {
            const estadoSeleccionado = document.getElementById('filtroEstado').value;
            const textoBusqueda = document.getElementById('busquedaUsuario').value.trim().toLowerCase();
            
            let equiposFiltrados = [...todosLosEquipos];
            
            // Aplicar filtro por estado
            if (estadoSeleccionado) {
                equiposFiltrados = equiposFiltrados.filter(equipo => equipo.estado === estadoSeleccionado);
            }
            
            // Aplicar filtro por usuario
            if (textoBusqueda) {
                equiposFiltrados = equiposFiltrados.filter(equipo => 
                    equipo.usuarioAsignado && 
                    equipo.usuarioAsignado.toLowerCase().includes(textoBusqueda)
                );
            }
            
            // Mostrar/ocultar contenedor de resultados de búsqueda
            const contenedorBusqueda = document.getElementById('contenedorResultadosBusqueda');
            if (textoBusqueda) {
                contenedorBusqueda.style.display = 'block';
                document.getElementById('contadorCoincidencias').textContent = equiposFiltrados.length;
                document.getElementById('textoBusqueda').textContent = textoBusqueda;
            } else {
                contenedorBusqueda.style.display = 'none';
            }
            
            const tbody = document.getElementById('equiposTableBody');
            
            if (equiposFiltrados.length === 0) {
                if (textoBusqueda) {
                    tbody.innerHTML = `<tr><td colspan="11" class="text-center">No hay equipos con usuario que contenga "${textoBusqueda}"</td></tr>`;
                } else {
                    tbody.innerHTML = '<tr><td colspan="11" class="text-center">No hay equipos con el estado seleccionado</td></tr>';
                }
            } else {
                mostrarEquipos(equiposFiltrados);
            }
            
            // Actualizar contador de resultados
            actualizarContadorResultados(equiposFiltrados.length, todosLosEquipos.length);
        }

        // Actualizar contador de resultados
        function actualizarContadorResultados(cantidadFiltrada, cantidadTotal) {
            let mensaje = '';
            if (cantidadFiltrada < cantidadTotal) {
                mensaje = `Mostrando ${cantidadFiltrada} de ${cantidadTotal} equipos`;
            } else {
                mensaje = `Total: ${cantidadTotal} equipos`;
            }
            
            // Actualizar o crear el contador
            let contador = document.getElementById('contadorResultados');
            if (!contador) {
                const header = document.querySelector('.card-header h3');
                const contadorDiv = document.createElement('small');
                contadorDiv.id = 'contadorResultados';
                contadorDiv.className = 'text-muted ms-2';
                header.appendChild(contadorDiv);
                contador = document.getElementById('contadorResultados');
            }
            
            contador.textContent = mensaje;
        }

        // Mostrar equipos en la tabla
        function mostrarEquipos(equipos) {
            console.log('Mostrando equipos...');
            const tbody = document.getElementById('equiposTableBody');
            tbody.innerHTML = '';
            
            // Ordenar equipos
            equipos.sort((a, b) => {
                if (a.tipoEquipo !== b.tipoEquipo) {
                    return a.tipoEquipo === 'Laptop' ? -1 : 1;
                }
                return a.numeroActivo.localeCompare(b.numeroActivo);
            });
            
            equipos.forEach(equipo => {
                const row = document.createElement('tr');
                
                const estadoClass = {
                    'Nuevo': 'bg-success',
                    'Usado': 'bg-primary',
                    'En reparación': 'bg-warning',
                    'Dado de baja': 'bg-danger'
                }[equipo.estado] || 'bg-secondary';
                
                row.innerHTML = `
                    <td>
                        <button type="button" class="btn btn-link p-0 text-primary fw-bold" onclick="verHistorialCompleto('${equipo._id}')" title="Ver historial completo">
                            ${equipo.numeroActivo}
                        </button>
                    </td>
                    <td><span class="badge bg-light text-dark">${equipo.tipoEquipo}</span></td>
                    <td>${equipo.marca}</td>
                    <td>${equipo.modelo}</td>
                    <td><small>${equipo.cpu}</small></td>
                    <td><small>${equipo.ram}</small></td>
                    <td><small>${equipo.disco}</small></td>
                    <td><span class="badge bg-primary">${equipo.usuarioAsignado}</span></td>
                    <td><small>${equipo.ubicacion}</small></td>
                    <td><span class="badge ${estadoClass}">${equipo.estado}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="verHistorial('${equipo._id}')" title="Ver historial de usuarios">
                                <i class="fas fa-users"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="editarEquipo('${equipo._id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="eliminarEquipo('${equipo._id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            console.log('Equipos mostrados:', equipos.length);
        }

        // Actualizar resumen de estadísticas
        function actualizarResumen(equipos) {
            const total = equipos.length;
            const laptops = equipos.filter(e => e.tipoEquipo === 'Laptop').length;
            const pcs = equipos.filter(e => e.tipoEquipo === 'PC').length;
            const usados = equipos.filter(e => e.estado === 'Usado' || e.estado === 'Nuevo').length;
            
            document.getElementById('totalEquipos').textContent = total;
            document.getElementById('laptopsCount').textContent = laptops;
            document.getElementById('pcsCount').textContent = pcs;
            document.getElementById('usadosCount').textContent = usados;
        }

        // Funciones de acciones
        function verHistorial(id) {
            fetch(`/api/historial/equipo/${id}`)
                .then(response => response.json())
                .then(historial => {
                    mostrarModalHistorialUsuarios(historial, id);
                })
                .catch(error => {
                    console.error('Error al cargar historial:', error);
                    showToast('Error al cargar el historial de usuarios', 'danger');
                });
        }

        function verHistorialCompleto(id) {
            Promise.all([
                fetch(`/api/equipos/${id}`).then(response => response.json()),
                fetch(`/api/historial/equipo/${id}`).then(response => response.json())
            ])
            .then(([equipo, historial]) => {
                mostrarModalHistorialCompleto(equipo, historial);
            })
            .catch(error => {
                console.error('Error al cargar datos:', error);
                showToast('Error al cargar el historial completo', 'danger');
            });
        }

        function editarEquipo(id) {
            const modalEl = document.getElementById('editarEquipoModal');
            if (!modalEl) {
                showToast('No se pudo abrir el formulario de edición.', 'warning');
                return;
            }
            modalEl.dataset.equipoId = id;
            const form = document.getElementById('editarEquipoForm');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
            cargarDatosEnFormulario(id, 'equipo');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }

        function nuevoEquipo() {
            const modalEl = document.getElementById('nuevoEquipoModal');
            if (!modalEl) {
                showToast('No se pudo abrir el formulario de nuevo equipo.', 'warning');
                return;
            }
            const form = document.getElementById('nuevoEquipoForm');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }

        function eliminarEquipo(id) {
            if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
                fetch(`/api/equipos/${id}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    showToast(data.message, 'success');
                    cargarEquipos();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Error al eliminar el equipo', 'danger');
                });
            }
        }

        function mostrarModalHistorialUsuarios(historial, equipoId) {
            const historialOrdenado = [...historial].sort((a, b) => 
                new Date(b.fechaCambio) - new Date(a.fechaCambio)
            );
            
            const usuarioActual = historialOrdenado.length > 0 ? 
                historialOrdenado[0].valorNuevo : 'Sin asignar';
            
            const usuariosAnteriores = historialOrdenado.length > 1 ? 
                historialOrdenado.slice(1) : [];
            
            const modalHtml = `
                <div class="modal fade" id="historialUsuariosModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-users"></i> Historial de Usuarios Asignados
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${historial.length === 0 ? 
                                    '<p class="text-center text-muted">No hay cambios de usuarios registrados para este equipo.</p>' :
                                    `
                                    <div class="card mb-4 border-success bg-light">
                                        <div class="card-body">
                                            <h6 class="card-title text-success">
                                                <i class="fas fa-user-check"></i> Usuario Actual
                                            </h6>
                                            <div class="row align-items-center">
                                                <div class="col-md-8">
                                                    <span class="badge bg-success fs-6 p-2">${usuarioActual}</span>
                                                </div>
                                                <div class="col-md-4 text-end">
                                                    <small class="text-muted">
                                                        <i class="fas fa-calendar-check"></i><br>
                                                        ${new Date(historialOrdenado[0].fechaCambio).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    ${usuariosAnteriores.length > 0 ? `
                                        <div class="card border-warning bg-light">
                                            <div class="card-body">
                                                <h6 class="card-title text-warning mb-3">
                                                    <i class="fas fa-history"></i> Usuario(s) Anteriores
                                                </h6>
                                                ${usuariosAnteriores.map((cambio, index) => `
                                                    <div class="card mb-2 border-secondary">
                                                        <div class="card-body py-2">
                                                            <div class="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <span class="badge bg-warning text-dark">${cambio.valorNuevo}</span>
                                                                    ${index === usuariosAnteriores.length - 1 ? 
                                                                        `<small class="text-muted ms-2">(Usuario original)</small>` : ''}
                                                                </div>
                                                                <small class="text-muted">
                                                                    ${new Date(cambio.fechaCambio).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    `
                                }
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const modalExistente = document.getElementById('historialUsuariosModal');
            if (modalExistente) modalExistente.remove();
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modal = new bootstrap.Modal(document.getElementById('historialUsuariosModal'));
            modal.show();
        }

        let mostrarClaves = false;
        
        function toggleMostrarClaves() {
            mostrarClaves = !mostrarClaves;
            // Actualizar todos los campos de contraseña
            document.querySelectorAll('input[data-secret="true"]').forEach(input => {
                if (input.id !== 'busquedaUsuario') {
                    input.type = mostrarClaves ? 'text' : 'password';
                }
            });
            // Actualizar iconos
            document.querySelectorAll('[id^="iconoClaves"]').forEach(icono => {
                icono.className = mostrarClaves ? 'fas fa-eye-slash' : 'fas fa-eye';
            });
        }

        function mostrarModalHistorialCompleto(equipo, historial) {
            // Resetear visibilidad de claves
            mostrarClaves = false;
            
            const estadoBadge = equipo.estado === 'Nuevo'
                ? 'success'
                : equipo.estado === 'Usado'
                    ? 'primary'
                    : equipo.estado === 'En reparación'
                        ? 'warning'
                        : 'danger';

            const modalHtml = `
                <div class="modal fade historial-modal" id="historialModal" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-info-circle"></i>
                                    Información Completa del Equipo
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="historial-section mb-4">
                                    <div class="historial-section-header">
                                        <h6 class="historial-section-title">
                                            <i class="fas fa-desktop text-primary"></i>
                                            Datos del Equipo - ${equipo.numeroActivo}
                                        </h6>
                                        <span class="badge bg-${estadoBadge}">${equipo.estado}</span>
                                    </div>
                                    <div class="historial-section-body">
                                        <div class="historial-info-grid mb-4">
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Número de Activo</span>
                                                <span class="historial-info-value">${equipo.numeroActivo}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Tipo</span>
                                                <span class="historial-info-value">${equipo.tipoEquipo}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Marca</span>
                                                <span class="historial-info-value">${equipo.marca}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Modelo</span>
                                                <span class="historial-info-value">${equipo.modelo}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Número de Serie</span>
                                                <span class="historial-info-value">${equipo.numeroSerie}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Año de Compra</span>
                                                <span class="historial-info-value">${equipo.anioCompra}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">CPU</span>
                                                <span class="historial-info-value">${equipo.cpu}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">RAM</span>
                                                <span class="historial-info-value">${equipo.ram}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Disco</span>
                                                <span class="historial-info-value">${equipo.disco}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Usuario Asignado</span>
                                                <span class="historial-info-value">${equipo.usuarioAsignado}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Ubicación</span>
                                                <span class="historial-info-value">${equipo.ubicacion}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Tipo Escritorio Remoto</span>
                                                <span class="historial-info-value">${equipo.tipoEscritorioRemoto || 'No configurado'}</span>
                                            </div>
                                        </div>

                                        <div class="historial-section mb-4">
                                            <div class="historial-section-header">
                                                <h6 class="historial-section-title">
                                                    <i class="fas fa-key text-warning"></i>
                                                    Credenciales de Acceso
                                                </h6>
                                                <button class="btn btn-outline-secondary btn-sm" type="button" onclick="toggleMostrarClaves()">
                                                    <i class="fas fa-eye"></i> Mostrar/Ocultar
                                                </button>
                                            </div>
                                            <div class="historial-section-body">
                                                <div class="historial-credenciales">
                                                    <div class="credencial-card">
                                                        <div class="credencial-label">Clave Administrador</div>
                                                        <input type="${mostrarClaves ? 'text' : 'password'}" data-secret="true" class="form-control form-control-sm credencial-value" value="${equipo.claveAdministrador || 'No configurada'}" readonly>
                                                    </div>
                                                    <div class="credencial-card">
                                                        <div class="credencial-label">Clave Remota</div>
                                                        <input type="${mostrarClaves ? 'text' : 'password'}" data-secret="true" class="form-control form-control-sm credencial-value" value="${equipo.claveRemota || 'No configurada'}" readonly>
                                                    </div>
                                                    <div class="credencial-card">
                                                        <div class="credencial-label">Clave BIOS</div>
                                                        <input type="${mostrarClaves ? 'text' : 'password'}" data-secret="true" class="form-control form-control-sm credencial-value" value="${equipo.claveBIOS || 'No configurada'}" readonly>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="historial-info-grid">
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Comentarios</span>
                                                <span class="historial-info-value">${equipo.comentario || 'Sin comentarios'}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Fecha de Creación</span>
                                                <span class="historial-info-value">${new Date(equipo.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Última Actualización</span>
                                                <span class="historial-info-value">${new Date(equipo.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-warning" onclick="editarEquipo('${equipo._id}')">
                                    <i class="fas fa-edit"></i> Editar Equipo
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const modalExistente = document.getElementById('historialModal');
            if (modalExistente) modalExistente.remove();
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modal = new bootstrap.Modal(document.getElementById('historialModal'));
            modal.show();
        }

        // Iniciar carga
        document.addEventListener('DOMContentLoaded', function() {
            const nuevoForm = document.getElementById('nuevoEquipoForm');
            if (nuevoForm) {
                nuevoForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!nuevoForm.checkValidity()) {
                        nuevoForm.classList.add('was-validated');
                        return;
                    }

                    const formData = new FormData(nuevoForm);
                    const payload = {};
                    for (const [key, value] of formData.entries()) {
                        if (value !== null && value !== undefined && String(value).trim() !== '') {
                            payload[key] = key === 'anioCompra' ? parseInt(value, 10) : String(value).trim();
                        }
                    }

                    try {
                        const response = await fetch('/api/equipos', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Error al crear el equipo');
                        }

                        const modalEl = document.getElementById('nuevoEquipoModal');
                        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
                        if (modal) modal.hide();
                        await cargarEquipos();
                        showToast('Equipo agregado correctamente', 'success');
                    } catch (error) {
                        console.error('Error al crear:', error);
                        showToast(`Error al crear el equipo: ${error.message}`, 'danger');
                    }
                });
            }

            const editarForm = document.getElementById('editarEquipoForm');
            if (editarForm) {
                editarForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!editarForm.checkValidity()) {
                        editarForm.classList.add('was-validated');
                        return;
                    }

                    const modalEl = document.getElementById('editarEquipoModal');
                    const equipoId = modalEl ? modalEl.dataset.equipoId : null;
                    if (!equipoId) {
                        showToast('No se encontró el ID del equipo para editar.', 'warning');
                        return;
                    }

                    const formData = new FormData(editarForm);
                    const payload = {};
                    for (const [key, value] of formData.entries()) {
                        if (value !== null && value !== undefined && String(value).trim() !== '') {
                            payload[key] = key === 'anioCompra' ? parseInt(value, 10) : String(value).trim();
                        }
                    }

                    try {
                        const response = await fetch(`/api/equipos/${equipoId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Error al actualizar el equipo');
                        }

                        const modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) modal.hide();
                        await cargarEquipos();
                        showToast('Equipo actualizado correctamente', 'success');
                    } catch (error) {
                        console.error('Error al actualizar:', error);
                        showToast(`Error al actualizar el equipo: ${error.message}`, 'danger');
                    }
                });
            }
            cargarEquipos();
        });
    

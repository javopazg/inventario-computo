        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container || !window.bootstrap) {
                console.error('Toast container or Bootstrap not available');
                return;
            }
            const safeMessage = escapeHtml(message ?? '');
            const toastEl = document.createElement('div');
            toastEl.className = `toast align-items-center text-bg-${type} border-0`;
            toastEl.setAttribute('role', 'alert');
            toastEl.setAttribute('aria-live', 'assertive');
            toastEl.setAttribute('aria-atomic', 'true');
            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${safeMessage}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
                </div>
            `;
            container.appendChild(toastEl);
            const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
            toast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // Función para confirmar eliminación (se usa en eliminarEquipo)
    

        // Variable global para almacenar todos los equipos
        let todosLosEquipos = [];
        let equiposFiltrados = [];
        let currentPage = 1;
        const pageSize = 10;
        let equiposAbortController = null;

        // Cargar listado de equipos
        async function cargarEquipos() {
            console.log('Cargando equipos...');
            try {
                if (equiposAbortController) {
                    equiposAbortController.abort();
                }
                equiposAbortController = new AbortController();
                const response = await fetch('/api/equipos', { signal: equiposAbortController.signal });
                const equipos = await response.json();
                console.log('Equipos cargados:', equipos.length);
                
                todosLosEquipos = equipos;
                equiposFiltrados = [...equipos];
                currentPage = 1;
                document.getElementById('loadingAlert').style.display = 'none';
                
                if (equipos.length === 0) {
                    document.getElementById('emptyAlert').style.display = 'block';
                } else {
                    document.getElementById('equiposContainer').style.display = 'block';
                    mostrarEquipos(equipos);
                    actualizarResumen(equipos);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error:', error);
                }
                document.getElementById('loadingAlert').innerHTML = 'Error al cargar equipos';
            }
        }

        // Aplicar filtros combinados
        function aplicarFiltros() {
            const estadoSeleccionado = document.getElementById('filtroEstado').value;
            const textoBusqueda = document.getElementById('busquedaUsuario').value.trim().toLowerCase();
            
            equiposFiltrados = [...todosLosEquipos];
            
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

            renderActiveFilters(estadoSeleccionado, textoBusqueda);
            
            const tbody = document.getElementById('equiposTableBody');
            const safeBusqueda = escapeHtml(textoBusqueda);
            
            if (equiposFiltrados.length === 0) {
                if (textoBusqueda) {
                    tbody.innerHTML = `<tr><td colspan="11" class="text-center">No hay equipos con usuario que contenga "${safeBusqueda}"</td></tr>`;
                } else {
                    tbody.innerHTML = '<tr><td colspan="11" class="text-center">No hay equipos con el estado seleccionado</td></tr>';
                }
            } else {
                currentPage = 1;
                mostrarEquipos(equiposFiltrados);
            }
            
            // Actualizar contador de resultados
            actualizarContadorResultados(equiposFiltrados.length, todosLosEquipos.length);
        }

        function renderActiveFilters(estado, textoBusqueda) {
            const container = document.getElementById('activeFilters');
            if (!container) return;
            const chips = [];
            if (estado) {
                chips.push({ label: `Estado: ${estado}`, clear: () => {
                    document.getElementById('filtroEstado').value = '';
                }});
            }
            if (textoBusqueda) {
                chips.push({ label: `Usuario: ${textoBusqueda}`, clear: () => {
                    document.getElementById('busquedaUsuario').value = '';
                }});
            }
            if (chips.length === 0) {
                container.style.display = 'none';
                container.innerHTML = '';
                return;
            }
            container.style.display = 'flex';
            container.innerHTML = chips.map((chip, index) => `
                <span class="filter-chip">
                    ${escapeHtml(chip.label)}
                    <button type="button" data-chip-index="${index}" aria-label="Quitar filtro">×</button>
                </span>
            `).join('');
            container.querySelectorAll('button[data-chip-index]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.chipIndex, 10);
                    if (chips[idx]) chips[idx].clear();
                    aplicarFiltros();
                });
            });
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
            const safe = (value) => escapeHtml(value ?? '');
            
            // Ordenar equipos
            equipos.sort((a, b) => {
                if (a.tipoEquipo !== b.tipoEquipo) {
                    return a.tipoEquipo === 'Laptop' ? -1 : 1;
                }
                return a.numeroActivo.localeCompare(b.numeroActivo);
            });
            
            const paginated = paginate(equipos);
            paginated.forEach(equipo => {
                const row = document.createElement('tr');
                
                const estadoClass = {
                    'Nuevo': 'bg-success',
                    'Usado': 'bg-primary',
                    'En reparación': 'bg-warning',
                    'Dado de baja': 'bg-danger'
                }[equipo.estado] || 'bg-secondary';
                const estadoIcon = {
                    'Nuevo': 'fa-star',
                    'Usado': 'fa-circle-check',
                    'En reparación': 'fa-wrench',
                    'Dado de baja': 'fa-ban'
                }[equipo.estado] || 'fa-circle';
                
                const estadoSlug = String(equipo.estado || 'usado')
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z-]/g, '');
                row.classList.add(`row-estado-${estadoSlug}`);

                row.innerHTML = `
                    <td>
                        <button type="button" class="btn btn-link p-0 text-primary fw-bold" onclick="verHistorialCompleto('${equipo._id}')" title="Ver historial completo">
                            ${safe(equipo.numeroActivo)}
                        </button>
                    </td>
                    <td><span class="badge bg-light text-dark">${safe(equipo.tipoEquipo)}</span></td>
                    <td>${safe(equipo.marca)}</td>
                    <td>${safe(equipo.modelo)}</td>
                    <td><small>${safe(equipo.cpu)}</small></td>
                    <td><small>${safe(equipo.ram)}</small></td>
                    <td><small>${safe(equipo.disco)}</small></td>
                    <td>
                        <button type="button" class="btn user-pill" onclick="verHistorial('${equipo._id}')" title="Ver historial de usuarios">
                            <i class="fas fa-user"></i>
                            ${safe(equipo.usuarioAsignado)}
                        </button>
                    </td>
                    <td><small>${safe(equipo.ubicacion)}</small></td>
                    <td>
                        <span class="badge ${estadoClass}">
                            <i class="fas ${estadoIcon} me-1"></i>${safe(equipo.estado)}
                        </span>
                    </td>
                    <td>
                        <div class="dropdown action-dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Acciones del equipo">
                                Acciones
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><button class="dropdown-item" type="button" onclick="verHistorialCompleto('${equipo._id}')" aria-label="Ver información completa"><i class="fas fa-circle-info me-2"></i>Ver info</button></li>
                                <li><button class="dropdown-item" type="button" onclick="editarEquipo('${equipo._id}')" aria-label="Editar equipo"><i class="fas fa-pen me-2"></i>Editar</button></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><button class="dropdown-item text-danger" type="button" onclick="eliminarEquipo('${equipo._id}')" aria-label="Eliminar equipo"><i class="fas fa-trash me-2"></i>Eliminar</button></li>
                            </ul>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            console.log('Equipos mostrados:', equipos.length);
            renderPagination(equipos.length);
        }

        function paginate(items) {
            const start = (currentPage - 1) * pageSize;
            return items.slice(start, start + pageSize);
        }

        function renderPagination(totalItems) {
            const container = document.getElementById('paginationControls');
            if (!container) return;
            const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
            if (currentPage > totalPages) currentPage = totalPages;
            const prevDisabled = currentPage === 1 ? 'disabled' : '';
            const nextDisabled = currentPage === totalPages ? 'disabled' : '';
            container.className = 'pagination-controls d-flex justify-content-between align-items-center mt-3';
            container.innerHTML = `
                <button class="btn btn-outline-secondary btn-sm" id="prevPageBtn" ${prevDisabled}>Anterior</button>
                <div class="page-info">Página ${currentPage} de ${totalPages}</div>
                <button class="btn btn-outline-secondary btn-sm" id="nextPageBtn" ${nextDisabled}>Siguiente</button>
            `;
            container.querySelector('#prevPageBtn').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage -= 1;
                    mostrarEquipos(equiposFiltrados);
                }
            });
            container.querySelector('#nextPageBtn').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage += 1;
                    mostrarEquipos(equiposFiltrados);
                }
            });
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
                mostrarModalHistorialCompleto(equipo, historial || [], { editMode: false, isNew: false });
            })
            .catch(error => {
                console.error('Error al cargar datos:', error);
                showToast('Error al cargar la información del equipo', 'danger');
            });
        }

        function editarEquipo(id) {
            Promise.all([
                fetch(`/api/equipos/${id}`).then(response => response.json()),
                fetch(`/api/historial/equipo/${id}`).then(response => response.json())
            ])
            .then(([equipo, historial]) => {
                mostrarModalHistorialCompleto(equipo, historial || [], { editMode: true, isNew: false });
            })
            .catch(error => {
                console.error('Error al cargar datos:', error);
                showToast('Error al cargar la información del equipo', 'danger');
            });
        }

        function nuevoEquipo() {
            const emptyEquipo = {
                estado: 'Usado',
                tipoEquipo: 'Laptop'
            };
            mostrarModalHistorialCompleto(emptyEquipo, [], { editMode: true, isNew: true });
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
            const safe = (value) => escapeHtml(value ?? '');
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
                                                    <span class="badge bg-success fs-6 p-2">${safe(usuarioActual)}</span>
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
                                                                    <span class="badge bg-warning text-dark">${safe(cambio.valorNuevo)}</span>
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

        function mostrarModalHistorialCompleto(equipo, historial, options = {}) {
            // Resetear visibilidad de claves
            mostrarClaves = false;
            const historialOrdenado = [...historial].sort((a, b) => 
                new Date(b.fechaCambio) - new Date(a.fechaCambio)
            );
            const usuarioActual = historialOrdenado.length > 0 
                ? historialOrdenado[0].valorNuevo 
                : (equipo.usuarioAsignado || 'Sin asignar');
            const usuariosAnteriores = historialOrdenado.length > 1 
                ? historialOrdenado.slice(1, 4) 
                : [];
            const ultimaActualizacion = historialOrdenado.length > 0 
                ? new Date(historialOrdenado[0].fechaCambio).toLocaleDateString() 
                : 'Sin cambios';
            const safe = (value) => escapeHtml(value ?? '');
            const equipoSafe = {
                numeroActivo: safe(equipo.numeroActivo),
                tipoEquipo: safe(equipo.tipoEquipo),
                marca: safe(equipo.marca),
                modelo: safe(equipo.modelo),
                numeroSerie: safe(equipo.numeroSerie),
                anioCompra: safe(equipo.anioCompra),
                cpu: safe(equipo.cpu),
                ram: safe(equipo.ram),
                disco: safe(equipo.disco),
                usuarioAsignado: safe(equipo.usuarioAsignado),
                ubicacion: safe(equipo.ubicacion),
                tipoEscritorioRemoto: safe(equipo.tipoEscritorioRemoto),
                comentario: safe(equipo.comentario),
                claveAdministrador: safe(equipo.claveAdministrador),
                claveRemota: safe(equipo.claveRemota),
                claveBIOS: safe(equipo.claveBIOS)
            };
            const isNew = options.isNew === true;
            const editModeInitial = options.editMode === true;
            const estadoActual = equipo.estado || 'Usado';
            const modalTitle = isNew ? 'Nuevo Equipo' : 'Información Completa del Equipo';
            const equipoLabel = equipo.numeroActivo || 'Nuevo';
            
            const estadoBadge = estadoActual === 'Nuevo'
                ? 'success'
                : estadoActual === 'Usado'
                    ? 'primary'
                    : estadoActual === 'En reparación'
                        ? 'warning'
                        : 'danger';

            const modalHtml = `
                <div class="modal fade historial-modal" id="historialModal" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-info-circle"></i>
                                    ${modalTitle}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <ul class="nav nav-tabs modal-tabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" type="button" data-tab-target="datos">Datos</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" type="button" data-tab-target="usuarios">Usuarios</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" type="button" data-tab-target="credenciales">Credenciales</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" type="button" data-tab-target="comentarios">Comentarios</button>
                                    </li>
                                </ul>
                                <div class="modal-tab active" data-tab="datos">
                                <div class="historial-section mb-4">
                                    <div class="historial-section-header">
                                        <h6 class="historial-section-title">
                                            <i class="fas fa-desktop text-primary"></i>
                                            Datos del Equipo - <span class="historial-equipo-label">${safe(equipoLabel)}</span>
                                        </h6>
                                        <span class="badge bg-${estadoBadge}">${safe(estadoActual)}</span>
                                    </div>
                                    <div class="historial-section-body">
                                        <div class="historial-info-grid mb-4">
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Número de Activo</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="numeroActivo" value="${equipoSafe.numeroActivo}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Tipo</span>
                                                <select class="form-select form-select-sm historial-edit-field" data-field="tipoEquipo" disabled>
                                                    <option value="Laptop" ${equipo.tipoEquipo === 'Laptop' ? 'selected' : ''}>Laptop</option>
                                                    <option value="PC" ${equipo.tipoEquipo === 'PC' ? 'selected' : ''}>PC</option>
                                                </select>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Estado</span>
                                                <select class="form-select form-select-sm historial-edit-field" data-field="estado" disabled>
                                                    <option value="Nuevo" ${equipo.estado === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                                                    <option value="Usado" ${equipo.estado === 'Usado' ? 'selected' : ''}>Usado</option>
                                                    <option value="En reparación" ${equipo.estado === 'En reparación' ? 'selected' : ''}>En reparación</option>
                                                    <option value="Dado de baja" ${equipo.estado === 'Dado de baja' ? 'selected' : ''}>Dado de baja</option>
                                                </select>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Marca</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="marca" value="${equipoSafe.marca}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Modelo</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="modelo" value="${equipoSafe.modelo}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Número de Serie</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="numeroSerie" value="${equipoSafe.numeroSerie}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Año de Compra</span>
                                                <input type="number" class="form-control form-control-sm historial-edit-field" data-field="anioCompra" value="${equipoSafe.anioCompra}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">CPU</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="cpu" value="${equipoSafe.cpu}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">RAM</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="ram" value="${equipoSafe.ram}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Disco</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="disco" value="${equipoSafe.disco}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Usuario Asignado</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="usuarioAsignado" value="${equipoSafe.usuarioAsignado}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Ubicación</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="ubicacion" value="${equipoSafe.ubicacion}" readonly>
                                            </div>
                                            <div class="historial-info-item">
                                                <span class="historial-info-label">Tipo Escritorio Remoto</span>
                                                <input class="form-control form-control-sm historial-edit-field" data-field="tipoEscritorioRemoto" value="${equipoSafe.tipoEscritorioRemoto}" readonly>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div class="modal-tab" data-tab="usuarios">
                                        <div class="historial-section mb-4">
                                            <div class="historial-section-header">
                                                <h6 class="historial-section-title">
                                                    <i class="fas fa-user-clock text-info"></i>
                                                    Resumen de Usuarios
                                                </h6>
                                                <span class="badge bg-info">${historialOrdenado.length}</span>
                                            </div>
                                            <div class="historial-section-body">
                                                <div class="historial-info-grid">
                                                    <div class="historial-info-item">
                                                        <span class="historial-info-label">Usuario Actual</span>
                                                        <span class="historial-info-value">${safe(usuarioActual)}</span>
                                                    </div>
                                                    <div class="historial-info-item">
                                                        <span class="historial-info-label">Último Cambio</span>
                                                        <span class="historial-info-value">${ultimaActualizacion}</span>
                                                    </div>
                                                </div>
                                                <div class="mt-3">
                                                    <span class="historial-info-label">Usuarios Anteriores</span>
                                                    <div class="historial-item-badges mt-2">
                                                        ${usuariosAnteriores.length === 0 
                                                            ? '<span class="text-muted">Sin registros anteriores</span>'
                                                            : usuariosAnteriores.map(cambio => `
                                                                <span class="badge bg-secondary">${safe(cambio.valorAnterior)}</span>
                                                            `).join('')
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                                <div class="modal-tab" data-tab="credenciales">
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
                                                        <input id="cred-admin" type="${mostrarClaves ? 'text' : 'password'}" data-secret="true" data-field="claveAdministrador" class="form-control form-control-sm credencial-value historial-edit-field" value="${equipoSafe.claveAdministrador}" readonly>
                                                        <button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-copy-target="cred-admin">Copiar</button>
                                                    </div>
                                                    <div class="credencial-card">
                                                        <div class="credencial-label">Clave Remota</div>
                                                        <input id="cred-remota" type="${mostrarClaves ? 'text' : 'password'}" data-secret="true" data-field="claveRemota" class="form-control form-control-sm credencial-value historial-edit-field" value="${equipoSafe.claveRemota}" readonly>
                                                        <button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-copy-target="cred-remota">Copiar</button>
                                                    </div>
                                                    <div class="credencial-card">
                                                        <div class="credencial-label">Clave BIOS</div>
                                                        <input id="cred-bios" type="${mostrarClaves ? 'text' : 'password'}" data-secret="true" data-field="claveBIOS" class="form-control form-control-sm credencial-value historial-edit-field" value="${equipoSafe.claveBIOS}" readonly>
                                                        <button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-copy-target="cred-bios">Copiar</button>
                                                    </div>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-tab" data-tab="comentarios">
                                    <div class="historial-section mb-4">
                                        <div class="historial-section-header">
                                            <h6 class="historial-section-title">
                                                <i class="fas fa-comment text-secondary"></i>
                                                Comentarios y Fechas
                                            </h6>
                                        </div>
                                        <div class="historial-section-body">
                                            <div class="historial-info-grid">
                                                <div class="historial-info-item">
                                                    <span class="historial-info-label">Comentarios</span>
                                                    <textarea class="form-control form-control-sm historial-edit-field" data-field="comentario" rows="2" readonly>${equipoSafe.comentario}</textarea>
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
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-warning ${isNew ? 'd-none' : ''}" id="btnEditarEnModal">
                                    <i class="fas fa-edit"></i> Editar Equipo
                                </button>
                                <button type="button" class="btn btn-primary ${isNew || editModeInitial ? '' : 'd-none'}" id="btnGuardarEnModal">
                                    <i class="fas fa-save"></i> ${isNew ? 'Guardar equipo' : 'Guardar'}
                                </button>
                                <button type="button" class="btn btn-outline-secondary ${isNew || editModeInitial ? '' : 'd-none'}" id="btnCancelarEnModal">
                                    Cancelar
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
            const modalEl = document.getElementById('historialModal');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();

            const tabButtons = modalEl.querySelectorAll('[data-tab-target]');
            const tabPanels = modalEl.querySelectorAll('.modal-tab');
            tabButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-tab-target');
                    tabButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    tabPanels.forEach(panel => {
                        panel.classList.toggle('active', panel.getAttribute('data-tab') === target);
                    });
                });
            });

            modalEl.querySelectorAll('[data-copy-target]').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const targetId = btn.getAttribute('data-copy-target');
                    const input = modalEl.querySelector(`#${targetId}`);
                    if (!input) return;
                    if (!confirm('¿Deseas copiar este valor al portapapeles?')) return;
                    const value = input.value || '';
                    try {
                        await navigator.clipboard.writeText(value);
                        showToast('Copiado al portapapeles', 'success');
                    } catch (error) {
                        input.select();
                        document.execCommand('copy');
                        showToast('Copiado al portapapeles', 'success');
                    }
                });
            });

            const editableFields = modalEl.querySelectorAll('.historial-edit-field');
            const estadoBadgeEl = modalEl.querySelector('.historial-section-header .badge');
            const modalTitleEl = modalEl.querySelector('.modal-title');
            const equipoLabelEl = modalEl.querySelector('.historial-equipo-label');
            editableFields.forEach(field => {
                field.dataset.original = field.value;
            });

            const btnEditar = modalEl.querySelector('#btnEditarEnModal');
            const btnGuardar = modalEl.querySelector('#btnGuardarEnModal');
            const btnCancelar = modalEl.querySelector('#btnCancelarEnModal');
            let isCreate = isNew;

            const setEditMode = (enabled) => {
                editableFields.forEach(field => {
                    if (field.tagName === 'SELECT') {
                        field.disabled = !enabled;
                    } else if (field.tagName === 'TEXTAREA') {
                        field.readOnly = !enabled;
                    } else {
                        field.readOnly = !enabled;
                    }
                });
                if (isCreate) {
                    btnEditar.classList.add('d-none');
                    btnGuardar.classList.toggle('d-none', !enabled);
                    btnCancelar.classList.toggle('d-none', !enabled);
                } else {
                    btnEditar.classList.toggle('d-none', enabled);
                    btnGuardar.classList.toggle('d-none', !enabled);
                    btnCancelar.classList.toggle('d-none', !enabled);
                }
            };

            btnEditar.addEventListener('click', () => setEditMode(true));
            btnCancelar.addEventListener('click', () => {
                editableFields.forEach(field => {
                    field.value = field.dataset.original || '';
                });
                if (isCreate) {
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();
                } else {
                    setEditMode(false);
                }
            });

            btnGuardar.addEventListener('click', async () => {
                const payload = {};
                const requiredFields = [
                    'numeroActivo',
                    'tipoEquipo',
                    'marca',
                    'modelo',
                    'cpu',
                    'ram',
                    'disco',
                    'numeroSerie',
                    'anioCompra',
                    'ubicacion',
                    'usuarioAsignado'
                ];
                const missing = [];
                editableFields.forEach(field => {
                    const key = field.dataset.field;
                    if (!key) return;
                    const value = field.value;
                    const trimmed = value !== null && value !== undefined ? String(value).trim() : '';
                    if (requiredFields.includes(key) && !trimmed) {
                        missing.push(key);
                    }
                    if (trimmed !== '') {
                        payload[key] = key === 'anioCompra' ? parseInt(trimmed, 10) : trimmed;
                    }
                });
                if (missing.length > 0) {
                    showToast('Completa los campos obligatorios antes de guardar.', 'warning');
                    return;
                }

                try {
                    const endpoint = isCreate ? '/api/equipos' : `/api/equipos/${equipo._id}`;
                    const method = isCreate ? 'POST' : 'PUT';
                    const response = await fetch(endpoint, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.message || 'Error al guardar el equipo');
                    }
                    const actualizado = await response.json();
                    const wasCreate = isCreate;
                    editableFields.forEach(field => {
                        const key = field.dataset.field;
                        if (key && actualizado[key] !== undefined) {
                            field.value = actualizado[key] ?? '';
                            field.dataset.original = field.value;
                        }
                    });
                    if (estadoBadgeEl && actualizado.estado) {
                        const estadoClass = actualizado.estado === 'Nuevo'
                            ? 'success'
                            : actualizado.estado === 'Usado'
                                ? 'primary'
                                : actualizado.estado === 'En reparación'
                                    ? 'warning'
                                    : 'danger';
                        estadoBadgeEl.className = `badge bg-${estadoClass}`;
                        estadoBadgeEl.textContent = actualizado.estado;
                    }
                    if (isCreate) {
                        equipo._id = actualizado._id;
                        isCreate = false;
                        if (modalTitleEl) modalTitleEl.innerHTML = `<i class="fas fa-info-circle"></i> Información Completa del Equipo`;
                        if (equipoLabelEl) equipoLabelEl.textContent = actualizado.numeroActivo || 'Equipo';
                        btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
                    }
                    setEditMode(false);
                    showToast(wasCreate ? 'Equipo guardado correctamente' : 'Equipo actualizado correctamente', 'success');
                    cargarEquipos();
                } catch (error) {
                    console.error('Error al actualizar:', error);
                    showToast(`Error al guardar el equipo: ${error.message}`, 'danger');
                }
            });

            setEditMode(editModeInitial || isCreate);
        }

        // Iniciar carga
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('busquedaUsuario');
            if (searchInput) {
                let debounceTimer = null;
                searchInput.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        aplicarFiltros();
                    }, 250);
                });
            }
            cargarEquipos();
        });
    

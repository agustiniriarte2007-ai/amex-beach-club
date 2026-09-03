import { supabase } from './supabase.js'
import './admin.css'

const app = document.querySelector('#app')

function esc(v = '') {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]))
}

function login() {
  app.innerHTML = `
    <main class="admin-page">
      <div class="admin-card">
        <div class="section-label">AMEX BEACH CLUB · ADMIN</div>
        <h1>Administración</h1>
        <p>Ingresá para administrar el sitio.</p>

        <form id="loginForm">
          <label>Email
            <input name="email" type="email" required>
          </label>

          <label>Contraseña
            <input name="password" type="password" required>
          </label>

          <button class="btn dark" type="submit">Ingresar</button>
          <p id="loginStatus" class="form-status"></p>
        </form>
      </div>
    </main>
  `

  document.querySelector('#loginForm').onsubmit = async e => {
    e.preventDefault()

    const fd = new FormData(e.target)
    const status = document.querySelector('#loginStatus')
    status.textContent = 'Ingresando...'

    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email'),
      password: fd.get('password')
    })

    if (error) {
      status.textContent = error.message
    } else {
      renderAdmin()
    }
  }
}

async function getRows(table) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('id')

  if (error) throw error
  return data || []
}

const fields = {
  contenido: ['seccion', 'titulo', 'texto', 'imagen'],
  menu: ['nombre', 'descripcion', 'precio', 'categoria', 'imagen'],
  actividades: ['nombre', 'descripcion', 'imagen', 'orden'],
  reservas: [
    'nombre',
    'telefono',
    'email',
    'fecha',
    'hora',
    'personas',
    'mensaje',
    'estado'
  ]
}

async function renderAdmin() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    login()
    return
  }

  let contenido, menu, actividades, reservas

  try {
    contenido = await getRows('contenido')
    menu = await getRows('menu')
    actividades = await getRows('actividades')
    reservas = await getRows('reservas')
  } catch (error) {
    app.innerHTML = `
      <main class="admin-page">
        <div class="admin-card">
          <h1>Error al cargar</h1>
          <p>${esc(error.message)}</p>
        </div>
      </main>
    `
    return
  }

  app.innerHTML = `
    <main class="admin-page">

      <div class="admin-head">
        <div>
          <div class="section-label">AMEX BEACH CLUB</div>
          <h1>Administración</h1>
          <p>${esc(user.email)}</p>
        </div>

        <button class="btn" id="logout">
          Cerrar sesión
        </button>
      </div>

      ${section('Contenido', 'contenido', contenido)}
      ${section('Menú', 'menu', menu)}
      ${section('Actividades', 'actividades', actividades)}
      ${section('Reservas', 'reservas', reservas)}

    </main>

    <div class="modal" id="editModal">
      <div class="modal-card">
        <button class="close" id="closeModal">×</button>
        <div id="editor"></div>
      </div>
    </div>
  `

  document.querySelector('#logout').onclick = async () => {
    await supabase.auth.signOut()
    login()
  }

  document.querySelectorAll('.add').forEach(button => {
    button.onclick = () => editor(button.dataset.table)
  })

  document.querySelectorAll('.edit').forEach(button => {
    button.onclick = () => {
      const table = button.dataset.table
      const id = button.dataset.id

      const data = {
        contenido,
        menu,
        actividades,
        reservas
      }

      const item = data[table].find(
        row => String(row.id) === String(id)
      )

      editor(table, item)
    }
  })

  document.querySelectorAll('.delete').forEach(button => {
    button.onclick = async () => {
      if (!confirm('¿Eliminar este registro?')) return

      const { error } = await supabase
        .from(button.dataset.table)
        .delete()
        .eq('id', button.dataset.id)

      if (error) {
        alert(error.message)
      } else {
        renderAdmin()
      }
    }
  })

  document.querySelector('#closeModal').onclick = () => {
    document.querySelector('#editModal').classList.remove('open')
  }
}

function section(title, table, data) {
  return `
    <section class="admin-section">

      <div class="admin-section-head">
        <h2>${title}</h2>
        <button class="btn dark add" data-table="${table}">
          + Agregar
        </button>
      </div>

      <div class="admin-table-wrap">
        <table>

          <thead>
            <tr>
              ${fields[table].map(f => `<th>${f}</th>`).join('')}
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            ${
              data.length
                ? data.map(row => `
                    <tr>
                      ${fields[table].map(f => `
                        <td>${esc(row[f] ?? '')}</td>
                      `).join('')}

                      <td>
                        <button
                          class="small-btn edit"
                          data-table="${table}"
                          data-id="${row.id}">
                          Editar
                        </button>

                        <button
                          class="small-btn delete"
                          data-table="${table}"
                          data-id="${row.id}">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  `).join('')
                : `
                  <tr>
                    <td colspan="99">
                      Sin registros.
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>
      </div>

    </section>
  `
}

function editor(table, item = null) {
  const modal = document.querySelector('#editModal')
  const box = document.querySelector('#editor')

  box.innerHTML = `
    <div class="section-label">
      ${item ? 'EDITAR' : 'NUEVO'} · ${table}
    </div>

    <h2>${item ? 'Editar registro' : 'Agregar registro'}</h2>

    <form id="editorForm">

      ${fields[table].map(field => {

        const value = item?.[field] ?? ''

        if (
          field === 'texto' ||
          field === 'descripcion' ||
          field === 'mensaje'
        ) {
          return `
            <label>${field}
              <textarea name="${field}" rows="4">${esc(value)}</textarea>
            </label>
          `
        }

        return `
          <label>${field}
            <input
              name="${field}"
              value="${esc(value)}">
          </label>
        `
      }).join('')}

      <button class="btn dark" type="submit">
        Guardar
      </button>

      <p id="saveStatus" class="form-status"></p>

    </form>
  `

  modal.classList.add('open')

  document.querySelector('#editorForm').onsubmit = async e => {
    e.preventDefault()

    const fd = new FormData(e.target)
    const row = {}

    fields[table].forEach(field => {
      row[field] = fd.get(field) || null
    })

    const status = document.querySelector('#saveStatus')
    status.textContent = 'Guardando...'

    let result

    if (item) {
      result = await supabase
        .from(table)
        .update(row)
        .eq('id', item.id)
    } else {
      result = await supabase
        .from(table)
        .insert(row)
    }

    if (result.error) {
      status.textContent = result.error.message
    } else {
      modal.classList.remove('open')
      renderAdmin()
    }
  }
}

if (!supabase) {
  app.innerHTML = `
    <main class="admin-page">
      <div class="admin-card">
        <h1>Supabase no configurado</h1>
      </div>
    </main>
  `
} else {
  renderAdmin()
}

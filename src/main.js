import './style.css'
import { supabase, hasSupabase } from './supabase.js'

const app = document.querySelector('#app')

const fallbackContent = [
  {
    seccion: 'hero',
    titulo: 'AMEX BEACH CLUB',
    texto: 'Parada 30 · Playa Brava',
    imagen: ''
  }
]

const fallbackMenu = []
const fallbackActivities = []

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]))
}

function render(content, menu, activities) {
  app.innerHTML = `
    <main class="site">

      <section class="hero">
        <div class="hero-overlay">
          <div class="section-label">AMEX BEACH CLUB · PARADA 30</div>
          <h1>AMEX<br>BEACH CLUB</h1>
          <p>Tu lugar en Playa Brava.</p>
          <div class="hero-actions">
            <a class="btn dark" href="/admin">ADMINISTRACIÓN</a>
            <a class="btn" href="#carta">VER CARTA</a>
          </div>
        </div>
      </section>

      <section class="intro">
        <div>
          <div class="section-label">EL BEACH CLUB</div>
          <h2>Tu lugar en Punta del Este</h2>
        </div>
        <p>
          Playa, gastronomía y experiencias frente al mar.
          Disfrutá Parada 30 durante todo el día.
        </p>
      </section>

      <section class="services">
        <div class="service">SOMBRILLAS</div>
        <div class="service">CAMASTROS</div>
        <div class="service">BUNGALOWS</div>
        <div class="service">SERVICIO DE PLAYA</div>
        <div class="service">DUCHAS</div>
      </section>

      <section class="food" id="carta">
        <div class="section-label">GASTRONOMÍA</div>
        <h2>Sabores que completan la experiencia</h2>

        <div class="cards">
          ${
            menu.length
              ? menu.map(item => `
                  <article class="card">
                    ${item.imagen ? `<img src="${esc(item.imagen)}" alt="">` : ''}
                    <h3>${esc(item.nombre)}</h3>
                    <p>${esc(item.descripcion || '')}</p>
                    ${item.precio != null ? `<strong>$ ${esc(item.precio)}</strong>` : ''}
                  </article>
                `).join('')
              : '<p>Próximamente nuestra carta.</p>'
          }
        </div>
      </section>

      <section class="experiences">
        <div class="section-label">EXPERIENCIAS</div>
        <h2>Mucho más que playa</h2>

        <div class="experience-grid">
          ${
            activities.length
              ? activities.map(item => `
                  <article>
                    ${item.imagen ? `<img src="${esc(item.imagen)}" alt="">` : ''}
                    <h3>${esc(item.nombre)}</h3>
                    <p>${esc(item.descripcion || '')}</p>
                  </article>
                `).join('')
              : `
                  <div>SURF</div>
                  <div>YOGA</div>
                  <div>BEACH VOLLEY</div>
                  <div>FÚTBOL</div>
                  <div>JUEGOS DE PLAYA</div>
                  <div>FAMILIA</div>
                `
          }
        </div>
      </section>

      <section class="location" id="ubicacion">
        <div>
          <div class="section-label">UBICACIÓN</div>
          <h2>Parada 30<br>Playa Brava</h2>
          <p>Playa Brava · Parada 30<br>Punta del Este, Uruguay</p>
          <a
            class="btn"
            href="https://www.google.com/maps/search/?api=1&query=Parada+30+Playa+Brava+Punta+del+Este"
            target="_blank">
            CÓMO LLEGAR
          </a>
        </div>
      </section>

    </main>

    <footer class="footer">
      <div class="footer-brand">
        <strong>AMEX</strong>
        <span>BEACH CLUB</span>
        <small>· PARADA 30 ·</small>
      </div>

      <div class="contact">
        <h4>CONTACTO</h4>
        <p>
          Instagram · @amexbeachclub<br>
          Tel. +598 94 123 456<br>
          info@amexbeachclub.com
        </p>
      </div>
    </footer>
  `
}

async function loadData() {
  if (!hasSupabase) {
    render(fallbackContent, fallbackMenu, fallbackActivities)
    return
  }

  const [contentResult, menuResult, activitiesResult] =
    await Promise.all([
      supabase.from('contenido').select('*'),
      supabase.from('menu').select('*'),
      supabase.from('actividades').select('*').order('orden')
    ])

  const content = contentResult.error
    ? fallbackContent
    : (contentResult.data || fallbackContent)

  const menu = menuResult.error
    ? fallbackMenu
    : (menuResult.data || fallbackMenu)

  const activities = activitiesResult.error
    ? fallbackActivities
    : (activitiesResult.data || fallbackActivities)

  render(content, menu, activities)
}

async function init() {
  if (location.pathname.startsWith('/admin')) {
    return import('./admin.js')
  }

  try {
    await loadData()
  } catch (error) {
    console.error(error)
    render(fallbackContent, fallbackMenu, fallbackActivities)
  }
}

init()

import './style.css'
import { supabase, hasSupabase } from './supabase.js'

const app = document.querySelector('#app')

const fallback = {
  contenido: [
    {seccion:'hero_subtitle', texto:'PLAYA BRAVA · PUNTA DEL ESTE'},
    {seccion:'intro_title', texto:'Tu lugar en Punta del Este'},
    {seccion:'intro_text', texto:'Un punto de encuentro frente al mar para disfrutar de gastronomía, playa, deporte y experiencias para toda la familia.'}
  ],
  menu: [],
  actividades: []
}

function esc(v=''){
  return String(v).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]))
}

async function load(table){
  if(!hasSupabase) return fallback[table] || []
  const {data,error}=await supabase.from(table).select('*').order('orden',{ascending:true})
  if(error) return fallback[table] || []
  return data || []
}

async function render(){
  const [content,menu,activities]=await Promise.all([
    load('contenido'),
    load('menu'),
    load('actividades')
  ])

  const c = key => content.find(x=>x.seccion===key)?.texto || fallback.contenido.find(x=>x.seccion===key)?.texto || ''

  app.innerHTML=`
  <header class="site-header">
    <a href="#" class="logo">AMEX <span>BEACH CLUB</span><small>· PARADA 30 ·</small></a>
    <nav>
      <a href="#club">EL BEACH CLUB</a>
      <a href="#gastronomia">GASTRONOMÍA</a>
      <a href="#experiencias">EXPERIENCIAS</a>
      <a href="#ubicacion">UBICACIÓN</a>
      <a href="#reservas" class="nav-btn">RESERVAR</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p>${esc(c('hero_subtitle'))}</p>
        <h1>AMEX BEACH CLUB</h1>
        <h2>PARADA 30</h2>
        <div class="hero-actions">
          <a href="#reservas" class="btn">RESERVAR</a>
          <a href="#gastronomia" class="btn btn-light">VER CARTA</a>
        </div>
      </div>
    </section>

    <section id="club" class="intro">
      <p class="eyebrow">EL BEACH CLUB</p>
      <h2>${esc(c('intro_title'))}</h2>
      <p>${esc(c('intro_text'))}</p>
      <div class="features">
        ${['SOMBRILLAS','CAMASTROS','BUNGALOWS','SERVICIO DE PLAYA','DUCHAS'].map(x=>`<div><strong>${x}</strong><span>·</span></div>`).join('')}
      </div>
    </section>

    <section id="gastronomia" class="dark-section">
      <p class="eyebrow">GASTRONOMÍA</p>
      <h2>Sabores que completan<br>la experiencia</h2>
      <div class="cards">
        ${menu.length ? menu.map(m=>`
          <article class="card">
            ${m.imagen?`<img src="${esc(m.imagen)}" alt="">`:''}
            <div><p class="eyebrow">${esc(m.categoria||'MENÚ')}</p><h3>${esc(m.nombre)}</h3><p>${esc(m.descripcion||'')}</p><strong>${m.precio?'$ '+esc(m.precio):''}</strong></div>
          </article>`).join('') :
          ['RESTAURANTE','BAR','SUSHI'].map(x=>`<article class="card placeholder"><div><p class="eyebrow">${x}</p><h3>Próximamente</h3><p>Información y carta disponibles desde el panel de administración.</p></div></article>`).join('')}
      </div>
    </section>

    <section id="experiencias" class="experiences">
      <p class="eyebrow">EXPERIENCIAS</p>
      <h2>Un día para disfrutar</h2>
      <div class="activity-grid">
        ${activities.length ? activities.map(a=>`<article><p class="number">${String(a.orden||'').padStart(2,'0')}</p><h3>${esc(a.nombre)}</h3><p>${esc(a.descripcion||'')}</p></article>`).join('') :
        ['SURF','YOGA','BEACH VOLLEY','FÚTBOL','JUEGOS DE PLAYA','FAMILIA'].map((x,i)=>`<article><p class="number">${String(i+1).padStart(2,'0')}</p><h3>${x}</h3><p>Experiencia para disfrutar frente al mar.</p></article>`).join('')}
      </div>
    </section>

    <section id="ubicacion" class="location">
      <div>
        <p class="eyebrow">UBICACIÓN</p>
        <h2>Parada 30,<br>Playa Brava</h2>
        <p>Rambla Lorenzo Batlle Pacheco<br>Punta del Este, Uruguay</p>
        <a class="btn" href="https://www.google.com/maps/search/?api=1&query=Parada+30+Playa+Brava+Punta+del+Este" target="_blank">CÓMO LLEGAR</a>
      </div>
      <div class="map-box"><span>PARADA 30</span><small>PLAYA BRAVA · PUNTA DEL ESTE</small></div>
    </section>

    <section id="reservas" class="reservation">
      <p class="eyebrow">RESERVAS</p>
      <h2>Reservá tu experiencia</h2>
      <form id="reservationForm">
        <div class="form-grid">
          <input name="nombre" placeholder="Nombre y apellido" required>
          <input name="telefono" placeholder="Teléfono" required>
          <input name="email" type="email" placeholder="Email">
          <input name="fecha" type="date" required>
          <input name="hora" type="time">
          <input name="personas" type="number" min="1" placeholder="Personas" required>
        </div>
        <textarea name="mensaje" placeholder="Mensaje"></textarea>
        <button class="btn" type="submit">ENVIAR RESERVA</button>
        <p id="formMessage"></p>
      </form>
    </section>
  </main>

  <footer>
    <div><strong>AMEX BEACH CLUB</strong><small>· PARADA 30 ·</small></div>
    <p>${esc(c('contact_phone'))}</p>
    <p>${esc(c('contact_instagram'))}</p>
    <p>© ${new Date().getFullYear()} AMEX Beach Club</p>
    <a href="/admin">ADMIN</a>
  </footer>
  `

  document.querySelector('#reservationForm').onsubmit=async e=>{
    e.preventDefault()
    const msg=document.querySelector('#formMessage')
    const form=new FormData(e.target)
    const data=Object.fromEntries(form.entries())
    data.personas=Number(data.personas||0)
    data.estado='pendiente'

    if(!hasSupabase){
      msg.textContent='La reserva quedó preparada, pero falta conectar la base de datos.'
      return
    }

    const {error}=await supabase.from('reservas').insert(data)
    msg.textContent=error ? 'No pudimos guardar la reserva. Intentá nuevamente.' : '¡Reserva enviada! Nos comunicaremos contigo.'
    if(!error)e.target.reset()
  }
}

render()

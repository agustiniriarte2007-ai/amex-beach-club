import './style.css'
import { supabase, hasSupabase } from './supabase.js'

const fallback = {
  hero_subtitle:'PLAYA BRAVA · PUNTA DEL ESTE',
  intro_title:'Tu lugar en Punta del Este',
  intro_text:'Un punto de encuentro frente al mar para disfrutar de gastronomía, playa, deporte y experiencias para toda la familia.',
  location_title:'Parada 30, Playa Brava',
  location_text:'Playa Brava · Parada 30\nPunta del Este, Uruguay',
  contact_instagram:'@amexbeachclub', contact_phone:'+598 94 123 456', contact_email:'info@amexbeachclub.com'
}
const fallbackActivities=['SURF','YOGA','BEACH VOLLEY','FÚTBOL','JUEGOS DE PLAYA','FAMILIA']
const fallbackGallery=[
 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1476673160081-cf065607f449?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?auto=format&fit=crop&w=700&q=80'
]
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
async function getRows(table){
  if(!supabase) return []
  const {data,error}=await supabase.from(table).select('*').order('id')
  if(error){console.warn(table,error.message);return []}
  return data||[]
}
function contentMap(rows){const c={...fallback};for(const r of rows){if(r.seccion)c[r.seccion]=r.texto||r.imagen||r.titulo||''}return c}
async function submitReservation(form){
 const fd=new FormData(form); const row={nombre:fd.get('nombre'),telefono:fd.get('telefono'),email:fd.get('email'),fecha:fd.get('fecha')||null,hora:fd.get('hora'),personas:Number(fd.get('personas')||1),mensaje:fd.get('mensaje'),estado:'pendiente'}
 if(!supabase) throw new Error('Supabase no configurado')
 const {error}=await supabase.from('reservas').insert(row); if(error)throw error
}
function bg(url,fallbackUrl){return `background-image:linear-gradient(90deg,rgba(9,28,45,.34),rgba(9,28,45,.08)),linear-gradient(0deg,rgba(7,25,41,.18),rgba(7,25,41,.05)),url("${esc(url||fallbackUrl)}")`}
function page(content,menu,activities){
 const gallery=[1,2,3,4,5,6].map((n,i)=>content[`gallery_${n}`]||fallbackGallery[i])
 const heroImage=content.hero_image||'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85'
 const introImage=content.intro_image||'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=82'
 const menuRows=menu.length?menu:[{nombre:'Restaurante',descripcion:'Propuesta de cocina frente al mar',precio:null},{nombre:'Bar',descripcion:'Cócteles y bebidas para disfrutar frente al mar',precio:null},{nombre:'Sushi',descripcion:'Piezas y combinados',precio:null}]
 const menuCards=menuRows.map(m=>`<article class="menu-item"><div><b>${esc(m.nombre)}</b><p>${esc(m.descripcion||'')}</p></div>${m.precio!=null?`<strong>$U ${Number(m.precio).toLocaleString('es-UY')}</strong>`:''}</article>`).join('')
 const exp=activities.length?activities:fallbackActivities
 const expHtml=exp.map(a=>`<div class="exp"><div class="icon">◈</div><h3>${esc(a.nombre||a)}</h3></div>`).join('')
 document.querySelector('#app').innerHTML=`
<header><div class="nav"><a href="#inicio" class="logo"><strong>AMEX</strong><span>BEACH CLUB</span><small>· PARADA 30 ·</small></a><nav><a href="#club">El Beach Club</a><a href="#playa">Playa</a><a href="#gastronomia">Gastronomía</a><a href="#experiencias">Experiencias</a><a href="#galeria">Galería</a><a href="#ubicacion">Ubicación</a></nav><a href="#reservas" class="btn nav-res">Reservas</a></div></header>
<main>
<section class="hero" id="inicio" style="${bg(heroImage,'')}"><div class="hero-inner"><div class="eyebrow">${esc(content.hero_subtitle)}</div><h1>AMEX<span>BEACH CLUB</span></h1><div class="hero-sub">— PARADA 30 —</div><div class="hero-actions"><a href="#reservas" class="btn dark">Reservar</a><a href="#gastronomia" class="btn">Ver carta</a></div></div></section>
<section class="intro" id="club"><div class="intro-grid"><div class="intro-copy"><div class="section-label">El Beach Club</div><h2>${esc(content.intro_title)}</h2><p>${esc(content.intro_text)}</p><a class="btn" href="#playa">Conocé más</a></div><div class="intro-photo" style="background-image:url('${esc(introImage)}')"></div></div></section>
<section class="features" id="playa"><div class="container features-grid"><div class="feature"><div class="icon">♧</div><h3>SOMBRILLAS</h3><p>Equipadas para tu máximo confort.</p></div><div class="feature"><div class="icon">▱</div><h3>CAMASTROS</h3><p>Relajate frente al mar con el mejor servicio.</p></div><div class="feature"><div class="icon">⌂</div><h3>BUNGALOWS</h3><p>Espacios privados para disfrutar en grupo.</p></div><div class="feature"><div class="icon">◒</div><h3>SERVICIO DE PLAYA</h3><p>Gastronomía y tragos sin moverte de tu lugar.</p></div><div class="feature"><div class="icon">⌁</div><h3>DUCHAS</h3><p>Comodidad y bienestar todo el día.</p></div></div></section>
<section class="gastro" id="gastronomia"><div class="gastro-copy"><div class="section-label">Gastronomía</div><h2>Sabores que completan la experiencia</h2><p>Restaurante, bar y sushi con una propuesta pensada para acompañar cada momento frente al mar.</p><button class="btn" id="menuBtn">Ver menú</button></div><a class="gastro-card restaurant" href="#reservas"><span>RESTAURANTE</span></a><a class="gastro-card bar" href="#reservas"><span>BAR</span></a><a class="gastro-card sushi" href="#reservas"><span>SUSHI</span></a></section>
<section class="experiences" id="experiencias"><div class="section-label">Experiencias</div><div class="container exp-grid">${expHtml}</div></section>
<section class="gallery" id="galeria"><div class="section-label">Galería</div><div class="gallery-grid">${gallery.map((u,i)=>`<div class="g g${i+1}" style="background-image:url('${esc(u)}')"></div>`).join('')}</div><a href="#inicio" class="btn">Ver más</a></section>
<section class="location" id="ubicacion"><div class="location-copy"><div class="section-label">Ubicación</div><h2>${esc(content.location_title)}</h2><p>${esc(content.location_text).replace(/\n/g,'<br>')}</p><a class="btn" href="https://www.google.com/maps/search/?api=1&query=Parada+30+Playa+Brava+Punta+del+Este" target="_blank">Cómo llegar</a></div><div class="map"><div class="pin"></div><div class="map-label">PARADA 30</div></div><div class="location-side"><strong>Estamos en el corazón de Playa Brava.</strong><br>Un lugar único frente al mar para disfrutar Punta del Este.</div></section>
</main>
<footer class="footer" id="reservas"><div class="footer-brand"><strong>AMEX</strong><span>BEACH CLUB</span><small>· PARADA 30 ·</small></div><div class="contact"><h4>CONTACTO</h4><p>Instagram · ${esc(content.contact_instagram)}<br>Tel. ${esc(content.contact_phone)}<br>${esc(content.contact_email)}</p><a href="/admin" class="admin-link">Administración</a></div><div class="cta"><h4>RESERVÁ TU EXPERIENCIA</h4><p>Reservá tu lugar en la playa, tu mesa o tu bungalow y disfrutá Parada 30.</p><button class="btn dark" id="reserveBtn">Reservar ahora</button></div></footer>
<div class="modal" id="reserveModal"><div class="modal-card"><button class="close" id="closeModal">×</button><div class="section-label">Reservas</div><h2>Reservá tu experiencia</h2><form id="reservationForm"><div class="form-grid"><label>Nombre<input name="nombre" required></label><label>Teléfono<input name="telefono" required></label><label>Email<input name="email" type="email"></label><label>Fecha<input name="fecha" type="date"></label><label>Hora<input name="hora" type="time"></label><label>Personas<input name="personas" type="number" min="1" value="2"></label></div><label>Mensaje<textarea name="mensaje" rows="4" placeholder="Mesa, bungalow, servicio de playa..."></textarea></label><button class="btn dark" type="submit">Enviar reserva</button><p class="form-status" id="formStatus"></p></form></div></div>
<div class="menu-modal modal" id="menuModal"><div class="modal-card"><button class="close" id="closeMenu">×</button><div class="section-label">Carta</div><h2>Menú</h2><div>${menuCards}</div></div></div>`
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}}))
 const rm=document.querySelector('#reserveModal'),mm=document.querySelector('#menuModal');document.querySelector('#reserveBtn').onclick=()=>rm.classList.add('open');document.querySelector('#closeModal').onclick=()=>rm.classList.remove('open');document.querySelector('#menuBtn').onclick=()=>mm.classList.add('open');document.querySelector('#closeMenu').onclick=()=>mm.classList.remove('open')
 document.querySelector('#reservationForm').onsubmit=async e=>{e.preventDefault();const s=document.querySelector('#formStatus');s.textContent='Enviando...';try{await submitReservation(e.target);s.textContent='¡Reserva recibida! Te contactaremos para confirmarla.';e.target.reset()}catch(err){s.textContent='No se pudo guardar. Intentá nuevamente.';console.error(err)}}
}
async function init(){if(location.pathname.startsWith('/admin'))return import('./admin.js');const [cr,m,a]=await Promise.all([getRows('contenido'),getRows('menu'),getRows('actividades')]);page(contentMap(cr),m,a)}
init().catch(e=>{console.error(e);page(fallback,[],[])})

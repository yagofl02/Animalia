import React, { useState, useEffect } from 'react';
import { MapPin, Heart, Camera, User, Dog, Plus, Github, Home, Map, MessageCircle, LogIn } from 'lucide-react';
import logo from '../IMG/animalialogo.jpg'

export default function Animalia() {
  const [currentView, setCurrentView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPark, setSelectedPark] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (currentView === 'map' && !mapLoaded) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      setMapLoaded(true);
    }
  }, [currentView, mapLoaded]);

  const initMap = () => {
    if (typeof L !== 'undefined') {
      const map = L.map('map').setView([43.3614, -5.8493], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Icono personalizado para parques
      const parkIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="font-size: 32px;">🌳</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const vetIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="font-size: 32px;">🏥</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const shopIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="font-size: 32px;">🏪</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const groomIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="font-size: 32px;">✂️</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Añadir marcadores
      locations.forEach(loc => {
        let icon;
        switch (loc.type) {
          case 'parque': icon = parkIcon; break;
          case 'veterinario': icon = vetIcon; break;
          case 'tienda': icon = shopIcon; break;
          case 'peluqueria': icon = groomIcon; break;
        }

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${loc.name}</b><br>${loc.type}`);

        if (loc.hasPets) {
          marker.on('click', () => setSelectedPark(loc.name));
        }
      });
    }
  };

  // Datos de ejemplo de mascotas en parques
  const parksData = {
    'Parque San Francisco': [
      { owner: 'María G.', pet: 'Luna', breed: 'Golden Retriever', time: 'Hace 15 min' },
      { owner: 'Carlos R.', pet: 'Max', breed: 'Beagle', time: 'Hace 30 min' }
    ],
    'Parque del Oeste': [
      { owner: 'Ana M.', pet: 'Rocky', breed: 'Pastor Alemán', time: 'Hace 5 min' }
    ],
    'Campo San Francisco': [
      { owner: 'Luis P.', pet: 'Toby', breed: 'Labrador', time: 'Hace 20 min' },
      { owner: 'Elena S.', pet: 'Coco', breed: 'French Bulldog', time: 'Hace 10 min' }
    ]
  };

  // Ubicaciones de ejemplo en Oviedo
  const locations = [
    { name: 'Clínica Veterinaria Centro', type: 'veterinario', lat: 43.362, lng: -5.844 },
    { name: 'Tienda Mascotas Oviedo', type: 'tienda', lat: 43.363, lng: -5.843 },
    { name: 'Peluquería Canina Asturias', type: 'peluqueria', lat: 43.361, lng: -5.845 },
    { name: 'Parque San Francisco', type: 'parque', lat: 43.360, lng: -5.844, hasPets: true },
    { name: 'Parque del Oeste', type: 'parque', lat: 43.365, lng: -5.850, hasPets: true },
    { name: 'Campo San Francisco', type: 'parque', lat: 43.358, lng: -5.842, hasPets: true }
  ];

  // Posts de ejemplo
  const posts = [
    { user: 'María G.', pet: 'Luna', content: '¡Día perfecto en el parque! 🐕', image: true, likes: 24 },
    { user: 'Carlos R.', pet: 'Max', content: 'Buscamos compañeros de paseo por Oviedo', likes: 12 },
    { user: 'Ana M.', pet: 'Rocky', content: 'Recomiendo la nueva peluquería en el centro', likes: 18 }
  ];

  const getLocationIcon = (type) => {
    switch (type) {
      case 'veterinario': return '🏥';
      case 'tienda': return '🏪';
      case 'peluqueria': return '✂️';
      case 'parque': return '🌳';
      default: return '📍';
    }
  };

  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src={logo}
              alt="Animalia Logo"
              className="w-24 h-24 mr-4"
            />
            <h1 className="text-6xl font-bold">Animalia Oviedo</h1>
          </div>
          <p className="text-2xl mb-8">La red social para dueños de mascotas en Oviedo</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Conecta con otros dueños, descubre lugares pet-friendly y encuentra a tus amigos
            peludos en los parques de la ciudad
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
            >
              Comenzar ahora
            </button>
            <a
              href="https://github.com/yagofl02/Animalia"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              Ver en GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">¿Qué puedes hacer?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-bold mb-3">Comparte momentos</h3>
            <p className="text-gray-600">Publica fotos y experiencias con tu mascota</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
            <Map className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold mb-3">Explora Oviedo</h3>
            <p className="text-gray-600">Descubre veterinarios, tiendas y parques</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
            <Dog className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold mb-3">Encuentra amigos</h3>
            <p className="text-gray-600">Ve quién está en los parques en tiempo real</p>
          </div>
        </div>
      </div>
    </div>
  );

  const FeedView = () => (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <textarea
              className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="¿Qué está haciendo tu mascota hoy?"
              rows="3"
            />
            <div className="flex gap-2 mt-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <Camera className="w-4 h-4" />
                Foto
              </button>
              <button className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      {posts.map((post, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">{post.user}</p>
              <p className="text-sm text-gray-500">con {post.pet}</p>
            </div>
          </div>
          <p className="mb-3">{post.content}</p>
          {post.image && (
            <div className="bg-gradient-to-br from-blue-100 to-green-100 h-64 rounded-lg mb-3 flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Heart className="w-5 h-5 cursor-pointer hover:text-red-500 transition" />
            <span className="text-sm">{post.likes}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const MapView = () => (
    <div className="h-screen flex">
      <div className="flex-1 relative">
        <div id="map" className="w-full h-full"></div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Lugares en Oviedo</h2>

          {selectedPark ? (
            <div className="mb-6">
              <button
                onClick={() => setSelectedPark(null)}
                className="text-blue-600 mb-4 hover:underline"
              >
                ← Volver
              </button>
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="text-xl font-bold mb-4">{selectedPark}</h3>
                <p className="text-sm text-gray-600 mb-4">Mascotas en el parque ahora:</p>
                {parksData[selectedPark]?.map((entry, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Dog className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.pet}</p>
                      <p className="text-sm text-gray-600">{entry.breed}</p>
                      <p className="text-xs text-gray-500">{entry.owner} • {entry.time}</p>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar mi presencia
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => loc.hasPets && setSelectedPark(loc.name)}
                  className={`bg-gray-50 rounded-lg p-4 ${loc.hasPets ? 'cursor-pointer hover:bg-gray-100' : ''} transition`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getLocationIcon(loc.type)}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{loc.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{loc.type}</p>
                      {loc.hasPets && (
                        <p className="text-xs text-green-600 mt-1">
                          {parksData[loc.name]?.length || 0} mascota(s) ahora
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Únete a Animalia</h2>
        <div className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Nombre de tu mascota"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Raza de tu mascota"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold mb-4">
          Crear cuenta
        </button>
        <p className="text-center text-gray-600 mb-4">
          ¿Ya tienes cuenta? <button className="text-blue-600 hover:underline">Inicia sesión</button>
        </p>
        <button
          onClick={() => setShowLogin(false)}
          className="w-full text-gray-600 hover:text-gray-800 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <img
                src={logo}
                alt="Animalia Logo"
                className="w-24 h-24 mr-4"
              />
              <span className="text-2xl font-bold text-gray-800">Animalia</span>
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentView === 'home' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Home className="w-5 h-5" />
                Inicio
              </button>
              <button
                onClick={() => setCurrentView('feed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentView === 'feed' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MessageCircle className="w-5 h-5" />
                Feed
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentView === 'map' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MapPin className="w-5 h-5" />
                Mapa
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
              >
                <LogIn className="w-5 h-5" />
                Entrar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      {currentView === 'home' && <HomeView />}
      {currentView === 'feed' && <FeedView />}
      {currentView === 'map' && <MapView />}

      {/* Login Modal */}
      {showLogin && <LoginModal />}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="mb-4">Animalia - Red social para dueños de mascotas en Oviedo, Asturias</p>
          <a
            href="https://github.com/yagofl02/Animalia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <Github className="w-5 h-5" />
            Ver proyecto en GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
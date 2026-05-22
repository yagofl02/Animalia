import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Camera,
  CalendarDays,
  Compass,
  Dog,
  Github,
  Heart,
  Home,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  Search,
  Store,
  Stethoscope,
  Scissors,
  User,
  Users,
  Navigation,
  Sparkles,
  Upload,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { request } from "./api.js";

const locationFilters = [
  { value: "all", label: "Todo" },
  { value: "parque", label: "Parques" },
  { value: "veterinario", label: "Veterinarios" },
  { value: "tienda", label: "Tiendas" },
  { value: "peluqueria", label: "Peluquerías" },
];

const palette = ["#0f766e", "#2563eb", "#9333ea", "#ea580c", "#be123c", "#047857"];
const OVIEDO_CENTER = { lat: 43.3614, lng: -5.8493 };

function getDistanceKm(origin, destination) {
  if (!origin || !destination) return Infinity;
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(destination.lat) - toRad(origin.lat);
  const dLng = toRad(destination.lng) - toRad(origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateRoute(origin, destination) {
  const distanceKm = getDistanceKm(origin, destination);
  return {
    distanceKm: distanceKm.toFixed(2),
    minutes: Math.max(1, Math.round((distanceKm / 4.5) * 60)),
  };
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen."));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("La imagen no puede superar los 4 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function svgAvatar(seed, type = "person") {
  const text = (seed || "Animalia").trim();
  const color = palette[Math.abs([...text].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % palette.length];
  const initials =
    type === "pet"
      ? "🐾"
      : text
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="80" fill="${color}"/>
      <circle cx="120" cy="36" r="34" fill="rgba(255,255,255,.16)"/>
      <circle cx="42" cy="128" r="28" fill="rgba(255,255,255,.14)"/>
      <text x="80" y="${type === "pet" ? 96 : 94}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${type === "pet" ? 54 : 48}" font-weight="700" fill="white">${initials}</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatPresenceTime(value) {
  if (!value) return "ahora";
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `hace ${hours} h`;
}

export default function Animalia() {
  const [currentView, setCurrentView] = useState("home");
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPark, setSelectedPark] = useState(null);
  const [locations, setLocations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [publicProfile, setPublicProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    location_id: "",
    event_date: "",
  });
  const [presences, setPresences] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [authMode, setAuthMode] = useState("register");
  const [message, setMessage] = useState("");
  const [mapFilter, setMapFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: "",
    type: "parque",
    address: "",
    lat: "43.3614",
    lng: "-5.8493",
    has_pets: true,
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("animalia_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    pet_name: "",
    breed: "",
    city: "Oviedo",
    bio: "",
    theme_color: "#0f766e",
    avatar_url: "",
    pet_image_url: "",
  });
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const filteredLocations = useMemo(() => {
    const text = search.trim().toLowerCase();
    return locations.filter((location) => {
      const matchesType = mapFilter === "all" || location.type === mapFilter;
      const matchesText = !text || location.name.toLowerCase().includes(text);
      return matchesType && matchesText;
    });
  }, [locations, mapFilter, search]);

  function clearRoute() {
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setRouteInfo(null);
  }

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedPark?.id),
    [locations, selectedPark]
  );

  const parkCount = locations.filter((location) => location.type === "parque").length;
  const activePets = presences.length || locations.filter((location) => location.has_pets).length;
  const recommendedLocation = useMemo(() => {
    const origin = userPosition || OVIEDO_CENTER;
    return locations
      .filter((location) => location.has_pets)
      .map((location) => ({ ...location, distance: getDistanceKm(origin, location) }))
      .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))[0];
  }, [locations, userPosition]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPark?.id) {
      loadPresences(selectedPark.id);
    } else {
      setPresences([]);
    }
  }, [selectedPark]);

  useEffect(() => {
    if (currentView !== "map") return;

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([43.3614, -5.8493], 14);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
      }).addTo(mapRef.current);
      setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = filteredLocations.map((location) => {
      const marker = L.marker([Number(location.lat), Number(location.lng)], {
        icon: getLeafletIcon(location.type, selectedPark?.id === location.id),
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <strong>${location.name}</strong><br/>
        <span>${labelForType(location.type)}</span>
        ${location.has_pets ? "<br/><span>Hay mascotas cerca</span>" : ""}
      `);
      marker.on("click", () => {
        setSelectedPark(location);
        clearRoute();
        mapRef.current?.flyTo([Number(location.lat), Number(location.lng)], 16, { duration: 0.8 });
      });

      return marker;
    });

    if (userPosition) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
        icon: L.divIcon({
          className: "animalia-user-marker",
          html: "<span></span>",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("Tu ubicación");
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (selectedLocation) {
      mapRef.current.flyTo([Number(selectedLocation.lat), Number(selectedLocation.lng)], 16, {
        duration: 0.8,
      });
    }

    requestAnimationFrame(() => mapRef.current?.invalidateSize());

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [currentView, filteredLocations, selectedLocation, selectedPark?.id, userPosition]);

  useEffect(() => {
    if (currentView === "map" || !mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    mapRef.current.remove();
    mapRef.current = null;
  }, [currentView]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapContainerRef.current = null;
    };
  }, []);

  async function loadInitialData() {
    setIsLoading(true);
    try {
      const [locationsData, postsData] = await Promise.all([
        request("/api/locations"),
        request("/api/posts"),
      ]);
      setLocations(locationsData);
      setPosts(postsData);
      setEvents(await request("/api/events"));
      setUsers(await request("/api/users"));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
      loadFavorites(user.id);
    } else {
      setProfile(null);
      setFavorites([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (profile) {
      setAuthForm((current) => ({
        ...current,
        city: profile.city || "Oviedo",
        bio: profile.bio || "",
        theme_color: profile.theme_color || "#0f766e",
        avatar_url: profile.avatar_url || "",
        pet_image_url: profile.pet_image_url || "",
      }));
    }
  }, [profile]);

  async function loadProfile(userId) {
    try {
      setProfile(await request(`/api/users/${userId}/profile`));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadFavorites(userId) {
    try {
      setFavorites(await request(`/api/users/${userId}/favorites`));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadPresences(locationId) {
    try {
      setPresences(await request(`/api/parks/${locationId}/presences`));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handlePublish() {
    if (!user) {
      setMessage("Inicia sesión para publicar.");
      setShowLogin(true);
      return;
    }

    if (!postContent.trim()) return;

    try {
      await request("/api/posts", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, content: postContent.trim(), image_url: postImage.trim() }),
      });
      setPostContent("");
      setPostImage("");
      setPosts(await request("/api/posts"));
      setMessage("Publicación creada.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleImageInput(event, setter) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setter(await readImageFile(file));
      setMessage("Imagen cargada.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      event.target.value = "";
    }
  }

  async function handleLike(postId) {
    try {
      await request(`/api/posts/${postId}/like`, { method: "POST" });
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? { ...post, likes: Number(post.likes) + 1 } : post
        )
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadComments(postId) {
    try {
      const comments = await request(`/api/posts/${postId}/comments`);
      setCommentsByPost((current) => ({ ...current, [postId]: comments }));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleComment(postId) {
    if (!user) {
      setShowLogin(true);
      setMessage("Inicia sesión para comentar.");
      return;
    }

    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await request(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, content }),
      });
      setCommentInputs((current) => ({ ...current, [postId]: "" }));
      await loadComments(postId);
      setPosts(await request("/api/posts"));
      await loadProfile(user.id);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreateEvent(event) {
    event.preventDefault();

    if (!user) {
      setShowLogin(true);
      setMessage("Inicia sesión para crear una quedada.");
      return;
    }

    try {
      await request("/api/events", {
        method: "POST",
        body: JSON.stringify({ ...eventForm, user_id: user.id }),
      });
      setEventForm({ title: "", description: "", location_id: "", event_date: "" });
      setEvents(await request("/api/events"));
      setMessage("Quedada creada.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleJoinEvent(eventId) {
    if (!user) {
      setShowLogin(true);
      setMessage("Inicia sesión para apuntarte.");
      return;
    }

    try {
      await request(`/api/events/${eventId}/join`, {
        method: "POST",
        body: JSON.stringify({ user_id: user.id }),
      });
      setEvents(await request("/api/events"));
      await loadProfile(user.id);
      setMessage("Te has apuntado a la quedada.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleSaveLocation(locationId) {
    if (!user) {
      setShowLogin(true);
      setMessage("Inicia sesión para guardar lugares.");
      return;
    }

    try {
      await request("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, location_id: locationId }),
      });
      await loadFavorites(user.id);
      await loadProfile(user.id);
      setMessage("Lugar guardado en tu perfil.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function openUserProfile(userId) {
    try {
      setPublicProfile(await request(`/api/users/${userId}/profile`));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!user) return;

    try {
      const updatedUser = await request(`/api/users/${user.id}/profile`, {
        method: "PUT",
        body: JSON.stringify({
          name: user.name,
          city: authForm.city,
          bio: authForm.bio,
          theme_color: authForm.theme_color,
          avatar_url: authForm.avatar_url,
          pet_image_url: authForm.pet_image_url,
        }),
      });
      localStorage.setItem("animalia_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      await loadProfile(updatedUser.id);
      setMessage("Perfil actualizado.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handlePresence() {
    if (!user) {
      setMessage("Inicia sesión para registrar tu presencia.");
      setShowLogin(true);
      return;
    }

    if (!selectedLocation || !selectedLocation.has_pets || !user.pet_id) {
      setMessage("La presencia solo se registra en parques.");
      return;
    }

    try {
      await request("/api/presences", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          pet_id: user.pet_id,
          location_id: selectedLocation.id,
        }),
      });
      await loadPresences(selectedLocation.id);
      setMessage(`${user.pet_name} aparece ahora en ${selectedLocation.name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreateLocation(event) {
    event.preventDefault();

    const payload = {
      ...locationForm,
      lat: Number(locationForm.lat),
      lng: Number(locationForm.lng),
    };

    if (!payload.name.trim() || Number.isNaN(payload.lat) || Number.isNaN(payload.lng)) {
      setMessage("Completa nombre, latitud y longitud para crear el lugar.");
      return;
    }

    try {
      const createdLocation = await request("/api/locations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const updatedLocations = await request("/api/locations");
      setLocations(updatedLocations);
      setSelectedPark(createdLocation);
      setShowLocationForm(false);
      setLocationForm({
        name: "",
        type: "parque",
        address: createdLocation.address || "",
        lat: String(createdLocation.lat),
        lng: String(createdLocation.lng),
        has_pets: true,
      });
      setMessage(`${createdLocation.name} añadido al mapa.`);
      mapRef.current?.flyTo([Number(createdLocation.lat), Number(createdLocation.lng)], 16, { duration: 0.8 });
    } catch (error) {
      setMessage(error.message);
    }
  }

  function useCurrentPositionForLocation() {
    if (!navigator.geolocation) {
      setMessage("Tu navegador no permite obtener ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(coords);
        setLocationForm((current) => ({
          ...current,
          lat: coords.lat.toFixed(6),
          lng: coords.lng.toFixed(6),
        }));
        mapRef.current?.flyTo([coords.lat, coords.lng], 16, { duration: 0.8 });
        setMessage("Coordenadas copiadas desde tu ubicación.");
      },
      () => setMessage("No se pudo obtener tu ubicación."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function getBrowserPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Tu navegador no permite obtener ubicación."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        () => reject(new Error("No se pudo obtener tu ubicación.")),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 12000 }
      );
    });
  }

  async function locateUser({ fallback = false } = {}) {
    setMessage("Buscando tu ubicación...");
    try {
      const coords = await getBrowserPosition();
      setUserPosition(coords);
      setMessage(`Ubicación detectada${coords.accuracy ? ` (±${Math.round(coords.accuracy)} m)` : ""}.`);
      mapRef.current?.flyTo([coords.lat, coords.lng], 15, { duration: 0.8 });
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      return coords;
    } catch (error) {
      if (!fallback) {
        setMessage(error.message);
        return null;
      }
      setUserPosition(OVIEDO_CENTER);
      setMessage("No se pudo usar tu ubicación. Uso el centro de Oviedo como origen de prueba.");
      mapRef.current?.flyTo([OVIEDO_CENTER.lat, OVIEDO_CENTER.lng], 14, { duration: 0.8 });
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      return OVIEDO_CENTER;
    }
  }

  async function calculateRoute(location = selectedLocation) {
    if (!location) return;

    setRouteLoading(true);
    try {
      const origin = userPosition || (await locateUser({ fallback: true }));
      if (!origin) return;

      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${location.lng},${location.lat}?overview=full&geometries=geojson`;
      let routeInfoData;
      let line;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.code !== "Ok" || !data.routes?.[0]) {
          throw new Error("OSRM no devolvió una ruta válida.");
        }

        const route = data.routes[0];
        line = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        routeInfoData = {
          distanceKm: (route.distance / 1000).toFixed(2),
          minutes: Math.max(1, Math.round(route.duration / 60)),
        };
      } catch (_error) {
        line = [
          [origin.lat, origin.lng],
          [Number(location.lat), Number(location.lng)],
        ];
        routeInfoData = estimateRoute(origin, { lat: Number(location.lat), lng: Number(location.lng) });
      }

      if (routeLayerRef.current) routeLayerRef.current.remove();
      routeLayerRef.current = L.polyline(line, {
        color: "#0f766e",
        weight: 5,
        opacity: 0.82,
        dashArray: line.length === 2 ? "10 10" : null,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [36, 36] });
      setRouteInfo({
        ...routeInfoData,
        destination: location.name,
        source: origin === OVIEDO_CENTER ? "centro de Oviedo" : "tu ubicación",
      });
      setMessage(`Ruta estimada hasta ${location.name}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setRouteLoading(false);
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    const path = authMode === "register" ? "/api/register" : "/api/login";
    const payload =
      authMode === "register"
        ? authForm
        : { email: authForm.email, password: authForm.password };

    try {
      const loggedUser = await request(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem("animalia_user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      setShowLogin(false);
      setAuthForm({
        name: "",
        email: "",
        password: "",
        pet_name: "",
        breed: "",
        city: "Oviedo",
        bio: "",
        theme_color: "#0f766e",
        avatar_url: "",
        pet_image_url: "",
      });
      setMessage(`Hola, ${loggedUser.name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("animalia_user");
    setUser(null);
    setMessage("Sesión cerrada.");
  }

  function selectLocation(location) {
    setSelectedPark(location);
    clearRoute();
    mapRef.current?.flyTo([Number(location.lat), Number(location.lng)], 16, { duration: 0.8 });
  }

  function focusAsturias() {
    setSelectedPark(null);
    mapRef.current?.fitBounds(
      [
        [43.18, -7.18],
        [43.68, -4.45],
      ],
      { padding: [28, 28] }
    );
  }

  function focusSpain() {
    setSelectedPark(null);
    const points = locations.map((location) => [Number(location.lat), Number(location.lng)]);
    if (points.length) {
      mapRef.current?.fitBounds(points, { padding: [32, 32] });
    }
  }

  function getLocationIcon(type) {
    switch (type) {
      case "veterinario":
        return "🏥";
      case "tienda":
        return "🏪";
      case "peluqueria":
        return "✂️";
      case "parque":
        return "🌳";
      default:
        return "📍";
    }
  }

  function labelForType(type) {
    switch (type) {
      case "veterinario":
        return "Veterinario";
      case "tienda":
        return "Tienda";
      case "peluqueria":
        return "Peluquería";
      case "parque":
        return "Parque";
      default:
        return "Lugar";
    }
  }

  function getLeafletIcon(type, active = false) {
    return L.divIcon({
      className: "animalia-marker",
      html: `<span class="${active ? "active" : ""}">${getLocationIcon(type)}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 30],
    });
  }

  const Logo = ({ large = false }) => (
    <img
      src="/IMG/animalialogo.jpg"
      alt="Animalia"
      className={`${large ? "h-24 w-24 rounded-3xl" : "h-11 w-11 rounded-2xl"} object-cover shadow-sm ring-1 ring-teal-100`}
      onError={(event) => {
        event.currentTarget.src = svgAvatar("Animalia");
      }}
    />
  );

  const Stat = ({ value, label }) => (
    <div className="rounded-2xl border border-teal-100 bg-white/85 px-5 py-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );

  const Avatar = ({ name, type = "person", size = "md", src }) => {
    const classes = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
    const fallbackSrc = svgAvatar(name, type);
    return (
      <img
        src={src || fallbackSrc}
        alt={name}
        className={`${classes} rounded-full object-cover ring-2 ring-white shadow-sm`}
        onError={(event) => {
          if (event.currentTarget.src !== fallbackSrc) {
            event.currentTarget.src = fallbackSrc;
          }
        }}
      />
    );
  };

  const HomeView = () => (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_34%),linear-gradient(135deg,#f8fafc,#ecfeff_45%,#f0fdf4)] px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <Logo large />
              <div>
                <p className="font-semibold uppercase tracking-[0.18em] text-teal-700">Oviedo pet-friendly</p>
                <h1 className="text-5xl font-bold text-slate-950 md:text-6xl">Animalia Oviedo</h1>
              </div>
            </div>
            <p className="max-w-2xl text-xl leading-8 text-slate-700">
              Publica momentos, encuentra parques con mascotas cerca y guarda tu presencia con tu compañero peludo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => (user ? setCurrentView("feed") : setShowLogin(true))}
                className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Comenzar ahora
              </button>
              <button
                onClick={() => setCurrentView("map")}
                className="rounded-xl border border-teal-200 bg-white px-6 py-3 font-semibold text-teal-800 transition hover:bg-teal-50"
              >
                Explorar mapa
              </button>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <Stat value={locations.length || "-"} label="lugares" />
              <Stat value={parkCount || "-"} label="parques" />
              <Stat value={posts.length || "-"} label="posts" />
            </div>
          </div>

          <div className="animalia-float animalia-soft-glow rounded-[2rem] border border-white bg-white/75 p-5 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-700">Actividad reciente</p>
                <p className="text-2xl font-bold text-slate-900">Comunidad Animalia</p>
              </div>
              <Users className="h-7 w-7 text-teal-600" />
            </div>
            <div className="space-y-3">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  <Avatar name={post.user_name} src={post.user_avatar_url} />
                  <div>
                    <p className="font-semibold text-slate-900">{post.user_name}</p>
                    <p className="text-sm text-slate-600">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
        {[
          ["Comparte momentos", "Crea publicaciones y recibe likes de la comunidad.", MessageCircle],
          ["Mapa vivo", "Filtra lugares, abre marcadores y registra tu mascota en parques.", MapPin],
          ["Perfil sencillo", "Tu cuenta guarda una mascota y muestra avatares locales.", Dog],
        ].map(([title, text, Icon]) => (
          <div key={title} className="animalia-hover-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Icon className="mb-4 h-9 w-9 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-slate-600">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );

  const FeedView = () => (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <section>
        <div className="animalia-enter mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            {user ? <Avatar name={user.name} src={user.avatar_url} /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><User /></div>}
            <div className="flex-1">
              <textarea
                value={postContent}
                onChange={(event) => setPostContent(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="¿Qué está haciendo tu mascota hoy?"
                rows="3"
              />
              <input
                value={postImage}
                onChange={(event) => setPostImage(event.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="URL de imagen opcional o sube un archivo"
              />
              <div className="mt-3 flex gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-slate-200">
                  <Upload className="h-4 w-4" />
                  Subir foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageInput(event, setPostImage)}
                    className="sr-only"
                  />
                </label>
                {postImage ? (
                  <button
                    type="button"
                    onClick={() => setPostImage("")}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    Quitar imagen
                  </button>
                ) : null}
                <button
                  onClick={handlePublish}
                  className="ml-auto rounded-xl bg-teal-600 px-6 py-2 font-semibold text-white transition hover:bg-teal-700"
                >
                  Publicar
                </button>
              </div>
              {postImage ? (
                <img
                  src={postImage}
                  alt="Previsualización de la publicación"
                  className="mt-3 max-h-56 w-full rounded-2xl object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500">Cargando comunidad...</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="animalia-enter animalia-hover-card mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={post.user_name} src={post.user_avatar_url} />
                <div>
                  <button
                    onClick={() => openUserProfile(post.user_id)}
                    className="font-semibold text-slate-900 hover:text-teal-700"
                  >
                    {post.user_name}
                  </button>
                  <p className="text-sm text-slate-500">con {post.pet_name || "su mascota"}</p>
                </div>
                <Avatar name={post.pet_name || post.user_name} type="pet" size="sm" src={post.pet_image_url} />
              </div>
              <p className="mb-4 text-slate-800">{post.content}</p>
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt="Imagen de la publicación"
                  className="mb-4 max-h-96 w-full rounded-2xl object-cover"
                />
              ) : null}
              <div className="flex items-center gap-2 text-slate-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className="rounded-full p-2 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Dar like"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <span className="text-sm">{post.likes}</span>
                <button
                  onClick={() => loadComments(post.id)}
                  className="ml-3 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-teal-50 hover:text-teal-700"
                >
                  {post.comment_count || 0} comentarios
                </button>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                {commentsByPost[post.id]?.map((comment) => (
                  <div key={comment.id} className="mb-2 flex gap-2 rounded-xl bg-slate-50 p-3">
                    <Avatar name={comment.user_name} size="sm" src={comment.user_avatar_url} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{comment.user_name}</p>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-3 flex gap-2">
                  <input
                    value={commentInputs[post.id] || ""}
                    onChange={(event) =>
                      setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))
                    }
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Escribe un comentario"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="rounded-xl bg-teal-600 px-3 py-2 text-white transition hover:bg-teal-700"
                    aria-label="Enviar comentario"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <aside className="space-y-4">
        <ProfileCard />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Parques activos</h2>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {locations
              .filter((location) => location.has_pets)
              .map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedPark(location);
                    setCurrentView("map");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left transition hover:bg-teal-50"
                >
                  <span className="text-2xl">🌳</span>
                  <span>
                    <span className="block font-semibold text-slate-900">{location.name}</span>
                    <span className="text-sm text-teal-700">Ver en mapa</span>
                  </span>
                </button>
              ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Perfiles de prueba</h2>
          <div className="mt-4 space-y-3">
            {users.slice(0, 5).map((member) => (
              <button
                key={member.id}
                onClick={() => openUserProfile(member.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left transition hover:bg-teal-50"
              >
                <Avatar name={member.name} size="sm" src={member.avatar_url} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{member.name}</span>
                  <span className="block truncate text-sm text-slate-500">{member.pet_name} · {member.city || "Oviedo"}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );

  const ProfileCard = () => (
    <div className="animalia-enter overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {user ? (
        <>
          <div
            className="h-20"
            style={{ background: `linear-gradient(135deg, ${profile?.theme_color || user.theme_color || "#0f766e"}, #99f6e4)` }}
          />
          <div className="-mt-9 px-5">
          <div className="flex items-end gap-4">
            <Avatar name={user.name} size="lg" src={user.avatar_url} />
            <div className="pb-2">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-teal-50 p-4">
            <Avatar name={user.pet_name} type="pet" src={user.pet_image_url} />
            <div>
              <p className="font-semibold text-slate-900">{user.pet_name}</p>
              <p className="text-sm text-slate-600">{user.breed}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-900">{profile?.post_count ?? 0}</p>
              <p className="text-xs text-slate-500">posts</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-900">{profile?.favorite_count ?? 0}</p>
              <p className="text-xs text-slate-500">guardados</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-900">{profile?.event_count ?? 0}</p>
              <p className="text-xs text-slate-500">quedadas</p>
            </div>
          </div>
          {favorites.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Lugares guardados</p>
              <div className="space-y-2">
                {favorites.slice(0, 3).map((location) => (
                  <button
                    key={location.id}
                    onClick={() => {
                      setSelectedPark(location);
                      setCurrentView("map");
                    }}
                    className="block w-full truncate rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:bg-teal-50"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <form onSubmit={handleProfileUpdate} className="mt-4 space-y-2 rounded-2xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-700">Personalización</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                <Camera className="h-4 w-4" />
                Foto perfil
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageInput(event, (value) => setAuthForm((current) => ({ ...current, avatar_url: value })))
                  }
                  className="sr-only"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                <Dog className="h-4 w-4" />
                Foto mascota
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageInput(event, (value) => setAuthForm((current) => ({ ...current, pet_image_url: value })))
                  }
                  className="sr-only"
                />
              </label>
            </div>
            <input
              value={authForm.avatar_url}
              onChange={(event) => setAuthForm({ ...authForm, avatar_url: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="URL de foto de perfil"
            />
            <input
              value={authForm.pet_image_url}
              onChange={(event) => setAuthForm({ ...authForm, pet_image_url: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="URL de foto de mascota"
            />
            <input
              value={authForm.city}
              onChange={(event) => setAuthForm({ ...authForm, city: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Ciudad"
            />
            <textarea
              value={authForm.bio}
              onChange={(event) => setAuthForm({ ...authForm, bio: event.target.value })}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Bio"
              rows="2"
            />
            <div className="flex items-center justify-between">
              <input
                type="color"
                value={authForm.theme_color}
                onChange={(event) => setAuthForm({ ...authForm, theme_color: event.target.value })}
                className="h-9 w-12"
              />
              <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                Guardar
              </button>
            </div>
          </form>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
          </div>
        </>
      ) : (
        <div className="p-5">
          <h2 className="text-xl font-bold text-slate-900">Tu perfil</h2>
          <p className="mt-2 text-slate-600">Entra para publicar y registrar tu mascota en un parque.</p>
          <button
            onClick={() => setShowLogin(true)}
            className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
          >
            Entrar o registrarme
          </button>
        </div>
      )}
    </div>
  );

  const LocationTypeIcon = ({ type }) => {
    const icons = {
      veterinario: Stethoscope,
      tienda: Store,
      peluqueria: Scissors,
      parque: Dog,
    };
    const Icon = icons[type] || MapPin;
    return <Icon className="h-5 w-5 text-teal-700" />;
  };

  const MapView = () => (
    <main className="grid h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 lg:grid-cols-[1fr_420px]">
      <section className="relative min-h-0">
        <div ref={mapContainerRef} className="h-full min-h-[520px] w-full" />
        <div className="absolute left-4 top-4 z-[400] rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">Mapa interactivo</p>
          <p className="text-xs text-slate-500">Arrastra, acerca, toca y calcula ruta.</p>
          {routeInfo ? (
            <p className="mt-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
              {routeInfo.distanceKm} km · {routeInfo.minutes} min desde {routeInfo.source} hasta {routeInfo.destination}
            </p>
          ) : null}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-bold text-slate-900">Lugares en Oviedo</h2>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full outline-none"
              placeholder="Buscar lugar"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {locationFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setMapFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  mapFilter === filter.value
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => locateUser({ fallback: true })}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Compass className="h-4 w-4" />
              Mi ubicación
            </button>
            <button
              onClick={() => calculateRoute()}
              disabled={!selectedLocation || routeLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Navigation className="h-4 w-4" />
              {routeLoading ? "Calculando" : "Ruta"}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={focusAsturias}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Asturias
            </button>
            <button
              onClick={focusSpain}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              España
            </button>
          </div>
          <button
            onClick={() => setShowLocationForm((current) => !current)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
          >
            <Plus className="h-4 w-4" />
            {showLocationForm ? "Cerrar alta de lugar" : "Añadir ubicación"}
          </button>
          {recommendedLocation ? (
            <button
              onClick={() => selectLocation(recommendedLocation)}
              className="mt-3 flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-left text-sm text-amber-900 transition hover:bg-amber-100"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="block font-bold">Recomendación rápida</span>
                <span className="block">
                  {recommendedLocation.name}
                  {Number.isFinite(recommendedLocation.distance)
                    ? ` · ${recommendedLocation.distance.toFixed(1)} km aprox.`
                    : ""}
                </span>
              </span>
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {showLocationForm ? (
            <form onSubmit={handleCreateLocation} className="mb-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <h3 className="font-bold text-slate-900">Nueva ubicación</h3>
              <div className="mt-3 space-y-3">
                <input
                  value={locationForm.name}
                  onChange={(event) => setLocationForm({ ...locationForm, name: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nombre del lugar"
                />
                <select
                  value={locationForm.type}
                  onChange={(event) =>
                    setLocationForm({
                      ...locationForm,
                      type: event.target.value,
                      has_pets: event.target.value === "parque" ? true : locationForm.has_pets,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="parque">Parque</option>
                  <option value="veterinario">Veterinario</option>
                  <option value="tienda">Tienda</option>
                  <option value="peluqueria">Peluquería</option>
                </select>
                <input
                  value={locationForm.address}
                  onChange={(event) => setLocationForm({ ...locationForm, address: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Dirección exacta"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={locationForm.lat}
                    onChange={(event) => setLocationForm({ ...locationForm, lat: event.target.value })}
                    className="min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Latitud"
                  />
                  <input
                    value={locationForm.lng}
                    onChange={(event) => setLocationForm({ ...locationForm, lng: event.target.value })}
                    className="min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Longitud"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={locationForm.has_pets}
                    onChange={(event) => setLocationForm({ ...locationForm, has_pets: event.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600"
                  />
                  Permitir presencias de mascotas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={useCurrentPositionForLocation}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Usar mi ubicación
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    Guardar lugar
                  </button>
                </div>
              </div>
            </form>
          ) : null}
          {selectedLocation ? (
            <div>
              <button
                onClick={() => setSelectedPark(null)}
                className="mb-4 text-sm font-semibold text-teal-700 hover:underline"
              >
                ← Volver a lugares
              </button>
              <div className="rounded-2xl bg-teal-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <LocationTypeIcon type={selectedLocation.type} />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedLocation.name}</h3>
                    <p className="text-sm text-slate-600">{labelForType(selectedLocation.type)}</p>
                    {selectedLocation.address ? (
                      <p className="text-sm font-medium text-slate-500">{selectedLocation.address}</p>
                    ) : null}
                  </div>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-700">Mascotas presentes</p>
                <div className="mt-3 space-y-3">
                  {presences.length === 0 ? (
                    <p className="rounded-xl bg-white p-4 text-sm text-slate-500">Aún no hay mascotas registradas aquí.</p>
                  ) : (
                    presences.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                        <Avatar name={entry.pet_name} type="pet" src={entry.pet_image_url} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{entry.pet_name}</p>
                          <p className="text-sm text-slate-600">{entry.breed}</p>
                          <p className="text-xs text-slate-500">
                            {entry.owner_name} · {formatPresenceTime(entry.last_seen_at)}
                          </p>
                        </div>
                        <Avatar name={entry.owner_name} size="sm" src={entry.owner_avatar_url} />
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => calculateRoute(selectedLocation)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white py-3 font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  <Navigation className="h-4 w-4" />
                  {routeLoading ? "Calculando ruta..." : "Calcular ruta desde mi ubicación"}
                </button>

                <button
                  onClick={() => handleSaveLocation(selectedLocation.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Bookmark className="h-4 w-4" />
                  Guardar lugar
                </button>

                <button
                  onClick={handlePresence}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  Registrar mi presencia
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => selectLocation(location)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                    <LocationTypeIcon type={location.type} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900">{location.name}</span>
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <LocationTypeIcon type={location.type} />
                      {labelForType(location.type)}
                    </span>
                  </span>
                  {location.has_pets ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Activo</span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </main>
  );

  const EventsView = () => (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div>
          <p className="font-semibold uppercase tracking-[0.16em] text-teal-700">Comunidad</p>
          <h1 className="text-3xl font-bold text-slate-950">Quedadas y planes</h1>
          <p className="mt-2 text-slate-600">Planes sencillos para pasear, socializar y descubrir sitios con mascotas.</p>
        </div>
        {events.map((event) => (
          <article key={event.id} className="animalia-enter animalia-hover-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-300" />
            <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>
                <p className="mt-1 text-slate-600">{event.description}</p>
              </div>
              <div className="rounded-xl bg-teal-50 px-3 py-2 text-center text-sm font-semibold text-teal-800">
                {new Date(event.event_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-700" />
                {event.location_name}
              </span>
              <span className="flex items-center gap-2 sm:col-span-3">
                <MapPin className="h-4 w-4 text-teal-700" />
                {event.location_address || "Dirección pendiente de confirmar"}
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-teal-700" />
                {event.organizer_name}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-700" />
                {event.attendee_count} apuntados
              </span>
            </div>
            <button
              onClick={() => handleJoinEvent(event.id)}
              className="mt-4 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
            >
              Apuntarme
            </button>
            </div>
          </article>
        ))}
      </section>

      <aside>
        <form onSubmit={handleCreateEvent} className="animalia-soft-glow sticky top-24 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Crear quedada</h2>
          <p className="mt-1 text-sm text-slate-500">Elige un lugar del mapa y una fecha.</p>
          <div className="mt-4 space-y-3">
            <input
              required
              value={eventForm.title}
              onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Título"
            />
            <textarea
              value={eventForm.description}
              onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
              className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Descripción"
              rows="3"
            />
            <select
              required
              value={eventForm.location_id}
              onChange={(event) => setEventForm({ ...eventForm, location_id: event.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Selecciona lugar</option>
              {locations
                .filter((location) => location.has_pets)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
            <input
              required
              type="datetime-local"
              value={eventForm.event_date}
              onChange={(event) => setEventForm({ ...eventForm, event_date: event.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700">
            Publicar quedada
          </button>
        </form>
      </aside>
    </main>
  );

  const PublicProfileModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div
          className="mb-5 h-24 rounded-2xl"
          style={{ background: publicProfile.theme_color || "#0f766e" }}
        />
        <div className="-mt-14 flex items-end gap-4 px-3">
          <Avatar name={publicProfile.name} size="lg" src={publicProfile.avatar_url} />
          <div className="pb-2">
            <h2 className="text-2xl font-bold text-slate-900">{publicProfile.name}</h2>
            <p className="text-sm text-slate-500">{publicProfile.city || "Oviedo"}</p>
          </div>
        </div>
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-slate-700">
          {publicProfile.bio || "Perfil Animalia sin biografía todavía."}
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-teal-50 p-4">
          <Avatar name={publicProfile.pet_name} type="pet" src={publicProfile.pet_image_url} />
          <div>
            <p className="font-semibold text-slate-900">{publicProfile.pet_name}</p>
            <p className="text-sm text-slate-600">{publicProfile.breed}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-bold">{publicProfile.post_count || 0}</p>
            <p className="text-xs text-slate-500">posts</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-bold">{publicProfile.favorite_count || 0}</p>
            <p className="text-xs text-slate-500">guardados</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-bold">{publicProfile.event_count || 0}</p>
            <p className="text-xs text-slate-500">quedadas</p>
          </div>
        </div>
        <button
          onClick={() => setPublicProfile(null)}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  const LoginModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form onSubmit={handleAuth} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          {authMode === "register" ? "Únete a Animalia" : "Inicia sesión"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {authMode === "register" ? "Tu perfil tendrá avatar de persona y mascota." : "Usa maria@example.com / 123456 para probar."}
        </p>
        <div className="mt-6 space-y-3">
          {authMode === "register" && (
            <input
              required
              type="text"
              placeholder="Tu nombre"
              value={authForm.name}
              onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
            className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            required
            type="password"
            placeholder="Contraseña"
            value={authForm.password}
            onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
            className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
          {authMode === "register" && (
            <>
              <input
                required
                type="text"
                placeholder="Nombre de tu mascota"
                value={authForm.pet_name}
                onChange={(event) => setAuthForm({ ...authForm, pet_name: event.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                required
                type="text"
                placeholder="Raza de tu mascota"
                value={authForm.breed}
                onChange={(event) => setAuthForm({ ...authForm, breed: event.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={authForm.city}
                onChange={(event) => setAuthForm({ ...authForm, city: event.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
              />
              <textarea
                placeholder="Bio corta para tu perfil"
                value={authForm.bio}
                onChange={(event) => setAuthForm({ ...authForm, bio: event.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-teal-500"
                rows="2"
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                  <Camera className="h-4 w-4" />
                  Foto perfil
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleImageInput(event, (value) => setAuthForm((current) => ({ ...current, avatar_url: value })))
                    }
                    className="sr-only"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                  <Dog className="h-4 w-4" />
                  Foto mascota
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleImageInput(event, (value) => setAuthForm((current) => ({ ...current, pet_image_url: value })))
                    }
                    className="sr-only"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <span className="text-sm font-semibold text-slate-600">Color</span>
                <input
                  type="color"
                  value={authForm.theme_color}
                  onChange={(event) => setAuthForm({ ...authForm, theme_color: event.target.value })}
                  className="h-9 w-12 cursor-pointer border-0 bg-transparent"
                />
              </div>
            </>
          )}
        </div>
        {message && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <button className="mt-5 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700">
          {authMode === "register" ? "Crear cuenta" : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
          className="mt-4 w-full text-sm font-semibold text-teal-700 hover:underline"
        >
          {authMode === "register" ? "Ya tengo cuenta" : "Crear una cuenta"}
        </button>
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="mt-3 w-full text-sm text-slate-500 hover:text-slate-800"
        >
          Cerrar
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button className="flex items-center gap-3" onClick={() => setCurrentView("home")}>
            <Logo />
            <span className="text-2xl font-bold text-slate-900">Animalia</span>
          </button>

          <div className="flex items-center gap-2">
            {[
              ["home", "Inicio", Home],
              ["feed", "Feed", MessageCircle],
              ["map", "Mapa", MapPin],
              ["events", "Quedadas", CalendarDays],
            ].map(([view, label, Icon]) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  currentView === view ? "bg-teal-100 text-teal-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
            {user ? (
              <button
                onClick={() => setCurrentView("feed")}
                className="ml-1 flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <Avatar name={user.name} size="sm" src={user.avatar_url} />
                <span className="hidden md:inline">{user.name}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-1 flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <LogIn className="h-5 w-5" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </nav>

      {message && !showLogin ? (
        <button
          onClick={() => setMessage("")}
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {message}
        </button>
      ) : null}

      {currentView === "home" && HomeView()}
      {currentView === "feed" && FeedView()}
      {currentView === "map" && MapView()}
      {currentView === "events" && EventsView()}
      {showLogin && <LoginModal />}
      {publicProfile && <PublicProfileModal />}

      {currentView !== "map" && (
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-500">
            <p>Animalia - prototipo local con React, Node, MySQL y Docker.</p>
            <a
              href="https://github.com/yagofl02/Animalia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline"
            >
              <Github className="h-4 w-4" />
              Ver proyecto
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}

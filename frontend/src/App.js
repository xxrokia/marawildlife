import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import L from 'leaflet';
import './App.css';

// Import animal icons
import lionIcon from './icons/lion.png';
import elephantIcon from './icons/elephant.png';
import zebraIcon from './icons/zebra.png';
import giraffeIcon from './icons/giraffe.png';
import gazelleIcon from './icons/gazelle.png';
import cheetahIcon from './icons/cheetah.png';
import buffaloIcon from './icons/buffalo.png';
import hippoIcon from './icons/hippo.png';
import wildebeestIcon from './icons/wildebeest.png';
import leopardIcon from './icons/leopard.png';

// Define custom icons for each animal species
const animalIcons = {
  lion: new L.Icon({
    iconUrl: lionIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  elephant: new L.Icon({
    iconUrl: elephantIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  zebra: new L.Icon({
    iconUrl: zebraIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  giraffe: new L.Icon({
    iconUrl: giraffeIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  gazelle: new L.Icon({
    iconUrl: gazelleIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  cheetah: new L.Icon({
    iconUrl: cheetahIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  buffalo: new L.Icon({
    iconUrl: buffaloIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  hippo: new L.Icon({
    iconUrl: hippoIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  wildebeest: new L.Icon({
    iconUrl: wildebeestIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  leopard: new L.Icon({
    iconUrl: leopardIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

function App() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [filter, setFilter] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    drawLinesSelected: false,
    drawLinesHighlighted: false,
    drawDensity: false,
    pointSize: 'Intermediate',
    colorSchema: 'Pink/Blue'
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [statistics, setStatistics] = useState({
    totalDistance: 0,
    averageSpeed: 0,
    totalAnimals: 0
  });

  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('animalData', (data) => {
      setAnimals(data);
      setFilteredAnimals(data);
      updateStatistics(data);
    });

    fetchAnimals();

    return () => {
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnimals = async () => {
    try {
      const response = await fetch('http://localhost:4000/animals');
      if (!response.ok) {
        throw new Error('Failed to fetch animals');
      }
      const data = await response.json();
      setAnimals(data);
      setFilteredAnimals(data);
      updateStatistics(data);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const handleSearch = () => {
    if (filter) {
      const filtered = animals.filter(animal => 
        animal.species && animal.species.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredAnimals(filtered);
      updateStatistics(filtered);
    } else {
      setFilteredAnimals(animals);
      updateStatistics(animals);
    }
  };

  const handleOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Add logic to pause/resume WebSocket connection or data updates
  };

  const updateStatistics = (animalData) => {
    const totalDistance = animalData.reduce((sum, animal) => sum + animal.distance_traveled, 0);
    const averageSpeed = animalData.reduce((sum, animal) => sum + animal.speed, 0) / animalData.length;
    const totalAnimals = animalData.length;

    setStatistics({
      totalDistance,
      averageSpeed,
      totalAnimals
    });
  };

  const handleCreated = (e) => {
    // Handle creation of shapes (optional for your use case)
    console.log('Shape created:', e);
  };

  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Col md={3}>
            <h3>Animal Tracking Dashboard</h3>
            <Form.Group controlId="filter">
              <Form.Label>Filter by Species</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Enter species"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <Button variant="primary" onClick={handleSearch} className="ml-2">Search</Button>
              </div>
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button variant="primary" onClick={() => setShowOptions(!showOptions)}>Options</Button>
              <Button variant="primary" onClick={togglePlayback}>
                {isPlaying ? 'Pause' : 'Resume'}
              </Button>
            </div>
            {showOptions && (
              <div className="options-menu">
                <label>
                  <input
                    type="checkbox"
                    name="drawLinesSelected"
                    checked={options.drawLinesSelected}
                    onChange={handleOptionsChange}
                  />
                  Draw lines for selected animals
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="drawLinesHighlighted"
                    checked={options.drawLinesHighlighted}
                    onChange={handleOptionsChange}
                  />
                  Draw lines for highlighted animals
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="drawDensity"
                    checked={options.drawDensity}
                    onChange={handleOptionsChange}
                  />
                  Draw density
                </label>
                <div>
                  Point Size
                  <label>
                    <input
                      type="radio"
                      name="pointSize"
                      value="Small"
                      checked={options.pointSize === 'Small'}
                      onChange={handleOptionsChange}
                    />
                    Small
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pointSize"
                      value="Intermediate"
                      checked={options.pointSize === 'Intermediate'}
                      onChange={handleOptionsChange}
                    />
                    Intermediate
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pointSize"
                      value="Large"
                      checked={options.pointSize === 'Large'}
                      onChange={handleOptionsChange}
                    />
                    Large
                  </label>
                </div>
                <div>
                  Color Schema
                  <label>
                    <input
                      type="radio"
                      name="colorSchema"
                      value="Pink/Blue"
                      checked={options.colorSchema === 'Pink/Blue'}
                      onChange={handleOptionsChange}
                    />
                    Pink/Blue
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="colorSchema"
                      value="Pink/Orange"
                      checked={options.colorSchema === 'Pink/Orange'}
                      onChange={handleOptionsChange}
                    />
                    Pink/Orange
                  </label>
                </div>
              </div>
            )}
            <div className="statistics">
              <h5>Statistics</h5>
              <p>Total Distance: {statistics.totalDistance.toFixed(2)} km</p>
              <p>Average Speed: {statistics.averageSpeed.toFixed(2)} km/h</p>
              <p>Total Animals: {statistics.totalAnimals}</p>
            </div>
          </Col>
          <Col md={9}>
            <MapContainer center={[0, 0]} zoom={8} style={{ height: '100vh' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={handleCreated}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    polyline: false
                  }}
                />
              </FeatureGroup>
              {filteredAnimals.map(animal => (
                <Marker
                  key={animal._id}
                  position={[animal.latitude, animal.longitude]}
                  icon={animalIcons[animal.species.toLowerCase()]}
                >
                  <Popup>
                    <div>
                      <p><strong>Species:</strong> {animal.species}</p>
                      <p><strong>Age:</strong> {animal.age}</p>
                      <p><strong>Speed:</strong> {animal.speed} km/h</p>
                      <p><strong>Distance Traveled:</strong> {animal.distance_traveled.toFixed(2)} km</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;

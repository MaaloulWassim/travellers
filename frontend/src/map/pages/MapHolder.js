import * as React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  FullscreenControl,
  Marker,
  Popup,
  GeolocateControl,
} from "react-map-gl";
import axios from "axios";
import RoomIcon from "@mui/icons-material/Room";
import StarRateIcon from "@mui/icons-material/StarRate";
import "./MapHolder.css";

const MapHolder = () => {
  // const myStorage = window.localStorage;
  // const [currentUsername, setCurrentUsername] = React.useState(
  //   myStorage.getItem("user")
  // );
  const [currentPlaceID, setcurrentPlaceID] = React.useState(null);
  const [newPlace, setNewPlace] = React.useState(null);
  const [pins, setPins] = React.useState([]);
  const [title, setTitle] = React.useState(null);
  const [desc, setDesc] = React.useState(null);
  const [star, setStar] = React.useState(0);
  const [viewState, setViewState] = React.useState({
    longitude: 2.2945,
    latitude: 48.8584,
    zoom: 3.5,
  });

  React.useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("/map");
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);
  const handleMarkerClick = (id, lat, long) => {
    setcurrentPlaceID(id);
    setViewState({ ...viewState, latitude: lat, longitude: long });
  };
  const geolocateStyle = {
    bottom: "50px",
    left: 0,
    margin: 10,
  };
  const positionOptions = { enableHighAccuracy: true };

  const handleAddClick = (e) => {
    console.log(e.lngLat.toArray());
    const coords = e.lngLat.toArray();
    console.log(coords[0], coords[1]);
    setNewPlace({ long: coords[0], lat: coords[1] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: "wiz",
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post("/map", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="map-holder">
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100vw", height: "100vh", position: "absolute" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onDblClick={handleAddClick}
      >
        <GeolocateControl
          style={geolocateStyle}
          positionOptions={positionOptions}
          trackUserLocation
          auto
        />
        {pins.map((p) => (
          <>
            <Marker longitude={p.long} latitude={p.lat} anchor="bottom">
              <RoomIcon
                style={{ fontSize: viewState.zoom * 15 }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceID && (
              <Popup
                longitude={p.long}
                latitude={p.lat}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setcurrentPlaceID(null)}
                anchor="left"
              >
                <div className="pincard">
                  <label className="lab">Place </label>
                  <h4 className="place">{p.title}</h4>
                  <label className="lab">Review</label>
                  <p className="review">{p.desc}</p>
                  <label className="lab">Rating</label>
                  <div className="stars">
                    <StarRateIcon className="star" />
                    <StarRateIcon className="star" />
                    <StarRateIcon className="star" />
                    <StarRateIcon className="star" />
                    <StarRateIcon className="star" />
                  </div>
                  <label className="lab">Informations</label>
                  <span className="username">
                    created by <b>{p.username}</b>
                  </span>
                  <span className="date">{p.createdAt}</span>
                </div>
              </Popup>
            )}
          </>
        ))}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setNewPlace(null)}
            anchor="left"
          >
            <div>
              <form classname="forms" onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                  className="inptitle"
                  placeholder="Enter a title"
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  className="txta"
                  placeholder="Say us something about this place."
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setStar(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button type="submit" className="submitButton">
                  Add Pin
                </button>
              </form>
            </div>
          </Popup>
        )}
        <FullscreenControl />
      </Map>
    </div>
  );
};

export default MapHolder;

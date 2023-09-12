// // receive json data from Python function passed as variable from app.route("/home")
const locations = JSON.parse(document.getElementById("data").textContent);
// Leaflet map is using OpenStreetMap as the provider and leaflet-geosearch for geocoding
const map = L.map("map").setView([yourLat, yourLong], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const provider = new window.GeoSearch.OpenStreetMapProvider();

// associate results with location and id with marker
for (i = 0; i < locations.length; i++) {
  let location = locations[i];
  let _id = i;
  let queryPromise = provider.search({ query: location["address"] });
  queryPromise
    .then((result) => {
      let newData = {
        id: _id,
        latLng: [result[0].y, result[0].x], // pulls first result in occurance of duplicates
      };
      $.extend(location, newData);
      marker = L.marker(location.latLng, {
        options: {
          id: _id,
          title: location.name,
        },
      })
        // this allows the marker's data to be displayed on click
        .on("click", markerOnClick)
        .addTo(map);
    })
    .catch((error) => {
      console.log(error);
    });
}

// use current location to access current location outside the function
const currentLocation = { name: "", address: "", latLng: "" };
// checks "this" id against location ids, and shows data for location if it's a match
function markerOnClick(e) {
  let markerId = e.target.options.options.id;
  locations.forEach((location) => {
    if (location.id === markerId) {
      //  Use information for display or as needed
      currentLocation["name"] = location["name"];
      currentLocation["address"] = location["address"];
      currentLocation["latLng"] = location.latLng;
    }
  });
}

$("#map-app").on("click", () => {
  getMaps(
    currentLocation.name,
    currentLocation.latLng[0],
    currentLocation.latLng[1]
  );
});
// opens a native map app depending on device
function getMaps(name, lat, long) {
  var userAgent = navigator.userAgent || window.opera;
  if (/iPad|iPhone|iPod|Macintosh/.test(userAgent)) {
    window.open(
      " http://maps.apple.com/?q=" + name + "sll=" + lat + "," + long
    );
  } else {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" + lat + "%2C" + long
    );
  }
}

// Adds a copy to clipboard function
$("#copy-address-link").on("click", async () => {
  await navigator.clipboard.writeText(currentLocation.address);
});

// fadeouts flashed message from Flask on click of add panel for error or sucess
$("#add-panel").on("click", function () {
  setTimeout(() => {
    $("#flash-message").fadeOut("slow");
  });
});

const appKey = "70397ed3f45fac2171e0e345dc73238c";

let searchButton = document.getElementById("search-btn");
let searchInput = document.getElementById("search-txt");
let cityName = document.getElementById("city-name");
let icon = document.getElementById("icon");
let temperature = document.getElementById("temp");
let humidity = document.getElementById("humidity-div");

searchInput.addEventListener("keyup", enterPressed);

function enterPressed(event) {
  if (event.key === "Enter") {
    findWeatherDetails();
  }
}

function findWeatherDetails() {
	if (searchInput.value === ""){}
	else {
		let searchLink = `http://api.openweathermap.org/data/2.5/forecast?q=${searchInput.value}&APPID=${appKey}`;
		httpRequestAsync(searchLink, theResponse);
	}
}

function theResponse(response) {
	let jsonObject = JSON.parse(response);	// Convert string from server into objects
	console.log(jsonObject);
	for (i = 0; i < 40; i++) {
		// Populate weather
			const segTime = jsonObject.list[(j - 1)*7 + (j - 1) + i].dt_txt;
			const timeIndex = segTime.slice(11, 13)/3;
			let day = document.getElementById(`day${j}${i}`);
			day.textContent = jsonObject.list[(j - 1)*7 + (j - 1) + i].main.temp + ' degrees K, ' + jsonObject.list[(j - 1)*7 + i].weather[0].description;
	}
	// cityName.innerHTML = jsonObject.name;
	// icon.src = `http://openweathermap.org/img/w/${jsonObject.weather[0].icon}.png`;
	// temperature.innerHTML = parseInt(jsonObject.main.temp - 273) + "°";
	// humidity.innerHTML = jsonObject.main.humidity + "%";
}

// A callback is a function to be executed after another function has finished execution
// Functions are objects. So functions can take functions as arguments, and can be returned.
// Callbacks are useful because API requests take time, and JS is asynchronous
function httpRequestAsync(url, callback){
	const httpRequest = new XMLHttpRequest();	// Initializes XMLHttpRequest
	// Event handler that is called when readystate attribute changes
	// readystate contains teh loading status of the document
	httpRequest.onreadystatechange = () => {	
		// 4 means done loading
		// status can be ok, forbidden, or not found. 200 means ok
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			// responsetext returns the body of the server's response as a string
			callback(httpRequest.responseText);
		}
	}
	// Initializes newly created request, runs GET method, sends request to URL, true lets it run asynchronously
	httpRequest.open("GET", url, true);
	httpRequest.send();	// Send request to server
}
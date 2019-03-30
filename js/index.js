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

	const date = new Date();
	const timeOffset = date.getTimezoneOffset()/60;
	console.log(`Time offset = ${timeOffset}`);
	let j = 1;	// Used to incriment columns (i.e. days)
	let dayIndexes = [0, 0];	// Used to track change in day
	for (i = 0; i < 40; i++) {
		const segDate = jsonObject.list[i].dt_txt;	// Pull UTC date and time from API
		let localTime = segDate.slice(11, 13) - timeOffset;	// Pull time, convert to local
		// If local time is negative, roll over to previous day
		if (localTime < 0) {
			localTime += 24;
		}
		// Creat time indexes for identifying appropriate table cells
		let timeIndex = Math.floor((localTime)/3);

		if (i === 0) {
			dayIndexes = [segDate.slice(8, 10), segDate.slice(8, 10)];
		}

		dayIndexes[1] = segDate.slice(8, 10);
		if (timeIndex === 0) {
			j++;
			dayIndexes[0] = segDate.slice(8, 10);
		}

		if (j > 5) {
			break;
		}

		console.log(timeIndex + ' ' + j);
		let day = document.getElementById(`day${j}${timeIndex}`);
		console.log(`day${j}${timeIndex}`);
		day.textContent = jsonObject.list[i].main.temp + ' degrees K, ' + jsonObject.list[i].weather[0].description;
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
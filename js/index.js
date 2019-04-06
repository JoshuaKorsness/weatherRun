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
	let j = 1;	// Used to incriment columns (i.e. days)
	let jLabel = 1;
	let weatherDayList = [];

	// Populate weather segments
	for (i = 0; i < 40; i++) {
		const segDate = jsonObject.list[i].dt_txt;	// Pull UTC date and time from API
		let localTime = segDate.slice(11, 13) - timeOffset;	// Pull time, convert to local
		// If local time is negative, roll over to previous day
		if (localTime < 0) {
			localTime += 24;
		}
		// Creat time indexes for identifying appropriate table cells
		let timeIndex = Math.floor((localTime)/3);

		// Label header for first day
		if (i === 0) {
			let dayHead = document.getElementById(`dayName1`);
			dayHead.textContent = segDate.slice(5, 10);
		}

		// Iterate day
		if (timeIndex === 0) {
			j++;
			if (j > 5) {
				break;
			}
			// Label day header
			let dayHead = document.getElementById(`dayName${j}`);
			dayHead.textContent = jsonObject.list[7*j].dt_txt.slice(5, 10);
		}


		// Pick optimal running day
		weatherDayList.push({timeIndex: timeIndex, weightedScore: 0, weatherCode: jsonObject.list[i].weather[0].id, temp: jsonObject.list[i].main.temp, weather: jsonObject.list[i].weather[0].description, humidity: jsonObject.list[i].main.humidity})
		if (timeIndex === 7) {
			runIndex = optimalRun(weatherDayList);

			// Update data-score and and maek cursor pointer
			runIndex.forEach(function(i) {
				let day = document.getElementById(`day${j}${i.timeIndex}`);
				day.style.cursor = 'pointer'; 
				day.dataset.score = i.weightedScore;
			})

			// Pick optimal running day
			let runDay = document.getElementById(`day${j}${runIndex[0].timeIndex}`);
			runDay.style.backgroundColor = '#005117';
			runDay.style.color = 'white';
			weatherDayList = [];
		}

		// Write weather info into cell
		let day = document.getElementById(`day${j}${timeIndex}`);
		day.addEventListener('click', redSeg);
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

// Function to choose optimal running time
function optimalRun(weatherObject) {

	// Adjust weighted scores for humidity
	weatherObject.sort(function(a, b){return a.humidity - b.humidity});
	weatherObject.forEach(function(i) {
		i.weightedScore += 0.5*weatherObject.indexOf(i);
	})

	// Adjust weighted scores for temperature
	weatherObject.sort(function(a, b){return a.temp - b.temp});
	weatherObject.forEach(function(i) {
		i.weightedScore += weatherObject.indexOf(i);
	})

	// Adjust weighted scores for weather
	weatherObject.forEach(function(i) {
		const weatherFam = i.weatherCode.toString()[0];
		if (weatherFam == 2) {
			// Thunderstorm 
			i.weightedScore += 20;
		}
		else if (weatherFam == 3) {
			// Drizzle
			i.weightedScore += 8;
		}
		else if (weatherFam == 5) {
			// Rain
			i.weightedScore += 10;
		}
		else if (weatherFam == 6) {
			// Snow
			i.weightedScore += 3;
		}
		else if (weatherFam == 7) {
			// Atmosphere
			i.weightedScore += 2;
		}
		else if (i.weatherCode == 800) {
			// Clear
			i.weightedScore += 0.5;
		}
		else if (i.weatherCode > 800) {
			// Clouds
			i.weightedScore += 0;
		}
	})

	// Sort weatherObject based on lowest to highest score
	weatherObject.sort(function(a, b){return a.weightedScore - b.weightedScore});

	return weatherObject;
}

function redSeg(segment) {
	// Set data-runOk as false
	segment.target.dataset.runOk = "0";
	segment.target.style.backgroundColor = 'red';

	const dayIndex = segment.target.id[3];	// Will return 1 - 5

	const dayList = []; 
	for (var i = 0; i <= 7; i++) {
		dayList.push(document.getElementById(`day${dayIndex}${i}`));
	}

	// console.log(dayList);

	// Remove red segements from list
	dayList.forEach(function(i) {
		i.style.color = "#000000"
		if (i.dataset.runOk === "0") {
			const index = dayList.indexOf(i);
			console.log(index);
			if (index > -1) {
				delete dayList[index];
				// dayList.splice(index, 1);
			}
		}
	})

	// console.log(dayList);

	// Set all backgrounds to white
	dayList.forEach(function(i) {
		i.style.background = '#d4eef7';
	})

	// Sort remaining entries by score
	dayList.sort(function(a, b){return a.dataset.score - b.dataset.score});
	console.log(dayList);
	const dayListFilt = dayList.filter(function(i) {
		return i.dataset.score != "";
	});
	console.log(dayListFilt);

	// Pick optimal running day
	dayListFilt[0].style.backgroundColor = "#005117";
	dayListFilt[0].style.color = "white";
}
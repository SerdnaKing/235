"use strict";
	window.onload = init;
	let listData;
	//window.onload = ;
	function init(){
		document.querySelector("#search").onclick = getData;
		
	}
	
	let term = ""; // we declared `term` out here because we will need it later
	function getData(){
		// 1 - main entry point to web service
		const SERVICE_URL = "https://api.jikan.moe/v3/search/anime?";
		
		// No API Key required!
		
		// 2 - build up our URL string
		let url = SERVICE_URL;
		
		// 3 - parse the user entered term we wish to search
		term = document.querySelector("#searchterm").value;
		
		// get rid of any leading and trailing spaces
		term = term.trim();
		// encode spaces and special characters
		term = encodeURIComponent(term);
		
		// if there's no term to search then bail out of the function (return does this)
		if(term.length < 1){
			document.querySelector("#debug").innerHTML = "<b>Enter a search term first!</b>";
			return;
		}
		//add the search term to the url (based on user input)
		url += "&q=" + term;
		
		let limit = document.querySelector("#limit").value;
		url += "&limit=" + limit;
		// 4 - update the UI
		document.querySelector("#debug").innerHTML = `<b>Querying web service with:</b> <a href="${url}" target="_blank">${url}</a>`;
		
		// 5 - create a new XHR object
		let xhr = new XMLHttpRequest();

		// 6 - set the onload handler
		xhr.onload = dataLoaded;
	
		// 7 - set the onerror handler
		xhr.onerror = dataError;

		// 8 - open connection and send the request
		xhr.open("GET",url);
		xhr.send();
	}
	//in place in case an unexpected problem occurs
	function dataError(e){
		console.log("An error occurred");
	}
	
	function dataLoaded(e){
		// 1 - e.target is the xhr object
		let xhr = e.target;
	
		// 2 - xhr.responseText is the JSON file we just downloaded
		console.log(xhr.responseText);
	
		// 3 - turn the text into a parsable JavaScript object
		let obj = JSON.parse(xhr.responseText);
		
		listData = obj; // stores the data globally.
		// 4 - if there are no results, print a message and return
		if(obj.error){
			let msg = obj.error;
			document.querySelector("#content").innerHTML = `<p><i>Problem! <b>${msg}</b></i></p>`;
			return; // Bail out
		}
		
		// 5 - if there is an array of results, loop through them
		let results = obj.results;
		if(!results){
			document.querySelector("#content").innerHTML = `<p><i>Problem! <b>No results for "${term}"</b></i></p>`;
			return;
		}
		
		// 6 - put together HTML
		let bigString = ``; // ES6 String Templating
		let favoritesOL = document.querySelector("#favoritesList");

		//loop through the returned data and display it to the user.
		for (let i=0;i<results.length;i++){
			//create all the values that will be used in the display
			let result = results[i];
			let favoriteOption = "Click me to add/remove favorite";
			let image = result.image_url;
			let url = result.url;
			let synopsis = result.synopsis;
			let title = result.title;
			let rating = result.rated;
			let score = result.score;
			let episode = result.episodes;
			
			//create and format how each result will be displayed to the user
            let line = `<div class='result'><img src='${image}' title='${title}'/>`;
			line +=  `<div class= 'rightSide'><span data-index='${i}' data-state='notFavorite'<div class='favorite'>`;
			line += `<p id='title'> ${title}</p>`
            line+= `${favoriteOption}</span>`;
            line += `<p><a href='${url}'>${title}</a></p>`;
			line +=  `<p>${synopsis}</p>`;
            line +=  `<p>Episodes: ${episode}</p>`;
            line +=  `<p>Score: ${score}</p>`;
            line += `<p> ${rating}</p>`;
            line += `</span></div>`;
			bigString += line;
				
			
		}
		
		// 7 - display final results to user
		document.querySelector("#content").innerHTML = bigString;
		//8 -- this section adds a favorite option for the user

		//instantiate a list of all spans on the site
		let spanList = document.querySelectorAll("span");
		
		//read each of the results and determine if they are favorited or not.
		//on click the data should be added or removed based on an updating variable called state.
		//state toggles between favorite and notfavorite
		for(let k = 0; k < listData.results.length; k++){
		let resultId = document.querySelector(".favorite");
		resultId.dataset.state = "notFavorite";
		let toggleFavorite = (e) =>{
			let state = e.target.dataset.state;
			let i = e.target.dataset.index;
			if(state == "notFavorite"){
					let li = document.createElement("li");
					li.append(listData.results[i].url)
					favoritesOL.appendChild(li);
					console.log("Added to faves");
					state = "Favorite";
			}
			else{
				let li = document.querySelector("li");
				favoritesOL.removeChild(li);
				console.log("Removed Favorite");
				state = "notFavorite";
			}
			e.target.dataset.state = state;
		
		}
		//add a click event to each of the spans returned to activate the favorite selection
		 for (let span of spanList){
		 	span.onclick = toggleFavorite;
		 }
		}
	}	
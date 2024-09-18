let svg, g, zoom;

function calculateScore(place) {
    return (place.rating * Math.log(place.user_ratings_total + 1)) / 5;
}

function calculateNodeSize(place) {
    if (place.id === "center") return 40;
    return Math.max(30, place.name.length * 3); // Increase size based on name length
}

function getNodeColor(place) {
    if (place.id === "center") return "#FFD700";
    const score = calculateScore(place);
    if (score > 4) return "#4CAF50";
    if (score > 3) return "#FFC107";
    return "#FF5722";
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d * 1000; // Convert to meters
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function createGraph(data, zipCode, zipLat, zipLng) {
    d3.select("#graph").html("");

    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g");

    zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    const centralNode = { id: "center", name: zipCode, x: width / 2, y: height / 2 };
    
    // Calculate distances and find max distance
    data.forEach(d => {
        d.distance = calculateDistance(zipLat, zipLng, d.geometry.location.lat, d.geometry.location.lng);
    });
    const maxDistance = Math.max(...data.map(d => d.distance));

    data.forEach((d, i) => {
        d.id = d.place_id;
        const angle = (i / data.length) * 2 * Math.PI;
        const distance = (d.distance / maxDistance) * Math.min(width, height) * 0.4; // Scale distance
        d.x = centralNode.x + distance * Math.cos(angle);
        d.y = centralNode.y + distance * Math.sin(angle);
    });

    const allNodes = [centralNode, ...data];

    const simulation = d3.forceSimulation(allNodes)
        .force("link", d3.forceLink().id(d => d.id).distance(d => d.source.id === "center" ? d.target.distance : 50))
        .force("charge", d3.forceManyBody().strength(-2000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => calculateNodeSize(d) + 5));

    const links = data.map(d => ({source: centralNode.id, target: d.id, distance: d.distance}));

    const link = g.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

    const node = g.append("g")
        .selectAll("circle")
        .data(allNodes)
        .enter().append("circle")
        .attr("r", d => calculateNodeSize(d))
        .attr("fill", d => getNodeColor(d))
        .on("click", (event, d) => showInfo(d));

    const label = g.append("g")
        .selectAll("text")
        .data(allNodes)
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text(d => d.name)
        .attr("font-size", d => d.id === "center" ? "14px" : "10px")
        .attr("fill", "white");

    node.append("title")
        .text(d => d.id === "center" ? `ZIP: ${d.name}` : `${d.name}\nRating: ${d.rating}\nReviews: ${d.user_ratings_total}\nDistance: ${d.distance.toFixed(2)} meters`);

    simulation
        .nodes(allNodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    }
}

async function showInfo(place) {
    if (place.id === "center") {
        d3.select("#infoPanel").html(`<h2>ZIP Code: ${place.name}</h2>`);
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/googlePlaces?action=placeDetails&placeId=${place.place_id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const placeDetails = data.result;

        const infoPanel = d3.select("#infoPanel").html("");

        // Create tabs
        const tabContainer = infoPanel.append("div").attr("class", "tab-container");
        tabContainer.append("button").attr("class", "tab active").text("Info").on("click", () => showTab("info"));
        tabContainer.append("button").attr("class", "tab").text("Menu").on("click", () => showTab("menu"));

        // Info tab content
        const infoContent = infoPanel.append("div").attr("class", "tab-content").attr("id", "infoTab");
        populateInfoTab(infoContent, placeDetails);

        // Menu tab content
        const menuContent = infoPanel.append("div").attr("class", "tab-content").attr("id", "menuTab").style("display", "none");
        populateMenuTab(menuContent);

        // Show info tab by default
        showTab("info");
    } catch (error) {
        console.error('Error fetching place details:', error);
        d3.select("#infoPanel").html(`<p>Error fetching place details: ${error.message}</p>`);
    }
}

function populateInfoTab(infoContent, placeDetails) {
    infoContent.append("h2").text(placeDetails.name);
    
    const ratingContainer = infoContent.append("div").attr("class", "rating-container info-item");
    ratingContainer.append("i").attr("class", "fas fa-star").style("color", "#FFC107");
    
    const starRating = ratingContainer.append("span").attr("class", "star-rating");
    for (let i = 0; i < 5; i++) {
        starRating.append("span").text(i < Math.floor(placeDetails.rating) ? "★" : "☆");
    }
    
    ratingContainer.append("span").attr("class", "review-count").text(` (${placeDetails.user_ratings_total} reviews)`);

    infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-dollar-sign"></i> Price: ${placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : 'N/A'}`);
    infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeDetails.formatted_address)}" target="_blank">${placeDetails.formatted_address}</a>`);
    infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-phone"></i> ${placeDetails.formatted_phone_number || 'N/A'}`);
    infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-globe"></i> ${placeDetails.website ? `<a href="${placeDetails.website}" target="_blank">${placeDetails.website}</a>` : 'N/A'}`);

    // Add pickup service links
    const pickupServices = infoContent.append("div").attr("class", "pickup-services");
    pickupServices.append("h3").text("Order for Pickup:");
    pickupServices.append("a").attr("href", `https://www.doordash.com/search/${encodeURIComponent(placeDetails.name)}/`).attr("target", "_blank").text("DoorDash");
    pickupServices.append("a").attr("href", `https://www.ubereats.com/search?q=${encodeURIComponent(placeDetails.name)}`).attr("target", "_blank").text("Uber Eats");
    pickupServices.append("a").attr("href", `https://www.grubhub.com/search?queryText=${encodeURIComponent(placeDetails.name)}`).attr("target", "_blank").text("Grubhub");

    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        const reviewsContainer = infoContent.append("div");
        reviewsContainer.append("h3").text("Top Reviews:");
        placeDetails.reviews.slice(0, 3).forEach(review => {
            const sentiment = review.rating >= 4 ? 'positive' : 'negative';
            reviewsContainer.append("div")
                .attr("class", "review-item")
                .html(`<span class="review-sentiment ${sentiment}"></span>${review.text.substring(0, 100)}... - Rating: ${review.rating}`);
        });
    }
}

function populateMenuTab(menuContent) {
    menuContent.append("h3").text("Menu");
    menuContent.append("p").text("Menu information is not available through the Google Places API. You can visit the restaurant's website or use a food delivery service to view their menu.");

    // Add a mock search and sort functionality
    const searchContainer = menuContent.append("div").attr("class", "menu-search");
    searchContainer.append("input").attr("type", "text").attr("placeholder", "Search menu items...");
    searchContainer.append("button").text("Search").on("click", () => alert("This is a mock search functionality."));

    const sortContainer = menuContent.append("div").attr("class", "menu-sort");
    sortContainer.append("label").text("Sort by: ");
    const select = sortContainer.append("select");
    select.append("option").text("Price: Low to High");
    select.append("option").text("Price: High to Low");
    select.append("option").text("Popularity");
    select.on("change", () => alert("This is a mock sort functionality."));
}

function showTab(tabName) {
    d3.selectAll(".tab").classed("active", false);
    d3.selectAll(".tab-content").style("display", "none");
    d3.select(`.tab:contains("${tabName[0].toUpperCase() + tabName.slice(1)}")`).classed("active", true);
    d3.select(`#${tabName}Tab`).style("display", "block");
}

document.getElementById('searchButton').addEventListener('click', async () => {
    const locationInput = document.getElementById('locationInput');
    if (!locationInput) {
        console.error('Location input element not found');
        return;
    }
    const zipCode = locationInput.value || '94102';  // Default to San Francisco

    try {
        // First, get the coordinates for the ZIP code
        const geocodeResponse = await fetch(`/.netlify/functions/googlePlaces?action=geocode&zipCode=${zipCode}`);
        if (!geocodeResponse.ok) {
            throw new Error(`HTTP error! status: ${geocodeResponse.status}`);
        }
        const geocodeData = await geocodeResponse.json();
        if (!geocodeData.results || geocodeData.results.length === 0) {
            throw new Error('Unable to find coordinates for the given ZIP code');
        }
        const { lat, lng } = geocodeData.results[0].geometry.location;

        // Now perform the nearby search
        const response = await fetch(`/.netlify/functions/googlePlaces?action=nearbySearch&lat=${lat}&lng=${lng}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            createGraph(data.results, zipCode, lat, lng);
        } else {
            console.log('No results found');
            d3.select("#graph").html("<p>No results found for this ZIP code.</p>");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        d3.select("#graph").html(`<p>Error fetching data: ${error.message}</p>`);
    }
});

// Initial graph creation
document.getElementById('searchButton').click();
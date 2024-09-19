// Global variables
let svg, g, zoom;
let currentData = [];
let zipLat, zipLng, currentZipCode;

// Include the D3 color scale
const colorScale = d3.scaleOrdinal(d3.schemeSet2);

// Initialize tooltip using the updated d3-tip
const tip = d3Tip() // Note the change from 'd3.tip()' to 'd3Tip()'
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(d => `<strong>${d.name}</strong><br/>Rating: ${d.rating || 'N/A'}`);




// Add this function if it's not already present
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

// Function to calculate score based on selected option
function calculateScore(place, option) {
    switch (option) {
        case 'rating':
            return place.rating || 0;
        case 'reviews':
            return Math.log(place.user_ratings_total + 1);
        case 'distance':
            return 1 / (place.distance / 1000 + 1); // Inverse of distance in km
        case 'price':
            return place.price_level ? 4 - place.price_level : 2; // Inverse for price (lower price_level is higher score)
        default:
            return 1;
    }
}

// Function to create the graph
function createGraph(data) {
    // Hide the placeholder message
    d3.select("#placeholderMessage").style("display", "none");
    currentData = data;
    updateGraph(d3.select('#scoreOption').property('value'));
}

// Function to update the graph based on selected option
function updateGraph(option) {
    d3.select("#graph").select("svg").remove();

    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Call tooltip
    svg.call(tip);

    g = svg.append("g");

    zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    currentData.forEach(d => {
        d.score = calculateScore(d, option);
    });

    const maxScore = Math.max(...currentData.map(d => d.score));

    const simulation = d3.forceSimulation(currentData)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => calculateNodeSize(d, maxScore) + 2));

    // Create node groups to hold circle, label, and close button
    const nodeGroup = g.selectAll(".node-group")
        .data(currentData, d => d.place_id)
        .join(
            enter => {
                const group = enter.append("g")
                    .attr("class", "node-group")
                    .call(drag);

                // When creating your nodes
                group.append("circle")
                .attr("r", d => calculateNodeSize(d, maxScore))
                .attr("fill", d => colorScale(d.name))
                .on('click', (event, d) => showInfo(d))
                .on('mouseover', (event, d) => tip.show(d, event.target)) // Updated handler
                .on('mouseout', tip.hide);

                group.append("text")
                    .attr("class", "node-label")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .text(d => d.name)
                    .attr("font-size", d => {
                        const radius = calculateNodeSize(d, maxScore);
                        const estimatedFontSize = (2 * radius) / d.name.length;
                        return Math.min(estimatedFontSize, 12) + "px"; // Max font size of 12px
                    });

                    group.append("text")
                    .attr("class", "node-close")
                    .text('×')
                    .attr("font-size", "12px")
                    .attr("fill", "red")
                    .attr("text-anchor", "end")
                    .attr("dx", d => calculateNodeSize(d, maxScore) - 5)
                    .attr("dy", d => -calculateNodeSize(d, maxScore) + 15) // Corrected line
                    .on('click', (event, d) => {
                        event.stopPropagation();
                        currentData = currentData.filter(node => node !== d);
                        updateGraph(d3.select('#scoreOption').property('value'));
                    });
                

                return group;
            },
            update => update,
            exit => exit.remove()
        );

    simulation.on("tick", () => {
        nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

// Function to calculate node size
function calculateNodeSize(place, maxScore) {
    const minSize = 15;
    const maxSize = 50;
    const sizeScale = d3.scaleLinear()
        .domain([0, maxScore])
        .range([minSize, maxSize]);
    return sizeScale(place.score);
}

// Drag behavior
const drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;

    // Highlight shortlist area when node is over it
    const shortlistBounds = document.getElementById('shortlist').getBoundingClientRect();
    if (
        event.sourceEvent.clientX >= shortlistBounds.left &&
        event.sourceEvent.clientX <= shortlistBounds.right &&
        event.sourceEvent.clientY >= shortlistBounds.top &&
        event.sourceEvent.clientY <= shortlistBounds.bottom
    ) {
        d3.select('#shortlist').style('background', 'rgba(255, 235, 235, 0.9)');
    } else {
        d3.select('#shortlist').style('background', 'rgba(255, 255, 255, 0.9)');
    }
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);

    // Get shortlist area boundaries
    const shortlistBounds = document.getElementById('shortlist').getBoundingClientRect();

    // Check if dropped in shortlist area
    if (
        event.sourceEvent.clientX >= shortlistBounds.left &&
        event.sourceEvent.clientX <= shortlistBounds.right &&
        event.sourceEvent.clientY >= shortlistBounds.top &&
        event.sourceEvent.clientY <= shortlistBounds.bottom
    ) {
        // Add to shortlist
        addToShortlist(d);
        // Remove from current data and update graph
        currentData = currentData.filter(node => node !== d);
        updateGraph(d3.select('#scoreOption').property('value'));
    }

    d.fx = null;
    d.fy = null;

    // Reset shortlist background
    d3.select('#shortlist').style('background', 'rgba(255, 255, 255, 0.9)');
}

// Function to add a place to the shortlist
function addToShortlist(place) {
    const shortlistContainer = d3.select('#shortlistContainer');

    const item = shortlistContainer.append('div')
        .attr('class', 'shortlist-item');

    item.append('span')
        .text(place.name);

    item.append('button')
        .attr('class', 'remove-button')
        .text('×')
        .on('click', () => {
            // Remove from shortlist
            item.remove();
            // Add back to graph data
            currentData.push(place);
            updateGraph(d3.select('#scoreOption').property('value'));
        });

    item.on('click', () => {
        showInfo(place);
    });
}

// Event listener for the dropdown
d3.select('#scoreOption').on('change', function() {
    updateGraph(this.value);
});

// Function to display information about a place
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
        populateInfoTab(infoContent, placeDetails || place);

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

// Function to populate the Info tab
function populateInfoTab(infoContent, placeDetails) {
    infoContent.append("h2").text(placeDetails.name);
    
    if (placeDetails.rating) {
        const ratingContainer = infoContent.append("div").attr("class", "rating-container info-item");
        ratingContainer.append("i").attr("class", "fas fa-star").style("color", "#FFC107");
        
        const starRating = ratingContainer.append("span").attr("class", "star-rating");
        for (let i = 0; i < 5; i++) {
            starRating.append("span").text(i < Math.floor(placeDetails.rating) ? "★" : "☆");
        }
        
        ratingContainer.append("span").attr("class", "review-count").text(` (${placeDetails.user_ratings_total || 0} reviews)`);
    }

    if (placeDetails.price_level) {
        infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-dollar-sign"></i> Price: ${placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : 'N/A'}`);
    }

    if (placeDetails.formatted_address || placeDetails.vicinity) {
        infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeDetails.formatted_address || placeDetails.vicinity)}" target="_blank">${placeDetails.formatted_address || placeDetails.vicinity}</a>`);
    }

    if (placeDetails.formatted_phone_number) {
        infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-phone"></i> ${placeDetails.formatted_phone_number}`);
    }

    if (placeDetails.website) {
        infoContent.append("div").attr("class", "info-item").html(`<i class="fas fa-globe"></i> <a href="${placeDetails.website}" target="_blank">${placeDetails.website}</a>`);
    }

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

// Function to populate the Menu tab
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

// Function to handle tab switching
function showTab(tabName) {
    d3.selectAll(".tab").classed("active", false);
    d3.selectAll(".tab-content").classed("active", false);
    d3.selectAll(".tab").filter(function() {
        return d3.select(this).text().toLowerCase() === tabName.toLowerCase();
    }).classed("active", true);
    d3.select(`#${tabName}Tab`).classed("active", true);
}

// Search button event listener
document.getElementById('searchButton').addEventListener('click', async () => {
    const locationInput = document.getElementById('locationInput');
    if (!locationInput) {
        console.error('Location input element not found');
        return;
    }
    const zipCode = locationInput.value;

    if (!zipCode) {
        alert('Please enter a ZIP code.');
        return;
    }

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

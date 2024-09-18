let svg, g, zoom;

function calculateScore(place) {
    return (place.rating * Math.log(place.user_ratings_total + 1)) / 5;
}

function calculateNodeSize(place) {
    const score = calculateScore(place);
    return 5 + (score * 3); // Reduced base size from 10 to 5
}

function getNodeColor(place) {
    const score = calculateScore(place);
    if (score > 4) return "#4CAF50"; // Green for high scores
    if (score > 3) return "#FFC107"; // Yellow for medium scores
    return "#FF5722"; // Orange for lower scores
}

function createGraph(data, zipCode) {
    d3.select("#graph").html("");

    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g");

    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Create a central node for the ZIP code
    const centralNode = { id: "center", name: zipCode, x: width / 2, y: height / 2 };
    
    // Calculate distances and angles for other nodes
    data.forEach((d, i) => {
        const angle = (i / data.length) * 2 * Math.PI;
        const distance = Math.random() * 200 + 100; // Random distance between 100 and 300
        d.x = centralNode.x + distance * Math.cos(angle);
        d.y = centralNode.y + distance * Math.sin(angle);
    });

    const allNodes = [centralNode, ...data];

    const simulation = d3.forceSimulation(allNodes)
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => calculateNodeSize(d) + 2));

    // Create links from central node to others
    const links = data.map(d => ({source: centralNode.id, target: d.place_id}));

    const link = g.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = g.append("g")
        .selectAll("circle")
        .data(allNodes)
        .enter().append("circle")
        .attr("r", d => d.id === "center" ? 20 : calculateNodeSize(d))
        .attr("fill", d => d.id === "center" ? "#FFD700" : getNodeColor(d))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(d => d.name);

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
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

async function showInfo(place) {
    const response = await fetch(`/.netlify/functions/googlePlaces?action=placeDetails&placeId=${place.place_id}`);
    const data = await response.json();
    const placeDetails = data.result;

    d3.select("#infoPanel").html("");

    const infoCard = d3.select("#infoPanel").append("div")
        .attr("class", "info-card");

    infoCard.append("h2").text(placeDetails.name);
    
    const ratingContainer = infoCard.append("div")
        .attr("class", "rating-container info-item");

    ratingContainer.append("i")
        .attr("class", "fas fa-star")
        .style("color", "#FFC107");

    const starRating = ratingContainer.append("span")
        .attr("class", "star-rating");
    
    for (let i = 0; i < 5; i++) {
        starRating.append("span")
            .text(i < Math.floor(placeDetails.rating) ? "★" : "☆");
    }

    ratingContainer.append("span")
        .attr("class", "review-count")
        .text(` (${placeDetails.user_ratings_total} reviews)`);

    infoCard.append("div")
        .attr("class", "info-item")
        .html(`<i class="fas fa-dollar-sign"></i> Price: ${placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : 'N/A'}`);

    infoCard.append("div")
        .attr("class", "info-item")
        .html(`<i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeDetails.formatted_address)}" target="_blank">${placeDetails.formatted_address}</a>`);

    infoCard.append("div")
        .attr("class", "info-item")
        .html(`<i class="fas fa-phone"></i> ${placeDetails.formatted_phone_number || 'N/A'}`);

    infoCard.append("div")
        .attr("class", "info-item")
        .html(`<i class="fas fa-globe"></i> ${placeDetails.website ? `<a href="${placeDetails.website}" target="_blank">${placeDetails.website}</a>` : 'N/A'}`);

    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        const reviewsContainer = infoCard.append("div");
        reviewsContainer.append("h3").text("Top Reviews:");
        placeDetails.reviews.slice(0, 3).forEach(review => {
            const sentiment = review.rating >= 4 ? 'positive' : 'negative';
            reviewsContainer.append("div")
                .attr("class", "review-item")
                .html(`<span class="review-sentiment ${sentiment}"></span>${review.text.substring(0, 100)}... - Rating: ${review.rating}`);
        });
    }
}

document.getElementById('searchButton').addEventListener('click', async () => {
    const locationInput = document.getElementById('locationInput');
    if (!locationInput) {
        console.error('Location input element not found');
        return;
    }
    const zipCode = locationInput.value || '94102';  // Default to San Francisco

    try {
        const response = await fetch(`/.netlify/functions/googlePlaces?action=nearbySearch&zipCode=${zipCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            createGraph(data.results, zipCode);
        } else {
            console.log('No results found');
            d3.select("#graph").html("<p>No results found for this ZIP code.</p>");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        d3.select("#graph").html(`<p>Error fetching data: ${error.message}</p>`);
        if (error.details) {
            console.error('Error details:', error.details);
            d3.select("#graph").append("p").text(`Error details: ${error.details}`);
        }
    }
});

// Initial graph creation
document.getElementById('searchButton').click();
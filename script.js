let svg, g, zoom;

function calculateNodeSize(place) {
    return 10 + (place.user_ratings_total / 100) * (place.rating);
}

function getNodeColor(place) {
    const score = (place.rating * place.user_ratings_total) / 100;
    const hue = Math.min(score * 10, 120);
    const saturation = Math.min(score * 5, 100);
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function createGraph(data) {
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

    const simulation = d3.forceSimulation(data)
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => calculateNodeSize(d) + 2))
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1));

    const nodes = g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", d => calculateNodeSize(d))
        .style("fill", d => getNodeColor(d))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    d3.select("#graph")
        .append("div")
        .attr("class", "zoom-buttons")
        .html('<button id="zoomIn">+</button><button id="zoomOut">-</button>');

    d3.select("#zoomIn").on("click", () => {
        svg.transition().call(zoom.scaleBy, 1.2);
    });

    d3.select("#zoomOut").on("click", () => {
        svg.transition().call(zoom.scaleBy, 0.8);
    });

    const tooltip = d3.select("body").append("div")
        .attr("class", "node-tooltip")
        .style("opacity", 0);

    nodes.on("mouseover", (event, d) => {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`${d.name}<br/>Rating: ${d.rating}<br/>Reviews: ${d.user_ratings_total}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    nodes.on("click", (event, d) => showInfo(d));

    simulation.on("tick", () => {
        nodes
            .attr("cx", d => boundNode(d.x, 0, width))
            .attr("cy", d => boundNode(d.y, 0, height));
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = boundNode(event.x, 0, width);
        d.fy = boundNode(event.y, 0, height);
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function boundNode(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
}

async function showInfo(place) {
    const response = await fetch(`/.netlify/functions/googlePlaces?action=placeDetails&placeId=${place.place_id}`);
    const data = await response.json();
    const placeDetails = data.result;

    d3.select("#infoPanel").html("");

    const infoContent = d3.select("#infoPanel").append("div")
        .attr("class", "tab-content active")
        .attr("id", "infoTab");

    infoContent.append("h2").text(placeDetails.name);
    
    const ratingContainer = infoContent.append("div")
        .attr("class", "rating-container");

    const starRating = ratingContainer.append("span")
        .attr("class", "star-rating");
    
    for (let i = 0; i < 5; i++) {
        starRating.append("span")
            .text(i < Math.floor(placeDetails.rating) ? "★" : "☆");
    }

    ratingContainer.append("span")
        .attr("class", "review-count")
        .text(` (${placeDetails.user_ratings_total} reviews)`);

    infoContent.append("p").text(`Price: ${placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : 'N/A'}`);
    infoContent.append("p").text(`Address: ${placeDetails.formatted_address}`);
    infoContent.append("p").text(`Phone: ${placeDetails.formatted_phone_number || 'N/A'}`);
    infoContent.append("p").html(`Website: ${placeDetails.website ? `<a href="${placeDetails.website}" target="_blank">${placeDetails.website}</a>` : 'N/A'}`);

    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        const reviewsList = infoContent.append("div").append("h3").text("Top Reviews:").append("ul");
        placeDetails.reviews.slice(0, 3).forEach(review => {
            reviewsList.append("li").text(`"${review.text}" - Rating: ${review.rating}`);
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
            createGraph(data.results);
        } else {
            console.log('No results found');
            d3.select("#graph").html("<p>No results found for this ZIP code.</p>");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        d3.select("#graph").html("<p>Error fetching data. Please try again.</p>");
    }
});

// Initial graph creation
document.getElementById('searchButton').click();
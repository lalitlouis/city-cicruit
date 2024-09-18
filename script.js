// Mock data
const mockData = {
    restaurants: [
        { id: 1, name: "Pasta Palace", rating: 4.5, reviews: 120, type: "Italian" },
        { id: 2, name: "Sushi Star", rating: 4.2, reviews: 85, type: "Japanese" },
        // ... add 8 more restaurants
    ],
    museums: [
        { id: 1, name: "City History Museum", rating: 4.7, reviews: 200, type: "History" },
        { id: 2, name: "Modern Art Gallery", rating: 4.1, reviews: 150, type: "Art" },
        // ... add 8 more museums
    ]
};

function createGraph(data) {
    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(data)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));

    const nodes = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", d => 10 + d.rating * 2)
        .style("fill", d => d.type === "restaurants" ? "red" : "blue");

    simulation.on("tick", () => {
        nodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    nodes.on("click", (event, d) => showInfo(d));
}

function showInfo(place) {
    const infoPanel = document.getElementById('infoPanel');
    infoPanel.innerHTML = `
        <h2>${place.name}</h2>
        <p>Rating: ${place.rating}</p>
        <p>Reviews: ${place.reviews}</p>
        <p>Type: ${place.type}</p>
    `;
}

document.getElementById('searchButton').addEventListener('click', () => {
    const placeType = document.getElementById('placeType').value;
    const searchInput = document.getElementById('searchInput').value;
    // For now, we're ignoring the search input and just using mock data
    createGraph(mockData[placeType]);
});
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let svg, g, zoom, simulation;
    let currentData = [];
    let zipLat, zipLng, currentZipCode;
    let currentSearchType = 'restaurant';

    // Include the D3 color scale
    const colorScale = d3.scaleOrdinal(d3.schemeSet2);

    // Select the tooltip div
    const tooltip = d3.select("#tooltip");

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d * 1000; // Convert to meters
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function calculateScore(place, option) {
        switch (option) {
            case 'rating':
                return place.rating || 0;
            case 'reviews':
                return Math.log(place.user_ratings_total + 1);
            case 'distance':
                return 1 / (place.distance / 1000 + 1); // Inverse of distance in km
            case 'price':
                return place.price_level ? 4 - place.price_level : 2; // Inverse for price
            default:
                return 1;
        }
    }

    function createGraph(data, zipCode, lat, lng) {
        const shortlist = d3.select("#shortlist").node();
        d3.select("#graph").html("");
        d3.select("#graph").node().appendChild(shortlist);
        d3.select("#placeholderMessage").style("display", "none");
        currentData = data;
        zipLat = lat;
        zipLng = lng;
        currentZipCode = zipCode;
        updateGraph(d3.select('#scoreOption').property('value'));
    }

    function updateGraph(option) {
        if (!currentData || currentData.length === 0) {
            console.log("No data to display");
            return;
        }
    
        d3.select("#graph").select("svg").remove();
    
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
    
        currentData.forEach(d => {
            d.score = calculateScore(d, option);
        });
    
        const maxScore = Math.max(...currentData.map(d => d.score));

        simulation = d3.forceSimulation(currentData)
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(d => calculateNodeSize(d, maxScore) + 2));

        const nodeGroup = g.selectAll(".node-group")
            .data(currentData, d => d.place_id)
            .join(
                enter => {
                    const group = enter.append("g")
                        .attr("class", "node-group cursor-pointer")
                        .call(drag);

                    group.append("circle")
                        .attr("r", d => calculateNodeSize(d, maxScore))
                        .attr("fill", d => colorScale(d.name))
                        .on("click", (event, d) => showInfo(d))
                        .on('mouseover', (event, d) => {
                            tooltip.transition().duration(200).style('opacity', 0.9);
                            tooltip.html(`<strong>${d.name}</strong><br/>Rating: ${d.rating || 'N/A'}`)
                                .style('left', (event.pageX + 10) + 'px')
                                .style('top', (event.pageY - 28) + 'px');
                        })
                        .on('mouseout', () => {
                            tooltip.transition().duration(500).style('opacity', 0);
                        });

                    group.append("text")
                        .attr("class", "node-label text-white pointer-events-none")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .each(function(d) {
                            const el = d3.select(this);
                            const radius = calculateNodeSize(d, maxScore);
                            let fontSize = 12;
                            el.text(d.name)
                                .attr('font-size', fontSize);
                            
                            while (this.getComputedTextLength() > radius * 1.8 && fontSize > 6) {
                                fontSize--;
                                el.attr('font-size', fontSize);
                            }
                            
                            if (this.getComputedTextLength() > radius * 1.8) {
                                const words = d.name.split(/\s+/);
                                el.text('');
                                words.forEach((word, i) => {
                                    el.append('tspan')
                                        .text(word)
                                        .attr('x', 0)
                                        .attr('dy', i ? '1.2em' : 0);
                                });
                            }
                        });

                    group.append("circle")
                        .attr("class", "node-close-bg")
                        .attr("r", 8)
                        .attr("cx", d => calculateNodeSize(d, maxScore) - 5)
                        .attr("cy", d => -calculateNodeSize(d, maxScore) + 15)
                        .attr("fill", "red")
                        .style("opacity", 0)
                        .style("cursor", "pointer");

                    group.append("text")
                        .attr("class", "node-close text-white cursor-pointer")
                        .text('×')
                        .attr("font-size", "12px")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .attr("x", d => calculateNodeSize(d, maxScore) - 5)
                        .attr("y", d => -calculateNodeSize(d, maxScore) + 15)
                        .style("opacity", 0)
                        .on('click', (event, d) => {
                            event.stopPropagation();
                            currentData = currentData.filter(node => node !== d);
                            updateGraph(d3.select('#scoreOption').property('value'));
                        });

                    group.on("mouseover", function() {
                        d3.select(this).selectAll(".node-close, .node-close-bg").style("opacity", 1);
                    })
                    .on("mouseout", function() {
                        d3.select(this).selectAll(".node-close, .node-close-bg").style("opacity", 0);
                    });

                    return group;
                },
                update => update,
                exit => exit.remove()
            );

        const topThreeNodes = nodeGroup.filter((d, i) => i < 3);
        topThreeNodes.append("circle")
            .attr("r", d => calculateNodeSize(d, maxScore) + 5)
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.name))
            .attr("stroke-width", 2)
            .attr("opacity", 0.5)
            .call(pulse, maxScore);  // Pass maxScore to pulse function
    
        simulation.on("tick", () => {
            nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    function calculateNodeSize(place, maxScore) {
        const minSize = 30;
        const maxSize = 100;
        const sizeScale = d3.scaleSqrt()
            .domain([0, maxScore])
            .range([minSize, maxSize]);
        return sizeScale(place.score);
    }

    function pulse(selection, maxScore) {
        selection.each(function() {
            const circle = d3.select(this);
            const initialRadius = parseFloat(circle.attr("r"));
            
            (function repeat() {
                circle.transition()
                    .duration(1000)
                    .attr("r", d => calculateNodeSize(d, maxScore) + 15)
                    .transition()
                    .duration(1000)
                    .attr("r", initialRadius)
                    .on("end", repeat);
            })();
        });
    }

    const drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this).classed('cursor-grabbing', true);
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;

        const shortlistBounds = document.getElementById('shortlist').getBoundingClientRect();
        if (
            event.sourceEvent.clientX >= shortlistBounds.left &&
            event.sourceEvent.clientX <= shortlistBounds.right &&
            event.sourceEvent.clientY >= shortlistBounds.top &&
            event.sourceEvent.clientY <= shortlistBounds.bottom
        ) {
            d3.select('#shortlist').classed('bg-red-100', true);
        } else {
            d3.select('#shortlist').classed('bg-red-100', false);
        }
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(this).classed('cursor-grabbing', false);

        d3.select('#shortlist').classed('bg-red-100', false);

        const shortlistBounds = document.getElementById('shortlist').getBoundingClientRect();

        if (
            event.sourceEvent.clientX >= shortlistBounds.left &&
            event.sourceEvent.clientX <= shortlistBounds.right &&
            event.sourceEvent.clientY >= shortlistBounds.top &&
            event.sourceEvent.clientY <= shortlistBounds.bottom
        ) {
            addToShortlist(d);
            currentData = currentData.filter(node => node !== d);
            updateGraph(d3.select('#scoreOption').property('value'));
        }
    }

    function addToShortlist(place) {
        const shortlistContainer = d3.select('#shortlistContainer');
        
        if (shortlistContainer.selectAll('.shortlist-item').size() >= 5) {
            shortlistContainer.select('.shortlist-item').remove();
            alert("You can only have 5 items in the shortlist. The oldest item has been removed.");
        }

        const item = shortlistContainer.append('div')
            .attr('class', 'shortlist-item inline-block m-2');

        const svg = item.append('svg')
            .attr('width', 60)
            .attr('height', 60);

        svg.append('circle')
            .attr('cx', 30)
            .attr('cy', 30)
            .attr('r', 28)
            .attr('fill', colorScale(place.name));

        svg.append('text')
            .attr('x', 30)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', 'white')
            .text(place.name.substring(0, 2))
            .style('font-size', '14px');

        svg.append('circle')
            .attr('cx', 50)
            .attr('cy', 10)
            .attr('r', 8)
            .attr('fill', 'red')
            .attr('class', 'remove-button')
            .style('cursor', 'pointer')
            .on('click', () => {
                item.remove();
                currentData.push(place);
                updateGraph(d3.select('#scoreOption').property('value'));
            });

        svg.append('text')
            .attr('x', 50)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', 'white')
            .text('×')
            .style('font-size', '12px')
            .style('cursor', 'pointer')
            .on('click', () => {
                item.remove();
                currentData.push(place);
                updateGraph(d3.select('#scoreOption').property('value'));
            });

        item.on('click', () => {
            showInfo(place);
        });
    }

    d3.select('#scoreOption').on('change', function () {
        updateGraph(this.value);
    });

    async function showInfo(place) {
        if (place.id === "center") {
            d3.select("#infoPanel").html(`<h2 class="text-2xl font-bold mb-4">ZIP Code: ${place.name}</h2>`);
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

            const tabContainer = infoPanel.append("div").attr("class", "flex mb-4");
            tabContainer.append("button").attr("class", "tab active px-4 py-2 bg-orange-500 text-white rounded-l").text("Info").on("click", () => showTab("Info"));
            tabContainer.append("button").attr("class", "tab px-4 py-2 bg-gray-300 text-gray-700 rounded-r").text("Menu").on("click", () => showTab("Menu"));

            const infoContent = infoPanel.append("div").attr("class", "tab-content").attr("id", "InfoTab");
            populateInfoTab(infoContent, placeDetails || place);

            const menuContent = infoPanel.append("div").attr("class", "tab-content hidden").attr("id", "MenuTab");
            populateMenuTab(menuContent);

            showTab("Info");
        } catch (error) {
            console.error('Error fetching place details:', error);
            d3.select("#infoPanel").html(`<p class="text-red-500">Error fetching place details: ${error.message}</p>`);
        }
    }

    function populateInfoTab(infoContent, placeDetails) {
        infoContent.append("h2").attr("class", "text-2xl font-bold mb-4").text(placeDetails.name);

        if (placeDetails.rating) {
            const ratingContainer = infoContent.append("div").attr("class", "flex items-center mb-2");
            ratingContainer.append("i").attr("class", "fas fa-star text-yellow-400 mr-1");

            const starRating = ratingContainer.append("span").attr("class", "text-yellow-400");
            for (let i = 0; i < 5; i++) {
                starRating.append("span").text(i < Math.floor(placeDetails.rating) ? "★" : "☆");
            }

            ratingContainer.append("span").attr("class", "ml-2 text-gray-600").text(`(${placeDetails.user_ratings_total || 0} reviews)`);
        }

        if (placeDetails.price_level) {
            infoContent.append("div").attr("class", "mb-2").html(`<i class="fas fa-dollar-sign text-green-600 mr-1"></i> Price: ${placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : 'N/A'}`);
        }

        if (placeDetails.formatted_address || placeDetails.vicinity) {
            infoContent.append("div").attr("class", "mb-2").html(`<i class="fas fa-map-marker-alt text-red-500 mr-1"></i> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeDetails.formatted_address || placeDetails.vicinity)}" target="_blank" class="text-blue-500 hover:underline">${placeDetails.formatted_address || placeDetails.vicinity}</a>`);
        }

        if (placeDetails.formatted_phone_number) {
            infoContent.append("div").attr("class", "mb-2").html(`<i class="fas fa-phone text-blue-500 mr-1"></i> ${placeDetails.formatted_phone_number}`);
        }

        if (placeDetails.website) {
            infoContent.append("div").attr("class", "mb-2").html(`<i class="fas fa-globe text-purple-500 mr-1"></i> <a href="${placeDetails.website}" target="_blank" class="text-blue-500 hover:underline">${placeDetails.website}</a>`);
        }

        const pickupServices = infoContent.append("div").attr("class", "mt-4");
        pickupServices.append("h3").attr("class", "text-lg font-semibold mb-2").text("Order for Pickup:");
        const serviceLinks = pickupServices.append("div").attr("class", "flex space-x-2");
        serviceLinks.append("a").attr("href", `https://www.doordash.com/search/${encodeURIComponent(placeDetails.name)}/`).attr("target", "_blank").attr("class", "px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600").text("DoorDash");
        serviceLinks.append("a").attr("href", `https://www.ubereats.com/search?q=${encodeURIComponent(placeDetails.name)}`).attr("target", "_blank").attr("class", "px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600").text("Uber Eats");
        serviceLinks.append("a").attr("href", `https://www.grubhub.com/search?queryText=${encodeURIComponent(placeDetails.name)}`).attr("target", "_blank").attr("class", "px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600").text("Grubhub");

        if (placeDetails.reviews && placeDetails.reviews.length > 0) {
            const reviewsContainer = infoContent.append("div").attr("class", "mt-4");
            reviewsContainer.append("h3").attr("class", "text-lg font-semibold mb-2").text("Top Reviews:");
            placeDetails.reviews.slice(0, 3).forEach(review => {
                const sentiment = review.rating >= 4 ? 'positive' : 'negative';
                reviewsContainer.append("div")
                    .attr("class", `review-item mb-2 p-2 ${sentiment === 'positive' ? 'bg-green-100' : 'bg-red-100'} rounded`)
                    .html(`<div class="flex items-center mb-1">
                               <span class="text-yellow-400">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                               <span class="ml-2 text-gray-600">${review.relative_time_description}</span>
                           </div>
                           <p class="text-gray-700">${review.text.substring(0, 100)}...</p>`);
            });
        }
    }

    function populateMenuTab(menuContent) {
        menuContent.append("h3").attr("class", "text-lg font-semibold mb-2").text("Menu");
        menuContent.append("p").attr("class", "text-gray-600 mb-4").text("Menu information is not available through the Google Places API. You can visit the restaurant's website or use a food delivery service to view their menu.");

        const searchContainer = menuContent.append("div").attr("class", "mb-4");
        searchContainer.append("input").attr("type", "text").attr("placeholder", "Search menu items...").attr("class", "px-2 py-1 border border-gray-300 rounded mr-2");
        searchContainer.append("button").attr("class", "px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600").text("Search").on("click", () => alert("This is a mock search functionality."));

        const sortContainer = menuContent.append("div").attr("class", "mb-4");
        sortContainer.append("label").attr("class", "mr-2").text("Sort by: ");
        const select = sortContainer.append("select").attr("class", "px-2 py-1 border border-gray-300 rounded");
        select.append("option").text("Price: Low to High");
        select.append("option").text("Price: High to Low");
        select.append("option").text("Popularity");
        select.on("change", () => alert("This is a mock sort functionality."));
    }

    function showTab(tabName) {
        d3.selectAll(".tab").classed("active", false).classed("bg-orange-500 text-white", false).classed("bg-gray-300 text-gray-700", true);
        d3.selectAll(".tab-content").classed("hidden", true);
        d3.select(`.tab`).filter(function() { return d3.select(this).text() === tabName; })
            .classed("active", true).classed("bg-orange-500 text-white", true).classed("bg-gray-300 text-gray-700", false);
        d3.select(`#${tabName}Tab`).classed("hidden", false);
    }

    document.getElementById('searchButton').addEventListener('click', async () => {
        const locationInput = document.getElementById('locationInput');
        const zipCode = locationInput.value;
        const interestType = document.getElementById('interestType').value;
    
        if (!zipCode) {
            alert('Please enter a ZIP code.');
            return;
        }
    
        try {
            const geocodeResponse = await fetch(`/.netlify/functions/googlePlaces?action=geocode&zipCode=${zipCode}`);
            if (!geocodeResponse.ok) {
                throw new Error(`HTTP error! status: ${geocodeResponse.status}`);
            }
            const geocodeData = await geocodeResponse.json();
            if (!geocodeData.results || geocodeData.results.length === 0) {
                throw new Error('Unable to find coordinates for the given ZIP code');
            }
            const { lat, lng } = geocodeData.results[0].geometry.location;
    
            // Update the query to include the interest type
            const response = await fetch(`/.netlify/functions/googlePlaces?action=nearbySearch&lat=${lat}&lng=${lng}&type=${interestType}&keyword=${interestType.replace('_', ' ')}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                createGraph(data.results, zipCode, lat, lng);
            } else {
                console.log('No results found');
                d3.select("#graph").html("<p class='text-center text-lg text-gray-600 mt-8'>No results found for this ZIP code and interest type.</p>");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            d3.select("#graph").html(`<p class='text-center text-lg text-red-600 mt-8'>Error fetching data: ${error.message}</p>`);
        }
    });
});
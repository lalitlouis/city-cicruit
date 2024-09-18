const mockData = {
    restaurants: [
      {
        id: 1,
        name: "Pasta Palace",
        type: "Italian",
        rating: 4.5,
        reviews: 120,
        popularItems: ["Spaghetti Carbonara", "Margherita Pizza", "Tiramisu"],
        bestReviews: [
          "Amazing authentic Italian cuisine! The carbonara was to die for.",
          "Great atmosphere and friendly staff. Will definitely come back!",
          "Best pizza I've had outside of Italy. Highly recommend!"
        ],
        worstReviews: [
          "Service was a bit slow during peak hours.",
          "Prices are on the higher side for pasta dishes.",
          "The restaurant can get quite noisy on weekends."
        ]
      },
      {
        id: 2,
        name: "Sushi Star",
        type: "Japanese",
        rating: 4.2,
        reviews: 85,
        popularItems: ["Dragon Roll", "Tuna Sashimi", "Miso Soup"],
        bestReviews: [
          "Fresh fish and creative rolls. The dragon roll is a must-try!",
          "Excellent service and beautiful presentation of dishes.",
          "Great value for money, especially their lunch specials."
        ],
        worstReviews: [
          "Waiting time can be long on busy nights.",
          "Some rolls had too much rice for my liking.",
          "Limited options for vegetarians."
        ]
      },
      {
        id: 3,
        name: "Burger Bliss",
        type: "American",
        rating: 4.7,
        reviews: 200,
        popularItems: ["Classic Cheeseburger", "Sweet Potato Fries", "Milkshakes"],
        bestReviews: [
          "Best burgers in town! Juicy and cooked to perfection.",
          "The sweet potato fries are addictive. Great casual dining spot.",
          "Fantastic milkshakes with generous portions."
        ],
        worstReviews: [
          "Can get very crowded during lunch hours.",
          "Limited healthy options on the menu.",
          "Parking can be a challenge."
        ]
      },
      {
        id: 4,
        name: "Taco Fiesta",
        type: "Mexican",
        rating: 4.0,
        reviews: 150,
        popularItems: ["Fish Tacos", "Guacamole", "Margaritas"],
        bestReviews: [
          "Authentic Mexican flavors. The fish tacos are a must-try!",
          "Great variety of salsas and the guacamole is made fresh.",
          "Fun atmosphere and delicious margaritas."
        ],
        worstReviews: [
          "Portions are a bit small for the price.",
          "Can be very loud on weekend evenings.",
          "Service can be inconsistent."
        ]
      },
      {
        id: 5,
        name: "Veggie Delight",
        type: "Vegetarian",
        rating: 4.6,
        reviews: 90,
        popularItems: ["Buddha Bowl", "Quinoa Burger", "Smoothies"],
        bestReviews: [
          "Amazing variety of vegetarian and vegan options.",
          "Fresh ingredients and creative dishes. Love the Buddha Bowl!",
          "Great for health-conscious eaters without sacrificing flavor."
        ],
        worstReviews: [
          "Prices are on the higher side.",
          "Some dishes could use more seasoning.",
          "Limited seating during peak hours."
        ]
      },
      {
        id: 6,
        name: "Noodle House",
        type: "Asian Fusion",
        rating: 4.3,
        reviews: 110,
        popularItems: ["Pad Thai", "Ramen", "Bao Buns"],
        bestReviews: [
          "Excellent variety of Asian cuisines. The Pad Thai is outstanding!",
          "Generous portions and great value for money.",
          "Cozy atmosphere and friendly staff."
        ],
        worstReviews: [
          "Some dishes can be overly salty.",
          "Wait times can be long during dinner rush.",
          "Limited dessert options."
        ]
      },
      {
        id: 7,
        name: "Steakhouse 66",
        type: "Steakhouse",
        rating: 4.8,
        reviews: 180,
        popularItems: ["Ribeye Steak", "Lobster Tail", "Truffle Mac and Cheese"],
        bestReviews: [
          "Best steaks in the city! Cooked to perfection every time.",
          "Excellent wine list and knowledgeable sommelier.",
          "Impeccable service and great for special occasions."
        ],
        worstReviews: [
          "Very expensive, not suitable for casual dining.",
          "Can be too noisy for intimate conversations.",
          "Reservations required well in advance for weekends."
        ]
      },
      {
        id: 8,
        name: "Café Parisienne",
        type: "French",
        rating: 4.4,
        reviews: 95,
        popularItems: ["Croissants", "Quiche Lorraine", "Espresso"],
        bestReviews: [
          "Feels like a little piece of Paris! Authentic pastries.",
          "Cozy atmosphere, perfect for a relaxed brunch.",
          "The quiche is simply delicious and changes daily."
        ],
        worstReviews: [
          "Limited seating, can feel cramped during busy hours.",
          "Closes early in the evening.",
          "Some may find it a bit pricey for café fare."
        ]
      },
      {
        id: 9,
        name: "Spice Route",
        type: "Indian",
        rating: 4.1,
        reviews: 130,
        popularItems: ["Butter Chicken", "Naan Bread", "Mango Lassi"],
        bestReviews: [
          "Authentic Indian flavors with a great range of spice levels.",
          "The naan bread is fresh and delicious.",
          "Excellent vegetarian options available."
        ],
        worstReviews: [
          "Service can be slow during busy times.",
          "Some dishes are overly creamy.",
          "Ventilation could be better - clothes may smell of spices after."
        ]
      },
      {
        id: 10,
        name: "Ocean's Bounty",
        type: "Seafood",
        rating: 4.5,
        reviews: 160,
        popularItems: ["Grilled Salmon", "Seafood Paella", "Clam Chowder"],
        bestReviews: [
          "Freshest seafood in town! The grilled salmon is a must-try.",
          "Beautiful ocean view and great ambiance.",
          "Extensive wine list that pairs well with the dishes."
        ],
        worstReviews: [
          "On the expensive side, especially for larger groups.",
          "Can be chilly when seated near the windows.",
          "Parking can be difficult on weekends."
        ]
      }
    ],
    museums: [
      {
        id: 1,
        name: "City History Museum",
        type: "History",
        rating: 4.7,
        reviews: 200,
        keyAttractions: ["Ancient Artifacts Gallery", "Interactive City Timeline", "Local Heroes Exhibit"],
        bestReviews: [
          "Fascinating journey through the city's history. Well-curated exhibits!",
          "The interactive timeline is engaging for both adults and children.",
          "Knowledgeable staff and free guided tours are a plus."
        ],
        worstReviews: [
          "Can get crowded during peak tourist season.",
          "Some exhibits could use updating.",
          "Gift shop is a bit overpriced."
        ]
      },
      {
        id: 2,
        name: "Modern Art Gallery",
        type: "Art",
        rating: 4.1,
        reviews: 150,
        keyAttractions: ["Abstract Expressionism Wing", "Interactive Art Studio", "Rotating Contemporary Exhibits"],
        bestReviews: [
          "Impressive collection of modern art. The Abstract Expressionism wing is a highlight!",
          "Love the interactive studio where visitors can create their own art.",
          "Frequently changing exhibits keep things fresh and interesting."
        ],
        worstReviews: [
          "Some may find the art too avant-garde or difficult to understand.",
          "Audio guides are an extra charge and should be included in admission.",
          "Limited seating throughout the galleries."
        ]
      },
      {
        id: 3,
        name: "Science Discovery Center",
        type: "Science",
        rating: 4.8,
        reviews: 300,
        keyAttractions: ["Planetarium", "Dinosaur Exhibit", "Hands-on Physics Lab"],
        bestReviews: [
          "Excellent for kids and adults alike. The planetarium show is a must-see!",
          "So many interactive exhibits. You can spend a whole day here easily.",
          "Staff are enthusiastic and great at explaining complex concepts."
        ],
        worstReviews: [
          "Can be very crowded on weekends and school holidays.",
          "Some exhibits were out of order during our visit.",
          "Cafeteria food is mediocre and expensive."
        ]
      },
      {
        id: 4,
        name: "Natural History Museum",
        type: "Natural History",
        rating: 4.6,
        reviews: 180,
        keyAttractions: ["Dinosaur Hall", "Gem and Mineral Collection", "Butterfly Garden"],
        bestReviews: [
          "The dinosaur exhibits are impressive and life-like!",
          "Beautiful gem and mineral collection. Could spend hours there.",
          "The butterfly garden is magical and great for photos."
        ],
        worstReviews: [
          "Some areas feel a bit dated and could use renovation.",
          "Not enough seating areas for resting between exhibits.",
          "Parking can be expensive and difficult to find."
        ]
      },
      {
        id: 5,
        name: "Maritime Museum",
        type: "Specialized",
        rating: 4.3,
        reviews: 120,
        keyAttractions: ["Historic Ship Tours", "Navigation Instruments Collection", "Shipwreck Artifacts"],
        bestReviews: [
          "Fascinating look into maritime history. The ship tours are excellent!",
          "Great collection of navigation instruments through the ages.",
          "The shipwreck artifacts tell amazing stories of sea adventures."
        ],
        worstReviews: [
          "Might be too specialized for some visitors.",
          "Some areas have limited accessibility for mobility-impaired visitors.",
          "Could benefit from more interactive displays for younger visitors."
        ]
      },
      {
        id: 6,
        name: "Contemporary Photography Gallery",
        type: "Art",
        rating: 4.0,
        reviews: 90,
        keyAttractions: ["Digital Art Installations", "Emerging Artists Showcase", "Photography Workshops"],
        bestReviews: [
          "Cutting-edge photography exhibits. Always something new and thought-provoking.",
          "The digital installations are incredibly immersive.",
          "Love the workshops - great for amateur photographers!"
        ],
        worstReviews: [
          "Exhibits can be hit or miss depending on personal taste.",
          "Relatively small space, can see everything in an hour or two.",
          "Lighting in some areas could be improved for better viewing."
        ]
      },
      {
        id: 7,
        name: "Automobile Museum",
        type: "Specialized",
        rating: 4.5,
        reviews: 160,
        keyAttractions: ["Vintage Car Collection", "Racing Simulators", "Engine Technology Exhibit"],
        bestReviews: [
          "Heaven for car enthusiasts! The vintage collection is impressive.",
          "The racing simulators are so much fun for all ages.",
          "Informative displays about the evolution of engine technology."
        ],
        worstReviews: [
          "Could use more information for non-car enthusiasts.",
          "Some interactive exhibits were out of order.",
          "Gift shop is small with limited selection."
        ]
      },
      {
        id: 8,
        name: "Children's Discovery Museum",
        type: "Children's",
        rating: 4.9,
        reviews: 250,
        keyAttractions: ["Mini City", "Science Playground", "Art Studio"],
        bestReviews: [
          "Perfect for kids! So many hands-on activities to keep them engaged.",
          "The mini city is adorable and teaches kids about different professions.",
          "Staff are patient and great with children."
        ],
        worstReviews: [
          "Can get very noisy and chaotic during peak times.",
          "Some areas are geared towards younger children, less for older kids.",
          "Cafeteria options are limited and not very healthy."
        ]
      },
      {
        id: 9,
        name: "Folk Art Museum",
        type: "Art",
        rating: 4.2,
        reviews: 110,
        keyAttractions: ["Traditional Crafts Gallery", "Folk Music Corner", "Seasonal Cultural Festivals"],
        bestReviews: [
          "Beautiful collection of traditional crafts from around the world.",
          "The folk music corner is a unique and enjoyable feature.",
          "Seasonal festivals bring the exhibits to life!"
        ],
        worstReviews: [
          "Relatively small museum, might not take long to see everything.",
          "Some displays lack detailed information about the artifacts.",
          "Limited parking options nearby."
        ]
      },
      {
        id: 10,
        name: "Aerospace Museum",
        type: "Science",
        rating: 4.7,
        reviews: 190,
        keyAttractions: ["Space Exploration Hall", "Flight Simulators", "Planetarium"],
        bestReviews: [
          "Incredible collection of aircraft and space vehicles.",
          "The flight simulators are a blast! Feel like a real pilot.",
          "Planetarium shows are informative and visually stunning."
        ],
        worstReviews: [
          "Some exhibits are roped off and you can't get very close.",
          "Could use more seating areas throughout the museum.",
          "Ticket prices are a bit high, especially with simulator fees."
        ]
      }
    ]
  };

  function calculateNodeSize(place) {
    // This is a simple calculation, you can make it more complex
    const popularityFactor = place.reviews / 100;
    const ratingFactor = place.rating;
    return 5 + (popularityFactor * ratingFactor);
}

function createGraph(data) {
    // Clear previous content
    d3.select("#graph").html("");
    d3.select("#infoName").text("");
    d3.select("#infoRating").text("");
    d3.select("#infoReviews").text("");
    d3.select("#infoPopular").html("");
    d3.select("#infoBestReviews").html("");
    d3.select("#infoWorstReviews").html("");

    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(data)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => calculateNodeSize(d)));

    const nodes = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", d => calculateNodeSize(d))
        .style("fill", d => d.type === "restaurants" ? "#ff9999" : "#99ccff");

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "node-tooltip")
        .style("opacity", 0);

    nodes.on("mouseover", (event, d) => {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`${d.name}<br/>Rating: ${d.rating}<br/>Reviews: ${d.reviews}`)
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
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

function showInfo(place) {
    d3.select("#infoName").text(place.name);
    d3.select("#infoRating").text(`Rating: ${place.rating}`);
    d3.select("#infoReviews").text(`Reviews: ${place.reviews}`);

    const popularItems = place.popularItems || place.keyAttractions;
    d3.select("#infoPopular").html("");
    popularItems.forEach(item => {
        d3.select("#infoPopular").append("li").text(item);
    });

    d3.select("#infoBestReviews").html("");
    place.bestReviews.forEach(review => {
        d3.select("#infoBestReviews").append("li").text(review);
    });

    d3.select("#infoWorstReviews").html("");
    place.worstReviews.forEach(review => {
        d3.select("#infoWorstReviews").append("li").text(review);
    });
}

document.getElementById('searchButton').addEventListener('click', () => {
    const placeType = document.getElementById('placeType').value;
    const searchInput = document.getElementById('searchInput').value;
    // For now, we're ignoring the search input and just using mock data
    createGraph(mockData[placeType]);
});

// Initial graph creation
createGraph(mockData.restaurants);
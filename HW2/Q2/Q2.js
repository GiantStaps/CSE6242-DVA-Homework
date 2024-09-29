d3.dsv(",", "board_games.csv", function (d) {
    return {
        source: d.source,
        target: d.target,
        value: +d.value,
        type: +d.value == 0 ? "similar" : "dissimilar"
    }
}).then(function (data) {
    var links = data;

    var nodes = {};

    var weight_max = 0;

    // compute the distinct nodes from the links.
    links.forEach(function (link) {
        link.source = nodes[link.source] || (nodes[link.source] = { name: link.source, weight: 0 });
        link.target = nodes[link.target] || (nodes[link.target] = { name: link.target, weight: 0 });
        // Calculate the degree of each node
        link.source.weight += 1;
        link.target.weight += 1;
        // Calculate maximum degree so we can map weight range to color scheme.
        weight_max = Math.max(weight_max, link.source.weight, link.target.weight);
    });

    // map the node weight distribution to a continuous range of greenness
    var color_scale = d3.scaleLinear()
        .domain([0, weight_max])
        .range(["#e5f5f9", "#2ca25f"]);

    var width = 1200,
        height = 700;

    var force = d3.forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-250))
        .alphaTarget(1)
        .on("tick", tick);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // add the links
    var path = svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", function (d) { return "link " + d.type; });

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", pinNode))
            .on("dblclick", unpinNode);

    // add the nodes
    var minRadius = 5;
    node.append("circle")
        .attr("id", function (d) {
            return (d.name.replace(/\s+/g, '').toLowerCase());
        })
        .attr("r", function (d) {
            return minRadius + (d.weight * 2);
        })
        .attr("fill", function (d) {
            return color_scale(d.weight);
        });

    // add the node names
    node.append("text")
        .attr("class", "name")
        .attr("transform", "translate(10, -10)")
        .text(function (d) {
            return d.name;
        });

    // add the curvy lines
    function tick() {
        path.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    };

    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    // function dragended(d) {
    //     if (!d3.event.active) force.alphaTarget(0);
    //     if (d.fixed == true) {
    //         d.fx = d.x;
    //         d.fy = d.y;
    //     }
    //     else {
    //         d.fx = null;
    //         d.fy = null;
    //     }
    // };

    function pinNode(d) {
        d.fixed = true;
        d.fx = d.x;
        d.fy = d.y;

        d3.select(this)
            .select("circle")
            .attr("fill", "#FFFF00");
    }

    function unpinNode(d) {
        d.fixed = false;
        d.fx = null;
        d.fy = null;

        d3.select(this)
            .select("circle")
            .attr("fill", function (d) {
                return color_scale(d.weight);
            });
    };

}).catch(function (error) {
    console.log(error);
});

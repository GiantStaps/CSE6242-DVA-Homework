from Q1 import Graph
import http.client
import json
import csv
import requests as re
import time

# Initialize the graph
graph = Graph()

# Case 1: Add isolated nodes (degree 0)
graph.add_node('1', 'Node 1')
graph.add_node('2', 'Node 2')
graph.add_node('3', 'Node 3')

# Case 2: Add a node with multiple edges (highest degree)
graph.add_node('4', 'Node 4')
graph.add_edge('4', '1')
graph.add_edge('4', '2')
graph.add_edge('4', '3')

# Case 3: Add nodes with negative degrees (invalid case)
# You would modify the degrees manually for testing purposes
graph.degrees['5'] = -1  # Invalid node degree
graph.degrees['6'] = -3  # Invalid node degree

# Case 4: Add more nodes with same max degree
graph.add_node('7', 'Node 7')
graph.add_edge('7', '1')
graph.add_edge('7', '3')

# Print out the results
max_degree_nodes = graph.max_degree_nodes()
print("Nodes with max degree:", max_degree_nodes)
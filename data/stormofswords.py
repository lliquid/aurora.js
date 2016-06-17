import networkx as nx
from networkx.readwrite import json_graph
import json

def main():
	g = nx.Graph()
	with open('stormofswords.csv', 'r') as f:
		f.readline()
		for l in f:
			src, tgt, weight = l.split(',')
			weight = int(weight)
			g.add_edge(src, tgt, weight=weight)
	with open('stormofswords.json', 'w') as f:
		json.dump(json_graph.node_link_data(g), f)


if __name__ == '__main__':
	main()


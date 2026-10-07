import json
from pathlib import Path
import networkx as nx

with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

G = nx.node_link_graph(data, edges='links')

target_id = None
for n in G.nodes(data=True):
    label = n[1].get('label', '')
    if 'Supabase' in label and 'MVP' in label:
        target_id = n[0]
        break

if not target_id:
    print('Node not found')
    raise SystemExit

print(f'=== Node: {target_id} ===')
print(f'Label: {G.nodes[target_id].get("label", "")}')
print(f'Community: {G.nodes[target_id].get("community_name", G.nodes[target_id].get("community", ""))}')
print()
print('=== Neighbors ===')
for neighbor in G.neighbors(target_id):
    edge_data = G.get_edge_data(target_id, neighbor)
    if isinstance(edge_data, dict) and 0 in edge_data:
        edge_data = edge_data[0]
    rel = edge_data.get('relation', '?') if edge_data else '?'
    nlabel = G.nodes[neighbor].get('label', neighbor)
    ncomm = G.nodes[neighbor].get('community_name', G.nodes[neighbor].get('community', ''))
    print(f'  --[{rel}]--> {nlabel} (community: {ncomm})')

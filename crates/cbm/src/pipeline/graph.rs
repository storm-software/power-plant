use std::collections::HashMap;

use serde_json::json;

/// In-memory graph node. Mirrors `cbm_gbuf_node_t`.
#[derive(Debug, Clone)]
pub struct GraphNode {
    pub id: i64,
    pub label: String,
    pub name: String,
    pub qualified_name: String,
    pub file_path: String,
    pub start_line: u32,
    pub end_line: u32,
    pub properties_json: String,
}

/// In-memory graph edge. Mirrors `cbm_gbuf_edge_t`.
#[derive(Debug, Clone)]
pub struct GraphEdge {
    pub source_id: i64,
    pub target_id: i64,
    pub edge_type: String,
    pub properties_json: String,
}

/// RAM-first graph buffer used during sequential indexing.
#[derive(Debug, Default)]
pub struct GraphBuffer {
    next_id: i64,
    nodes_by_qn: HashMap<String, GraphNode>,
    nodes_by_id: HashMap<i64, GraphNode>,
    edges: Vec<GraphEdge>,
}

impl GraphBuffer {
    pub fn new() -> Self {
        Self {
            next_id: 1,
            ..Self::default()
        }
    }

    pub fn node_count(&self) -> i32 {
        self.nodes_by_qn.len() as i32
    }

    pub fn edge_count(&self) -> i32 {
        self.edges.len() as i32
    }

    pub fn find_by_qn(&self, qn: &str) -> Option<&GraphNode> {
        self.nodes_by_qn.get(qn)
    }

    pub fn find_by_id(&self, id: i64) -> Option<&GraphNode> {
        self.nodes_by_id.get(&id)
    }

    pub fn find_by_simple_name(
        &self,
        simple: &str,
        exclude_qn: &str,
    ) -> Option<GraphNode> {
        self.nodes_by_qn
            .values()
            .find(|n| n.name == simple && n.qualified_name != exclude_qn)
            .cloned()
    }

    pub fn find_by_label(&self, label: &str) -> Vec<&GraphNode> {
        self.nodes_by_qn
            .values()
            .filter(|n| n.label == label)
            .collect()
    }

    pub fn upsert_node(
        &mut self,
        label: &str,
        name: &str,
        qualified_name: &str,
        file_path: &str,
        start_line: u32,
        end_line: u32,
        properties_json: &str,
    ) -> i64 {
        if let Some(existing) = self.nodes_by_qn.get_mut(qualified_name) {
            existing.label = label.to_string();
            existing.name = name.to_string();
            existing.file_path = file_path.to_string();
            existing.start_line = start_line;
            existing.end_line = end_line;
            existing.properties_json = properties_json.to_string();
            return existing.id;
        }

        let id = self.next_id;
        self.next_id += 1;
        let node = GraphNode {
            id,
            label: label.to_string(),
            name: name.to_string(),
            qualified_name: qualified_name.to_string(),
            file_path: file_path.to_string(),
            start_line,
            end_line,
            properties_json: properties_json.to_string(),
        };
        self.nodes_by_qn
            .insert(qualified_name.to_string(), node.clone());
        self.nodes_by_id.insert(id, node);
        id
    }

    pub fn insert_edge(
        &mut self,
        source_id: i64,
        target_id: i64,
        edge_type: &str,
        properties_json: &str,
    ) {
        if source_id == target_id {
            return;
        }
        if self.edges.iter().any(|e| {
            e.source_id == source_id
                && e.target_id == target_id
                && e.edge_type == edge_type
        }) {
            return;
        }
        self.edges.push(GraphEdge {
            source_id,
            target_id,
            edge_type: edge_type.to_string(),
            properties_json: properties_json.to_string(),
        });
    }

    pub fn delete_by_file(&mut self, rel_path: &str) {
        let doomed: Vec<i64> = self
            .nodes_by_qn
            .values()
            .filter(|n| n.file_path == rel_path)
            .map(|n| n.id)
            .collect();
        self.nodes_by_qn
            .retain(|_, n| !doomed.contains(&n.id));
        for id in &doomed {
            self.nodes_by_id.remove(id);
        }
        self.edges
            .retain(|e| !doomed.contains(&e.source_id) && !doomed.contains(&e.target_id));
    }
}

pub fn is_dir_container(node: &GraphNode) -> bool {
    matches!(node.label.as_str(), "Folder" | "Project")
}

pub fn build_import_props(local_name: Option<&str>) -> String {
    json!({ "local_name": local_name.unwrap_or("") }).to_string()
}

const BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchApplications() {
  const resp = await fetch(`${BASE_URL}/applications`);
  if (!resp.ok) throw new Error("Failed to fetch applications");
  return resp.json();
}

export async function fetchApplicationDetails(appId: string) {
  const resp = await fetch(`${BASE_URL}/applications/${appId}`);
  if (!resp.ok) throw new Error("Failed to fetch application details");
  return resp.json();
}

export async function fetchApplicationGraph(appId: string, format: "cytoscape" | "react-flow" = "cytoscape") {
  const resp = await fetch(`${BASE_URL}/applications/${appId}/graph?format=${format}`);
  if (!resp.ok) throw new Error("Failed to fetch application graph");
  return resp.json();
}

export async function fetchAIExplanation(appId: string) {
  const resp = await fetch(`${BASE_URL}/applications/${appId}/explanation`);
  if (!resp.ok) throw new Error("Failed to fetch AI explanation");
  return resp.json();
}

export async function ingestRepository(path: string, name: string) {
  const resp = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, name }),
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || "Failed to ingest codebase");
  }
  return resp.json();
}

export async function evolveGenome(parentIds: string[], name: string) {
  const resp = await fetch(`${BASE_URL}/evolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parent_ids: parentIds, name }),
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || "Failed to evolve software genomes");
  }
  return resp.json();
}

export async function runSimulations(appId: string) {
  const resp = await fetch(`${BASE_URL}/applications/${appId}/simulate`, {
    method: "POST"
  });
  if (!resp.ok) throw new Error("Failed to run simulations");
  return resp.json();
}

export async function fetchSimulations(appId: string) {
  const resp = await fetch(`${BASE_URL}/applications/${appId}/simulations`);
  if (!resp.ok) throw new Error("Failed to fetch simulations");
  return resp.json();
}

export function getExportZipUrl(appId: string) {
  return `${BASE_URL}/applications/${appId}/export`;
}

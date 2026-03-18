import { EpsteinInvestigationResult } from "../types";

export async function searchEpsteinInvestigation(name: string): Promise<EpsteinInvestigationResult> {
  try {
    // Search entities
    const entityUrl = `https://epsteininvestigation.org/api/v1/entities?q=${encodeURIComponent(name)}&limit=5`;
    const entityRes = await fetch(entityUrl, {
      headers: { "User-Agent": "ismyvcaforeignagent/1.0" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });

    let entities: EpsteinInvestigationResult["entities"] = [];
    if (entityRes.ok) {
      const entityData = await entityRes.json();
      entities = (entityData.data || []).map((e: Record<string, unknown>) => ({
        name: e.name as string,
        slug: e.slug as string,
        entityType: e.entity_type as string,
        documentCount: (e.document_count as number) || 0,
        flightCount: (e.flight_count as number) || 0,
        emailCount: (e.email_count as number) || 0,
        roleDescription: (e.role_description as string) || "",
      }));
    }

    // Search flights for this person
    const flightUrl = `https://epsteininvestigation.org/api/v1/flights?passenger=${encodeURIComponent(name)}&limit=10`;
    const flightRes = await fetch(flightUrl, {
      headers: { "User-Agent": "ismyvcaforeignagent/1.0" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });

    let flights: EpsteinInvestigationResult["flights"] = [];
    let totalFlights = 0;
    if (flightRes.ok) {
      const flightData = await flightRes.json();
      totalFlights = flightData.total || 0;
      flights = (flightData.data || []).slice(0, 5).map((f: Record<string, unknown>) => ({
        flightDate: f.flight_date as string,
        departure: `${f.departure_airport} (${f.departure_airport_code})`,
        arrival: `${f.arrival_airport} (${f.arrival_airport_code})`,
        passengers: (f.passenger_names as string[]) || [],
        tailNumber: f.aircraft_tail_number as string,
      }));
    }

    const hit = entities.length > 0 || flights.length > 0;

    return {
      source: "epstein_investigation",
      hit,
      entities,
      flights,
      totalFlights,
    };
  } catch (e) {
    return {
      source: "epstein_investigation",
      hit: false,
      error: (e as Error).message,
      entities: [],
      flights: [],
      totalFlights: 0,
    };
  }
}

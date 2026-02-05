/**
 * ExerciseDB API Service
 * API Documentation: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 */

const EXERCISEDB_BASE_URL = "https://exercisedb.p.rapidapi.com";

interface ExerciseDBConfig {
  apiKey: string;
  apiHost: string;
}

function getConfig(): ExerciseDBConfig {
  const apiKey = process.env.EXERCISEDB_API_KEY;
  if (!apiKey) {
    throw new Error("EXERCISEDB_API_KEY environment variable is not set");
  }
  return {
    apiKey,
    apiHost: "exercisedb.p.rapidapi.com",
  };
}

function getHeaders(): HeadersInit {
  const config = getConfig();
  return {
    "x-rapidapi-key": config.apiKey,
    "x-rapidapi-host": config.apiHost,
  };
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface ExerciseSearchParams {
  limit?: number;
  offset?: number;
}

/**
 * Get all exercises with pagination
 */
export async function getAllExercises(
  params: ExerciseSearchParams = {}
): Promise<Exercise[]> {
  const { limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${EXERCISEDB_BASE_URL}/exercises?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/exercise/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get exercises by name (search)
 */
export async function getExercisesByName(
  name: string,
  params: ExerciseSearchParams = {}
): Promise<Exercise[]> {
  const { limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${EXERCISEDB_BASE_URL}/exercises/name/${encodeURIComponent(name)}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get exercises by body part
 */
export async function getExercisesByBodyPart(
  bodyPart: string,
  params: ExerciseSearchParams = {}
): Promise<Exercise[]> {
  const { limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${EXERCISEDB_BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get exercises by target muscle
 */
export async function getExercisesByTarget(
  target: string,
  params: ExerciseSearchParams = {}
): Promise<Exercise[]> {
  const { limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${EXERCISEDB_BASE_URL}/exercises/target/${encodeURIComponent(target)}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get exercises by equipment type
 */
export async function getExercisesByEquipment(
  equipment: string,
  params: ExerciseSearchParams = {}
): Promise<Exercise[]> {
  const { limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${EXERCISEDB_BASE_URL}/exercises/equipment/${encodeURIComponent(equipment)}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get list of all body parts
 */
export async function getBodyPartList(): Promise<string[]> {
  const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/bodyPartList`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get list of all target muscles
 */
export async function getTargetList(): Promise<string[]> {
  const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/targetList`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get list of all equipment types
 */
export async function getEquipmentList(): Promise<string[]> {
  const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/equipmentList`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status}`);
  }

  return response.json();
}

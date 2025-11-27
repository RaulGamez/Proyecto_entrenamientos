import { supabase } from "./supabase";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Obtener equipos del usuario autenticado y participantes
export async function getUserTeams() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("users_teams")
    .select(`
      team_id,
      teams (
        id,
        name,
        category,
        players_target,
        training_days,
        cover_url,
        goals,
        created_at,
        created_by,
        creator:created_by ( username )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { foreignTable: "teams", ascending: false });

  if (error) {
    console.error("Error al cargar equipos:", error.message);
    throw error;
  }

  return (data || []).map((d) => d.teams);
}

// Crear nuevo equipo
export async function createTeam(name) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const teamName = name?.trim() || "Equipo sin título";

  // Creamos el equipo
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert([{ name: teamName, created_by: user.id }])
    .select()
    .single();

  if (teamError) throw teamError;

  // Relacion en users_teams
  const { error: linkError } = await supabase
    .from("users_teams")
    .insert([{ user_id: user.id, team_id: team.id }]);

  if (linkError) throw linkError;

  return team;
}

// Eliminar un equipo (si el usuario es unico miembro)
export async function deleteTeam(teamId) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  // Verificar que el usuario pertenece al equipo
  const { data: memberships, error: membershipError } = await supabase
    .from("users_teams")
    .select("user_id, team_id")
    .eq("team_id", teamId);

  if (membershipError) throw membershipError;
  if (!memberships || memberships.length === 0)
    throw new Error("El equipo no existe");

  const isMember = memberships.some(m => m.user_id === user.id);
  if (!isMember) throw new Error("No perteneces a este equipo");

  // Solo permitir eliminar si es el unico miembro
  if (memberships.length > 1)
    throw new Error("No puedes eliminar el equipo mientras tenga otros miembros");

  // Eliminar relaciones y luego el equipo
  const { error: relError } = await supabase
    .from("users_teams")
    .delete()
    .eq("team_id", teamId);

  if (relError) throw relError;

  const { error: teamError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (teamError) throw teamError;

  return true;
}

export async function getUserPlayers() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .rpc("get_user_players", { user_uuid: user.id });

  if (error) {
    console.error("Error RPC get_user_players:", error.message);
    return [];
  }

  // data ya es un array JSONB listo para usar
  return data;
}

export async function getTeamPlayers() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      category,
      players_target,
      goals,
      training_days,
      cover_url,
      matches:matches!matches_team_id_fkey (
        id,
        opponent,
        date,
        our_pts,
        opp_pts,
        result
      ),
      players:players!players_team_id_fkey (
        id,
        name,
        number,
        role,
        age,
        height,
        status,
        team_id
      )
    `)
    .eq('id', id)
    .order('date', { referencedTable: 'matches', ascending: false })
    .limit(5, { referencedTable: 'matches' })
    .order('name', { referencedTable: 'players', ascending: true })
    .limit(6, { referencedTable: 'players' })
    .single();
}

export async function getEvents() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", user.id)
    .order("start", { ascending: true });

  if (error) {
    console.error("Error al cargar eventos:", error.message);
    throw error;
  }

  return (data || []).map((e) => ({
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
  }));
}

export async function getTasks() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("created_by", user.id)
    .order("done", { ascending: true });

  if (error) {
    console.error("Error al cargar tasks:", error.message);
    throw error;
  }

  return (data || []);
}

export async function createExercise(exercise) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");
  
  
  // Creamos el equipo
  const { data, error } = await supabase
  .from("exercises")
  .insert(exercise)
  .select();
  
  if (error) throw error;
  
  // Relacion en users_teams
  const { error: linkError } = await supabase
    .from("users_exercises")
    .insert([{ user_id: user.id, exercise_id: data.id }]);

  if (linkError) throw linkError;

  return data;
}

export async function getUserExercises() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
  .from("users_exercises")
  .select(`
    exercise_id,
    exercises (
      id,
      name,
      type,
      duration,
      players,
      court,
      description,
      created_at,
      created_by,
      creator:created_by ( username )
    )
  `)
  .eq("user_id", user.id)
  .order("created_at", { foreignTable: "exercises", ascending: false });

  if (error) {
    console.error("Error al cargar ejercicios:", error.message);
    return {data: null, error: error};
  }

  return { data: (data || []).map((d) => d.exercises), error: null};
}

export async function createTraining(training) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");
  
  const trainingId = uuidv4();
  
  // Creamos el equipo
  const { error } = await supabase
  .from("trainings")
  .insert([{id: trainingId, ...training}])
  .single();
  
  if (error) {
    return {error: error};
  }
  
  // Relacion en users_teams
  const { error: linkError } = await supabase
    .from("users_trainings")
    .insert([{ user_id: user.id, training_id: trainingId }]);

  if (linkError) {
    return { error: linkError};
  }

  return {error: null};
}
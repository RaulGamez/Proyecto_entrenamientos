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
export async function createTeam(team) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const teamId = uuidv4();

  // Creamos el equipo
  const { data, error: teamError } = await supabase
    .from("teams")
    .insert([{ id: teamId, ...team}])
    .single();

  if (teamError) return {teamError};

  // Relacion en users_teams
  const { error: linkError } = await supabase
    .from("users_teams")
    .insert([{ user_id: user.id, team_id: teamId }]);

  if (linkError) return {linkError};

  return {error: null};
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

export async function createPlayer({player, teams}) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const playerId = uuidv4();

  // Creamos el jugador
  const { data, error: playerError } = await supabase
    .from("players")
    .insert([{ id: playerId, ...player}])
    .single();

  if (playerError) return {data: null, error: playerError};

  // Relacion en users_players
  const { error: linkError } = await supabase
    .from("users_players")
    .insert([{ user_id: user.id, player_id: playerId }]);

  if (linkError) return {data: null, error: linkError};

  if (teams.length > 0) {
    // insert in teams_players
    const rows = teams.map(teamId => ({
      player_id: playerId,
      team_id: teamId,
    }));
    const { error: tpRelationError } = await supabase
    .from("teams_players")
    .insert(rows);

    if (tpRelationError) return {data: null, error: tpRelationError};
  }

  return {data: playerId, error: null};
}

export async function getUserPlayersOld() {
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

export async function getUserPlayers() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("users_players")
    .select(`
      player_id,
      players (
        id,
        name,
        number,
        role,
        age,
        height,
        status,
        created_at,
        created_by,
        creator:created_by ( username ),
        teams_players (
          teams (*)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("name", { foreignTable: "players", ascending: true });

  if (error) {
    console.error("Error al obtener los jugadores del usuario:", error.message);
    return {data: null, error: error};
  }

  const players = (data || []).map((row) => {
    const player = row.players;

    const teams =
      player.teams_players?.map((tp) => tp.teams) || [];

    return {
      ...player,
      teams,
    };
  });

  delete players.teams_players;

  return {data: players, error: null};
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
  
  const exerciseId = uuidv4();
  
  // Creamos el equipo
  const { error } = await supabase
  .from("exercises")
  .insert([{id: exerciseId, ...exercise}]);
  
  if (error) {
    return {error};
  }
  
  // Relacion en users_teams
  const { error: linkError } = await supabase
    .from("users_exercises")
    .insert([{ user_id: user.id, exercise_id: exerciseId }]);

  if (linkError) {
    return { error: linkError};
  }

  return {error: null};
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

export async function createTraining({training, exercises}) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");
  
  const trainingId = uuidv4();
  
  // Creamos el entrenamiento
  const { error } = await supabase
  .from("trainings")
  .insert([{id: trainingId, ...training}]);
  
  if (error) return {error: error};
  
  // Relacion en users_trainings
  const { error: linkError } = await supabase
    .from("users_trainings")
    .insert([{ user_id: user.id, training_id: trainingId }]);

  if (linkError) return { error: linkError};

  if (exercises.length > 0) {
    // insert in trainings_exercises
    const rows = exercises.map(exerciseId => ({
      training_id: trainingId,
      exercise_id: exerciseId,
    }));
    const { error: teRelationError } = await supabase
    .from("trainings_exercises")
    .insert(rows);

    if (teRelationError) return {error: teRelationError};
  }

  return {error: null};
}

export async function getUserTrainings() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
  .from("users_trainings")
  .select(`
    training_id,
    trainings (
      id,
      created_at,
      date,
      duration,
      players,
      court,
      description,
      created_at,
      team_id,
      team:team_id ( name ),
      created_by,
      creator:created_by ( username ),
      trainings_exercises (
        exercise_id,
        exercises (*)
      )
    )
  `)
  .eq("user_id", user.id)
  .order("created_at", { foreignTable: "trainings", ascending: false });

  if (error) {
    console.error("Error al cargar entrenamientos:", error.message);
    return {data: null, error: error};
  }

  const trainings = (data || []).map((row) => {
    const training = row.trainings;

    const exercises =
      training.trainings_exercises?.map((te) => te.exercises) || [];

    return {
      ...training,
      exercises,  // aquí ya tienes un array plano solo con ejercicios
    };
  });

  delete trainings.trainings_exercises;

  return {data: trainings, error: null};
}

export async function updateTraining({training, exercises}) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");
  
  const newIds = (exercises || []).filter(
    (id) => typeof id === "string" && id.trim() !== ""
  );

  const { error: updateError } = await supabase
    .from("trainings")
    .update({
      date: training.date,
      duration: training.duration,
      players: training.players,
      court: training.court,
      description: training.description,
    })
    .eq("id", training.id);
  
  if (updateError) return {error: updateError};

  //obtenemos las relaciones actuales del entrenamiento
  const { data: currentExercises, error: currentError } = await supabase
  .from("trainings_exercises")
  .select("exercise_id")
  .eq("training_id", training.id);
  if (currentError) return { error: currentError };

  const currentIds = (currentExercises || [])
    .map((e) => e.exercise_id)
    .filter((id) => typeof id === "string" && id.trim() !== "");

  const deleteIds = currentIds.filter((id) => !newIds.includes(id));
  const insertIds = newIds.filter((id) => !currentIds.includes(id));

  if (deleteIds.length > 0) {
    // Eliminamos las relaciones que no esten aqui dentro
    const { error: deleteError } = await supabase
    .from("trainings_exercises")
    .delete()
    .eq("training_id", training.id)
    .in("exercise_id", deleteIds);

    if (deleteError) return {error: deleteError};
  }

  if (insertIds.length > 0) {
    const insertRows = insertIds.map(insertId => ({
      training_id: training.id,
      exercise_id: insertId,
    }));
    const { error: insertError } = await supabase
    .from("trainings_exercises")
    .insert(insertRows);

    if (insertError) return {error: insertError};
  }

  return {error: null};
}

export async function getTeamById(teamId) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      category,
      players_target,
      training_days,
      cover_url,
      goals,
      created_at,
      created_by,
      creator:created_by ( username ),
      matches (*),
      teams_players (
        players (*)
      )
    `)
    .eq("id", teamId)
    // Ordenar matches
    .order("date", { foreignTable: "matches", ascending: false })
    .limit(5, { foreignTable: "matches" })
    // Ordenar players
    .order("name", { foreignTable: "teams_players.players", ascending: true })
    .limit(6, { foreignTable: "teams_players.players" })
    .single();

  if (error) {
    console.error("Error al cargar equipo:", error.message);
    throw error;
    return {data: null, error: error};
  }

  const team = {
    ...data,
    players: data.teams_players?.map(tp => tp.players) || [],
  };

  delete team.teams_players; // borrar el campo teams_players del objeto team (lo sustituye players)

  return {data: team, error: null};
}

export async function updateTeamPlayers({teamId, currentPlayersIds, selectedPlayersIds}) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");


  const deletePlayersIds = currentPlayersIds.filter((id) => !selectedPlayersIds.includes(id));
  const insertPlayersIds = selectedPlayersIds.filter((id) => !currentPlayersIds.includes(id));

  // Eliminamos las relaciones de los jugadores deseleccionados
  if (deletePlayersIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("teams_players")
      .delete()
      .eq("team_id", teamId)
      .in("player_id", deletePlayersIds);
    
    if (deleteError) return {error: deleteError};
  }

  // Insertamos nuevas relaciones de los jugadors seleccionados
  if (insertPlayersIds.length > 0) {
    const insertRows = insertPlayersIds.map(playerId => ({
      team_id: teamId,
      player_id: playerId,
    }));

    const { error: insertError } = await supabase
      .from("teams_players")
      .insert(insertRows);
    
    if (insertError) return {error: insertError};
  }

  return {error: null};
}
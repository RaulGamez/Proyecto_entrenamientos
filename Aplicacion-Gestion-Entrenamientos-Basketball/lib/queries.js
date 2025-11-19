import { supabase } from "./supabase";

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

/*export async function getUserPlayersOld() {
  const { data: players, error: playersError } = await supabase
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
        creator:created_by ( username )
        team:id (
          team_id (
            team ( name )
            )
          )
      )
    `)
    .eq("user_id", user.id)
    .order("name", { foreignTable: "players", ascending: true });
  if (error) {
    console.warn("getUserPlayers", error);
    return [];
  }
  return data || [];
}*/

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
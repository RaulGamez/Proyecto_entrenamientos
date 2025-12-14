import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from "react-native";
import { Calendar } from "react-native-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { supabase } from "../lib/supabase";
import { styles } from "./styles";
import { getEvents, getTasks } from "../lib/queries.js"
import { useFocusEffect } from "expo-router";


// Combina fecha y hora en un objeto Date
function combineDateAndTime(baseDate, hhmm) {
  const d = dayjs(baseDate);
  const [h, m] = hhmm.split(":").map(Number);
  return d.hour(h).minute(m).second(0).millisecond(0).toDate();
}

export function Main() {
  // ----------- CALENDARIO -----------
  const [events, setEvents] = useState([]);
  const [todayDate] = useState(() => new Date());      // fijo: hoy
  const [calendarDate, setCalendarDate] = useState(() => new Date()); // mes visible
  const [selectedDate, setSelectedDate] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newDate, setNewDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:00");
  const [errorMsg, setErrorMsg] = useState("");

  const memoEvents = useMemo(() => events, [events]);
  const lastMonthKeyRef = useRef(dayjs(calendarDate).format("YYYY-MM"));

  // ----------- TAREAS -----------
  const [tasks, setTasks] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskEditingId, setTaskEditingId] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");

  // ----------- CARGA INICIAL SUPABASE -----------
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // events
      const e = await getEvents(); // en /queries
      setEvents(e);

      // tasks
      const t = await getTasks();
      setTasks(t);

      setLoading(false);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const e = await getEvents();
        if (alive) setEvents(e);
      })();
      return () => { alive = false; };
    }, [])
  );

  // ----------- NAVEGACIÓN MES -----------
  const goPrevMonth = () => setCalendarDate(dayjs(calendarDate).subtract(1, "month").toDate());
  const goNextMonth = () => setCalendarDate(dayjs(calendarDate).add(1, "month").toDate());

  const handleRangeChange = useCallback((range) => {
    let start;

    if (Array.isArray(range) && range.length > 0) {
      const nums = range.map((d) =>
        d instanceof Date ? d.getTime() : new Date(d).getTime()
      );
      start = dayjs(Math.min(...nums));
    } else if (range?.start) {
      start = dayjs(range.start);
    } else {
      start = dayjs(calendarDate).startOf("month");
    }

    const midDate = start.add(2, "week").toDate(); // tu lógica original (funciona bien con esa lib)
    const newMonthKey = dayjs(midDate).format("YYYY-MM");

    if (lastMonthKeyRef.current !== newMonthKey) {
      lastMonthKeyRef.current = newMonthKey;
      setCalendarDate(midDate);
    }
  }, [calendarDate]);

  const highlightDateCell = useCallback((date) => {
    const isSelected = selectedDate && dayjs(date).isSame(selectedDate, "day");
    return isSelected
      ? { backgroundColor: "#f2fcfdff", borderColor: "#c1dcd9ff", borderWidth: 2, borderRadius: 8 }
      : { backgroundColor: "#fff",     borderColor: "#e5e7eb", borderWidth: 1, borderRadius: 6 };
  }, [selectedDate]);


  // ----------- RENDER EVENTO (month) -----------
  const renderMonthEvent = (event) => {
    const timeLabel = dayjs(event.start).format("HH:mm");
    const isTraining = String(event.title || "").startsWith("Entrene ");

    return (
      <View style={[styles.eventChip, isTraining && styles.eventChipTraining]}>
        <Text numberOfLines={1} style={styles.eventText}>
          <Text style={[styles.eventTime, isTraining && styles.eventTimeTraining]}>
            {timeLabel}{" "}
          </Text>
          {event.title}
        </Text>
      </View>
    );
  };

  // ----------- ESTILO DE CELDA SELECCIONADA -----------
  const dateCellStyle = useCallback(
    (date) => {
      const isSelected = selectedDate && dayjs(date).isSame(selectedDate, "day");
      return isSelected
        ? { backgroundColor: "#ffe9d2", borderColor: "#ff9531", borderWidth: 2, borderRadius: 8 }
        : { backgroundColor: "#fff", borderColor: "#e5e7eb", borderWidth: 1, borderRadius: 6 };
    },
    [selectedDate]
  );

  // ----------- MODALES CALENDARIO -----------
  const openCreateModalFor = (date) => {
    setIsEditing(false);
    setEditingId(null);
    setNewDate(date || new Date());
    setTitle("");
    setStartTime("18:00");
    setEndTime("19:00");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModalFor = (event) => {
    setIsEditing(true);
    setEditingId(String(event.id));
    const start = dayjs(event.start);
    const end = dayjs(event.end);
    setNewDate(start.toDate());
    setTitle(event.title || "");
    setStartTime(start.format("HH:mm"));
    setEndTime(end.format("HH:mm"));
    setErrorMsg("");
    setModalOpen(true);
  };

  // ----------- COMPONENTE ESTADO VACÍO -----------
  const EmptyState = ({ icon = "📭", title, text }) => (
    <View style={[styles.emptyStateCard, styles.cardShadow]}>
      <View style={styles.emptyStateIcon}>
        <Text>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{text}</Text>
      </View>
    </View>
  );

  // ----------- CRUD EVENTOS (Supabase) -----------
  const saveEvent = async () => {
    if (!title.trim()) return setErrorMsg("Pon un título");
    const start = combineDateAndTime(newDate, startTime);
    const end = combineDateAndTime(newDate, endTime);
    if (!dayjs(end).isAfter(start)) return setErrorMsg("Hora fin debe ser posterior al inicio");

    if (isEditing && editingId !== null) {
      const { error } = await supabase
        .from("events")
        .update({ title, start: start.toISOString(), end: end.toISOString() })
        .eq("id", editingId);
      if (error) {
        console.error(error);
        Alert.alert("Supabase", "No se pudo actualizar el evento.");
      } else {
        setEvents((prev) =>
          prev.map((ev) => (String(ev.id) === String(editingId) ? { ...ev, title, start, end } : ev))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("events")
        .insert([{ title, start: start.toISOString(), end: end.toISOString() }])
        .select()
        .single();
      if (error) {
        console.error(error);
        Alert.alert("Supabase", "No se pudo crear el evento.");
      } else {
        setEvents((prev) => [
          ...prev,
          { id: data.id, title: data.title, start: new Date(data.start), end: new Date(data.end) },
        ]);
      }
    }
    setModalOpen(false);
  };

  const deleteEvent = async () => {
    if (!isEditing || editingId === null) return setModalOpen(false);
    Alert.alert("Borrar evento", "¿Seguro que quieres borrar este evento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("events").delete().eq("id", editingId);
          if (error) {
            console.error(error);
            Alert.alert("Supabase", "No se pudo borrar el evento.");
          } else {
            setEvents((prev) => prev.filter((ev) => String(ev.id) !== String(editingId)));
          }
          setModalOpen(false);
        },
      },
    ]);
  };

  // ----------- DERIVADOS PARA EL DASHBOARD -----------
  const todaysAgenda = useMemo(() => {
    return memoEvents
      .filter((ev) => dayjs(ev.start).isSame(todayDate, "day"))
      .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
  }, [memoEvents, calendarDate]);

  // Los 3 próximos eventos a partir de ahora
  const nextThreeEvents = useMemo(() => {
    const now = dayjs();
    return [...events]
      .filter((e) => dayjs(e.start).isAfter(now))            // futuros
      .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
      .slice(0, 3);
  }, [events]);

  // ----------- MODALES TAREAS -----------
  const openCreateTaskModal = () => {
    setTaskEditingId(null);
    setTaskTitle("");
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setTaskEditingId(String(task.id));
    setTaskTitle(task.title || "");
    setTaskModalOpen(true);
  };

  // ----------- CRUD TAREAS (Supabase) -----------
  const saveTask = async () => {
    const t = (taskTitle || "").trim();
    if (!t) return;

    if (taskEditingId !== null) {
      const { error } = await supabase.from("tasks").update({ title: t }).eq("id", taskEditingId);
      if (error) {
        console.error(error);
        Alert.alert("Supabase", "No se pudo actualizar la tarea.");
      } else {
        setTasks((prev) => prev.map((x) => (String(x.id) === String(taskEditingId) ? { ...x, title: t } : x)));
      }
    } else {
      const { data, error } = await supabase.from("tasks").insert([{ title: t }]).select().single();
      if (error) {
        console.error(error);
        Alert.alert("Supabase", "No se pudo crear la tarea.");
      } else {
        setTasks((prev) => [...prev, data]);
      }
    }
    setTaskModalOpen(false);
  };

  const deleteTask = async (id) => {
    Alert.alert("Borrar tarea", "¿Seguro que quieres borrar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("tasks").delete().eq("id", id);
          if (error) {
            console.error(error);
            Alert.alert("Supabase", "No se pudo borrar la tarea.");
          } else {
            setTasks((p) => p.filter((x) => String(x.id) !== String(id)));
          }
        },
      },
    ]);
  };

  const toggleTask = async (id) => {
    const current = tasks.find((t) => String(t.id) === String(id));
    if (!current) return;
    const nextDone = !current.done;

    const { error } = await supabase.from("tasks").update({ done: nextDone }).eq("id", id);
    if (error) {
      console.error(error);
      Alert.alert("Supabase", "No se pudo actualizar la tarea.");
    } else {
      setTasks((prev) => prev.map((t) => (String(t.id) === String(id) ? { ...t, done: nextDone } : t)));
    }
  };

  // ----------- UI -----------
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecera bienvenida */}
        <View style={styles.welcomeCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.welcomeTitle}>Bienvenido, Coach 🏀</Text>
          </View>
          <Text style={styles.welcomeDate}>
            {dayjs(todayDate).locale("es").format("dddd, D [de] MMMM YYYY")}
          </Text>
        </View>

        {/* Calendario + botón nuevo evento */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendario</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => openCreateModalFor(selectedDate || todayDate)}>
              <Text style={styles.primaryBtnText}>+ Evento</Text>
            </TouchableOpacity>
          </View>

          {/* Barra de mes con flechas */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={goPrevMonth}>
              <Text style={styles.navBtnText}>〈</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{dayjs(calendarDate).locale("es").format("MMMM [de] YYYY")}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={goNextMonth}>
              <Text style={styles.navBtnText}>〉</Text>
            </TouchableOpacity>
          </View>

          {/* Calendario */}
          <View style={styles.calendarCard}>
            <Calendar
              events={events}               
              height={styles.calendarCard.height}
              locale="es"
              weekStartsOn={1}
              mode="month"
              swipeEnabled
              date={calendarDate}
              onChangeDate={handleRangeChange}
              onPressEvent={(event) => openEditModalFor(event)}
              onPressCell={(date) => {
                if (selectedDate && dayjs(selectedDate).isSame(date, "day")) {
                  setSelectedDate(null);
                } else {
                  setSelectedDate(date);
                }
              }}
              renderEvent={renderMonthEvent}
              dateCellStyle={highlightDateCell}
              calendarCellStyle={highlightDateCell}
              headerContainerStyle={styles.calendarHeaderContainer}
              headerContentStyle={styles.calendarHeaderContent}
              theme={{ palette: { primary: { main: "#ff9531", contrastText: "#fff" } } }}
            />
          </View>
        </View>

        {/* Agenda de Hoy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Agenda de Hoy <Text style={styles.sectionCount}>{todaysAgenda.length} evento(s)</Text>
            </Text>
          </View>

          {todaysAgenda.length === 0 ? (
            <EmptyState
              icon="🗓️"
              title="Sin eventos hoy"
              text="No tienes nada programado para hoy."
            />
          ) : (
            todaysAgenda.map((ev) => (
              <TouchableOpacity key={ev.id} style={[styles.agendaItem, styles.cardShadow]} onPress={() => openEditModalFor(ev)}>
                <View style={styles.agendaIcon}><Text>🏀</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agendaTitle}>{ev.title}</Text>
                  <Text style={styles.agendaMeta}>
                    {dayjs(ev.start).format("HH:mm")} · {dayjs(ev.end).format("HH:mm")}
                  </Text>
                </View>
                <View style={styles.agendaRight}>
                  <Text style={styles.badgeLight}>Detalles</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Próximos eventos */}
        <View className="sectionCard" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos eventos</Text>
          </View>

          {nextThreeEvents.length === 0 ? (
            <EmptyState
              icon="⏳"
              title="Sin próximos eventos"
              text="Cuando tengas eventos futuros aparecerán aquí."
            />
          ) : (
            nextThreeEvents.map((ev) => {
              const d = dayjs(ev.start);
              const daysDiff = d.startOf("day").diff(dayjs().startOf("day"), "day");
              const whenLabel =
                daysDiff === 0 ? "Hoy" :
                daysDiff === 1 ? "Mañana" :
                `En ${daysDiff} días`;

              return (
                <View key={ev.id} style={[styles.reminderItem, styles.cardShadow]}>
                  {/* Fecha compacta a la izquierda */}
                  <View style={styles.reminderLeft}>
                    <Text style={styles.reminderDateNum}>{d.format("DD")}</Text>
                    <Text style={styles.reminderDateMon}>{d.format("MMM")}</Text>
                  </View>

                  {/* Título + meta */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reminderTitle}>
                      {ev.title}{" "}
                      {daysDiff <= 1 && (
                        <Text style={styles.badgeUrgent}>{whenLabel}</Text>
                      )}
                    </Text>
                    <Text style={styles.reminderMeta}>
                      ⏰ {d.format("HH:mm")} · {d.format("dddd, D [de] MMMM")}
                    </Text>
                  </View>

                  {/* Acción (opcional) */}
                  <View style={styles.reminderRight}>
                    <Text style={styles.reminderAction}>🗓️</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Tareas Pendientes */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
            <TouchableOpacity style={styles.addTaskBtn} onPress={openCreateTaskModal}>
              <Text style={styles.addTaskText}>+ Agregar tarea</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <EmptyState
              icon="✅"
              title="Todo al día"
              text="No tienes tareas pendientes."
            />
          ) : (
            tasks.map((t) => (
              <View key={t.id} style={[styles.taskItem, styles.cardShadow]}>
                <TouchableOpacity onPress={() => toggleTask(t.id)} style={[styles.checkbox, t.done && styles.checkboxOn]}>
                  {t.done ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </TouchableOpacity>

                <Text style={[styles.taskText, t.done && styles.taskTextDone]} numberOfLines={2}>
                  {t.title}
                </Text>

                <View style={styles.taskActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditTaskModal(t)}>
                    <Text style={styles.iconBtnText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => deleteTask(t.id)}>
                    <Text style={styles.iconBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Modal crear/editar TAREA */}
        <Modal transparent visible={taskModalOpen} animationType="fade" onRequestClose={() => setTaskModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{taskEditingId !== null ? "Editar tarea" : "Nueva tarea"}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Título de la tarea"
                placeholderTextColor="#888"
                value={taskTitle}
                onChangeText={setTaskTitle}
                autoFocus
              />
              <View style={styles.modalRightActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setTaskModalOpen(false)}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={saveTask}>
                  <Text style={styles.modalSaveText}>{taskEditingId !== null ? "Guardar" : "Crear"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Modal crear/editar EVENTO */}
      <Modal transparent visible={modalOpen} animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEditing ? "Editar evento" : "Nuevo evento"}</Text>
            <Text style={styles.modalSub}>{dayjs(newDate).locale("es").format("dddd, D [de] MMMM")}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.timeRow}>
              <TextInput
                style={[styles.modalInput, styles.timeInput]}
                placeholder="Inicio (HH:mm)"
                placeholderTextColor="#888"
                value={startTime}
                onChangeText={setStartTime}
              />
              <TextInput
                style={[styles.modalInput, styles.timeInput]}
                placeholder="Fin (HH:mm)"
                placeholderTextColor="#888"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>

            {!!errorMsg && <Text style={{ color: "#c00", fontSize: 12 }}>{errorMsg}</Text>}

            <View style={styles.modalActions}>
              {isEditing ? (
                <TouchableOpacity style={styles.modalDelete} onPress={deleteEvent}>
                  <Text style={styles.modalDeleteText}>Borrar</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              <View style={styles.modalRightActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setModalOpen(false)}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={saveEvent}>
                  <Text style={styles.modalSaveText}>{isEditing ? "Guardar cambios" : "Guardar"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

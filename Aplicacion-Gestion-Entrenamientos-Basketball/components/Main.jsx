import React, { useMemo, useState, useCallback, useRef} from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native";
import { Calendar } from "react-native-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { styles } from "./styles";

// Calendario: Combina fecha y hora en un objeto Date
function combineDateAndTime(baseDate, hhmm) {
  const d = dayjs(baseDate);
  const [h, m] = hhmm.split(":").map(Number);
  return d.hour(h).minute(m).second(0).millisecond(0).toDate();
}

export function Main() {
  // ----------- CALENDARIO -----------
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newDate, setNewDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:00");
  const [errorMsg, setErrorMsg] = useState("");

  const memoEvents = useMemo(() => events, [events]); // memoiza eventos 
  const lastMonthKeyRef = useRef(dayjs(currentDate).format("YYYY-MM"));  // clave mes visible

  // Flechas
  const goPrevMonth = () => setCurrentDate(dayjs(currentDate).subtract(1, "month").toDate());
  const goNextMonth = () => setCurrentDate(dayjs(currentDate).add(1, "month").toDate());
  
  // Cambio de rango/mes
  const handleRangeChange = useCallback((range) => {
    let start, end;
    if (Array.isArray(range) && range.length > 0) {
      const nums = range.map((d) => (d instanceof Date ? d.getTime() : new Date(d).getTime()));
      const minMs = Math.min(...nums);
      const maxMs = Math.max(...nums);
      start = dayjs(minMs);
      end = dayjs(maxMs);
    } else if (range && range.start && range.end) {
      start = dayjs(range.start);
      end = dayjs(range.end);
    } else {
      start = dayjs(currentDate).startOf("month");
      end = dayjs(currentDate).endOf("month");
    }

    const midDate = start.add(2, "week").toDate();
    const newMonthKey = dayjs(midDate).format("YYYY-MM");
    if (lastMonthKeyRef.current !== newMonthKey) {
      lastMonthKeyRef.current = newMonthKey;
      setCurrentDate(midDate); // <-- aquí sí usamos Date
    }
  }, [currentDate, setCurrentDate]);

  // Render de evento en vista mensual
  const renderMonthEvent = (event) => {
    const timeLabel = dayjs(event.start).format("HH:mm");
    return (
      <View style={styles.eventChip}>
        <Text numberOfLines={1} style={styles.eventText}>
          <Text style={styles.eventTime}>{timeLabel} </Text>
          {event.title}
        </Text>
      </View>
    );
  };

  // CREAR: abrir modal para un día
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

  // EDITAR: abrir modal con datos del evento
  const openEditModalFor = (event) => {
    setIsEditing(true);
    setEditingId(event.id);

    const start = dayjs(event.start);
    const end = dayjs(event.end);

    setNewDate(start.toDate());
    setTitle(event.title || "");
    setStartTime(start.format("HH:mm"));
    setEndTime(end.format("HH:mm"));
    setErrorMsg("");
    setModalOpen(true);
  };

  // GUARDAR (crear o editar) en memoria
  const saveEvent = () => {
    if (!title.trim()) return setErrorMsg("Pon un título");
    const start = combineDateAndTime(newDate, startTime);
    const end = combineDateAndTime(newDate, endTime);
    if (!dayjs(end).isAfter(start)) return setErrorMsg("Hora fin debe ser posterior al inicio");

    if (isEditing && editingId) {
      // editar existente
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingId
            ? { ...ev, title, start, end }
            : ev
        )
      );
    } else {
      // crear nuevo
      const nuevo = {
        id: String(Date.now()),
        title,
        start,
        end,
        bgColor: "#ff9531",
      };
      setEvents((prev) => [...prev, nuevo]);
    }

    setModalOpen(false);
  };

  // BORRAR
  const deleteEvent = () => {
    if (!isEditing || !editingId) return setModalOpen(false);
    // opcional: confirmación
    Alert.alert("Borrar evento", "¿Seguro que quieres borrar este evento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: () => {
          setEvents((prev) => prev.filter((ev) => ev.id !== editingId));
          setModalOpen(false);
        },
      },
    ]);
  };

  // ----------- ----------- -----------


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bloque de título + párrafo */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>Calendario de actividades</Text>
          <Text style={styles.infoParagraph}>
            Aquí verás entrenamientos, partidos y eventos del club. Toca un día para crear
            rápidamente un evento con título y horario. Puedes navegar de mes en mes con las flechas
            o deslizando el calendario.
          </Text>
        </View>

        {/* Espacio antes del calendario */}
        <View style={styles.bigSpacer} />

        {/* Cabecera con mes + flechas */}
        <View style={styles.topBar}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={goPrevMonth}>
              <Text style={styles.navBtnText}>〈</Text>
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {dayjs(currentDate).locale("es").format("MMMM [de] YYYY")}
            </Text>

            <TouchableOpacity style={styles.navBtn} onPress={goNextMonth}>
              <Text style={styles.navBtnText}>〉</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Calendario (queda más abajo; hay que hacer scroll para verlo completo) */}
        <View style={styles.calendarCard}>
          <Calendar
            events={events}
            height={styles.calendarCard.height}
            locale="es"
            weekStartsOn={1}
            mode="month"
            swipeEnabled
            date={currentDate}
            onChangeDate={handleRangeChange}
            onPressCell={(date) => openCreateModalFor(date)}
            onPressEvent={(event) => openEditModalFor(event)}
            renderEvent={renderMonthEvent}
            theme={{ palette: { primary: { main: "#ff9531", contrastText: "#fff" } } }}
            dateCellStyle={{ backgroundColor: "#fff" }}
            calendarCellStyle={{ backgroundColor: "#fff", borderColor: "#1f1f1f" }}
            headerContainerStyle={{ backgroundColor: "#fff", borderBottomWidth: 0 }}
            headerContentStyle={{ color: "#000" }}
          />
        </View>
      </ScrollView>

      {/* Modal crear/editar evento */}
      <Modal transparent visible={modalOpen} animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEditing ? "Editar evento" : "Nuevo evento"}</Text>
            <Text style={styles.modalSub}>
              {dayjs(newDate).locale("es").format("dddd, D [de] MMMM")}
            </Text>

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
              {/* Borrar a la izquierda cuando se edita */}
              {isEditing ? (
                <TouchableOpacity style={styles.modalDelete} onPress={deleteEvent}>
                  <Text style={styles.modalDeleteText}>Borrar</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              {/* A la derecha: Cancelar / Guardar */}
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


import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    roomNumber: "",
    block: "A",
    floor: 0,
    capacity: 4,
    monthlyFee: "",
  });

  const fetchRooms = useCallback(async () => {
    const response = await API.get("/rooms");
    setRooms(response.data);
  }, []);

  const fetchStudents = useCallback(async () => {
    const response = await API.get("/students");
    setStudents(response.data);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchRooms(), fetchStudents()]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load rooms or students. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchRooms, fetchStudents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const capacity = Number(form.capacity);
    const floor = Number(form.floor);
    const monthlyFee = Number(form.monthlyFee);

    if (!form.roomNumber.trim() || !form.block.trim()) {
      setError("Please enter the room number and hostel block.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 2 || capacity > 4) {
      setError("Room capacity must be between 2 and 4 students.");
      return;
    }

    if (!Number.isInteger(floor) || floor < 0) {
      setError("Floor must be a non-negative whole number.");
      return;
    }

    if (
      form.monthlyFee === "" ||
      !Number.isFinite(monthlyFee) ||
      monthlyFee < 0
    ) {
      setError("Please enter a valid monthly fee.");
      return;
    }

    try {
      setSaving(true);

      await API.post("/rooms", {
        roomNumber: form.roomNumber.trim(),
        block: form.block.trim(),
        floor,
        capacity,
        monthlyFee,
      });

      setForm({
        roomNumber: "",
        block: "A",
        floor: 0,
        capacity: 4,
        monthlyFee: "",
      });

      setMessage("Room created successfully.");
      await fetchRooms();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create room. Check the room details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAllocateStudent = async (roomId) => {
    const studentMongoId = selectedStudents[roomId];

    if (!studentMongoId) {
      setError("Please select a student before assigning.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");

    try {
      setSaving(true);

      await API.post(`/rooms/${roomId}/allocate`, {
        studentMongoId,
      });

      setSelectedStudents((previous) => ({
        ...previous,
        [roomId]: "",
      }));

      setMessage("Student assigned to the room successfully.");

      await Promise.all([fetchRooms(), fetchStudents()]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not assign the student to this room."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = async (roomId, studentMongoId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this student from the room?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setSaving(true);

      await API.delete(
        `/rooms/${roomId}/students/${studentMongoId}`
      );

      setMessage("Student removed from the room successfully.");

      await Promise.all([fetchRooms(), fetchStudents()]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not remove the student from this room."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (room.students?.length > 0) {
      setError("Remove all students before deleting this room.");
      setMessage("");
      return;
    }

    const confirmed = window.confirm(
      `Delete Room ${room.roomNumber} in Block ${room.block}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setSaving(true);

      await API.delete(`/rooms/${room._id}`);

      setMessage("Room deleted successfully.");
      await fetchRooms();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete this room."
      );
    } finally {
      setSaving(false);
    }
  };

  const assignedStudentIds = new Set(
    rooms.flatMap((room) =>
      (room.students || []).map((student) =>
        typeof student === "string" ? student : student._id
      )
    )
  );

  const availableStudents = students.filter(
    (student) =>
      !assignedStudentIds.has(student._id) &&
      !student.roomNumber
  );

  const totalBeds = rooms.reduce(
    (total, room) => total + Number(room.capacity || 0),
    0
  );

  const occupiedBeds = rooms.reduce(
    (total, room) => total + (room.students?.length || 0),
    0
  );

  const availableBeds = totalBeds - occupiedBeds;

  if (loading) {
    return (
      <main className="rooms-page">
        <div className="rooms-loading">
          Loading room management...
        </div>
      </main>
    );
  }

  return (
    <main className="rooms-page">
      <header className="rooms-header">
        <div>
          <span className="rooms-eyebrow">ADMIN MANAGEMENT</span>
          <h1>Hostel Room Management</h1>
          <p>
            Create rooms, assign students, and track available beds.
          </p>
        </div>

        <Link className="rooms-back" to="/students">
          ← Back to Students
        </Link>
      </header>

      {message && (
        <div className="rooms-alert rooms-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="rooms-alert rooms-error" role="alert">
          {error}
        </div>
      )}

      <section className="rooms-stats">
        <div className="rooms-stat-card">
          <span>Total Rooms</span>
          <strong>{rooms.length}</strong>
        </div>

        <div className="rooms-stat-card">
          <span>Occupied Beds</span>
          <strong>{occupiedBeds}</strong>
        </div>

        <div className="rooms-stat-card">
          <span>Available Beds</span>
          <strong>{availableBeds}</strong>
        </div>
      </section>

      <section className="rooms-panel">
        <div className="rooms-panel-heading">
          <div>
            <h2>Create a Room</h2>
            <p>Add a new room to the hostel.</p>
          </div>
        </div>

        <form className="rooms-form" onSubmit={handleCreateRoom}>
          <div className="rooms-field">
            <label htmlFor="roomNumber">Room Number</label>
            <input
              id="roomNumber"
              name="roomNumber"
              value={form.roomNumber}
              onChange={handleFormChange}
              placeholder="e.g. 101"
              required
            />
          </div>

          <div className="rooms-field">
            <label htmlFor="block">Hostel Block</label>
            <input
              id="block"
              name="block"
              value={form.block}
              onChange={handleFormChange}
              placeholder="e.g. A"
              required
            />
          </div>

          <div className="rooms-field">
            <label htmlFor="floor">Floor Number</label>
            <input
              id="floor"
              name="floor"
              type="number"
              min="0"
              step="1"
              value={form.floor}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="rooms-field">
            <label htmlFor="capacity">Room Capacity</label>
            <select
              id="capacity"
              name="capacity"
              value={form.capacity}
              onChange={handleFormChange}
            >
              <option value={2}>2 Students</option>
              <option value={3}>3 Students</option>
              <option value={4}>4 Students</option>
            </select>
          </div>

          <div className="rooms-field">
            <label htmlFor="monthlyFee">Monthly Fee (₹)</label>
            <input
              id="monthlyFee"
              name="monthlyFee"
              type="number"
              min="0"
              step="0.01"
              value={form.monthlyFee}
              onChange={handleFormChange}
              placeholder="e.g. 5000"
              required
            />
          </div>

          <button
            className="rooms-button rooms-primary-button"
            disabled={saving}
            type="submit"
          >
            {saving ? "Please wait..." : "+ Create Room"}
          </button>
        </form>
      </section>

      <section className="rooms-list-section">
        <div className="rooms-list-heading">
          <div>
            <h2>Rooms and Student Allocation</h2>
            <p>Manage room occupancy and student assignments.</p>
          </div>

          <span className="rooms-count">{rooms.length} Rooms</span>
        </div>

        {rooms.length === 0 ? (
          <div className="rooms-empty">
            <span>🏠</span>
            <h3>No Rooms Created Yet</h3>
            <p>
              Use the form above to create your first hostel room.
            </p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => {
              const roomStudents = room.students || [];
              const occupied = roomStudents.length;
              const capacity = Number(room.capacity);
              const isFull = occupied >= capacity;

              const percentage =
                capacity > 0
                  ? Math.min(100, (occupied / capacity) * 100)
                  : 0;

              return (
                <article className="room-card" key={room._id}>
                  <div className="room-card-top">
                    <div>
                      <span className="room-card-label">
                        HOSTEL ROOM
                      </span>
                      <h3>Room {room.roomNumber}</h3>
                      <p>
                        Block {room.block} · Floor {room.floor}
                      </p>
                    </div>

                    <span
                      className={`room-status ${
                        isFull ? "room-full" : "room-available"
                      }`}
                    >
                      {isFull ? "Full" : "Available"}
                    </span>
                  </div>

                  <div className="room-information">
                    <div>
                      <span>Occupancy</span>
                      <strong>
                        {occupied} / {capacity}
                      </strong>
                    </div>

                    <div>
                      <span>Monthly Fee</span>
                      <strong>
                        ₹
                        {Number(room.monthlyFee || 0).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="room-progress">
                    <div style={{ width: `${percentage}%` }} />
                  </div>

                  <div className="room-assign">
                    <select
                      aria-label={`Select student for room ${room.roomNumber}`}
                      value={selectedStudents[room._id] || ""}
                      onChange={(e) =>
                        setSelectedStudents((previous) => ({
                          ...previous,
                          [room._id]: e.target.value,
                        }))
                      }
                      disabled={
                        saving ||
                        isFull ||
                        availableStudents.length === 0
                      }
                    >
                      <option value="">Select a student</option>

                      {availableStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.studentId})
                        </option>
                      ))}
                    </select>

                    <button
                      className="rooms-button rooms-primary-button"
                      type="button"
                      disabled={
                        saving ||
                        isFull ||
                        !selectedStudents[room._id]
                      }
                      onClick={() => handleAllocateStudent(room._id)}
                    >
                      {saving ? "Please wait..." : "Assign Student"}
                    </button>
                  </div>

                  {availableStudents.length === 0 && !isFull && (
                    <p className="rooms-no-students">
                      No unassigned students available. Add a student or
                      clear their manually entered room number in Edit
                      Student.
                    </p>
                  )}

                  <div className="room-students">
                    <h4>Assigned Students ({occupied})</h4>

                    {roomStudents.length === 0 ? (
                      <p className="room-no-assigned">
                        No students assigned to this room yet.
                      </p>
                    ) : (
                      roomStudents.map((student) => (
                        <div
                          className="room-student"
                          key={student._id}
                        >
                          <div className="room-student-details">
                            <strong>
                              {student.name || "Student"}
                            </strong>
                            <small>
                              ID: {student.studentId || "N/A"}
                              {student.department
                                ? ` · ${student.department}`
                                : ""}
                            </small>
                          </div>

                          <button
                            className="rooms-button rooms-danger-button"
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              handleRemoveStudent(room._id, student._id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    className="rooms-button rooms-danger-button room-delete"
                    type="button"
                    disabled={saving || occupied > 0}
                    onClick={() => handleDeleteRoom(room)}
                  >
                    Delete Empty Room
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Rooms;

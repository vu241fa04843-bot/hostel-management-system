
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

    if (form.monthlyFee === "" || !Number.isFinite(monthlyFee) || monthlyFee < 0) {
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

  // Students already assigned through the Room Management module.
  const assignedStudentIds = new Set(
    rooms.flatMap((room) =>
      (room.students || []).map((student) =>
        typeof student === "string" ? student : student._id
      )
    )
  );

  // Exclude students who have a manually entered room number.
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
        <p>Loading room management...</p>
      </main>
    );
  }

  return (
    <main className="rooms-page">
      <style>{`
        .rooms-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 20px 50px;
          color: #172033;
          font-family: Arial, sans-serif;
        }
        .rooms-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .rooms-header h1 {
          margin: 0 0 8px;
          font-size: 30px;
        }
        .rooms-header p { margin: 0; color: #64748b; }
        .rooms-back {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
        }
        .rooms-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 26px;
        }
        .rooms-stat, .rooms-panel, .room-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 3px 12px rgba(15, 23, 42, .04);
        }
        .rooms-stat span {
          color: #64748b;
          font-size: 14px;
        }
        .rooms-stat strong {
          display: block;
          font-size: 28px;
          margin-top: 8px;
        }
        .rooms-panel { margin-bottom: 26px; }
        .rooms-panel h2, .room-card h2 {
          margin-top: 0;
        }
        .rooms-form {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .rooms-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .rooms-field label {
          font-size: 14px;
          font-weight: 600;
        }
        .rooms-field input, .rooms-field select,
        .room-assign select {
          box-sizing: border-box;
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
          font-size: 14px;
        }
        .rooms-button {
          border: 0;
          border-radius: 8px;
          padding: 11px 15px;
          font-weight: 600;
          cursor: pointer;
          background: #2563eb;
          color: white;
        }
        .rooms-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .rooms-button.secondary { background: #475569; }
        .rooms-button.danger { background: #dc2626; }
        .rooms-form .rooms-button { align-self: end; }
        .rooms-alert {
          padding: 12px 15px;
          border-radius: 9px;
          margin-bottom: 18px;
        }
        .rooms-alert.success {
          color: #166534;
          background: #dcfce7;
        }
        .rooms-alert.error {
          color: #991b1b;
          background: #fee2e2;
        }
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .room-card { min-width: 0; }
        .room-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .room-card h2 { margin-bottom: 7px; }
        .room-card p {
          margin: 7px 0;
          color: #64748b;
          font-size: 14px;
        }
        .room-status {
          padding: 6px 9px;
          border-radius: 20px;
          background: #dcfce7;
          color: #166534;
          font-size: 12px;
          white-space: nowrap;
        }
        .room-status.full {
          background: #fee2e2;
          color: #991b1b;
        }
        .room-progress {
          height: 8px;
          border-radius: 10px;
          overflow: hidden;
          background: #e2e8f0;
          margin: 13px 0;
        }
        .room-progress div {
          height: 100%;
          background: #2563eb;
        }
        .room-assign {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .room-assign select { flex: 1; min-width: 0; }
        .room-students {
          border-top: 1px solid #e2e8f0;
          margin-top: 18px;
          padding-top: 14px;
        }
        .room-students h3 { font-size: 16px; }
        .room-student {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .room-student:last-child { border-bottom: 0; }
        .room-student small {
          display: block;
          color: #64748b;
          margin-top: 4px;
        }
        .room-student .rooms-button {
          padding: 7px 10px;
          font-size: 12px;
        }
        .room-delete {
          margin-top: 16px;
          width: 100%;
        }
        .rooms-empty {
          padding: 30px;
          text-align: center;
          color: #64748b;
          background: #f8fafc;
          border-radius: 12px;
        }
        @media (max-width: 760px) {
          .rooms-stats, .rooms-grid, .rooms-form {
            grid-template-columns: 1fr;
          }
          .room-assign { flex-direction: column; }
        }
      `}</style>

      <header className="rooms-header">
        <div>
          <h1>Hostel Room Management</h1>
          <p>Create rooms, assign students, and track available beds.</p>
        </div>
        <Link className="rooms-back" to="/students">
          ← Back to Students
        </Link>
      </header>

      {message && (
        <div className="rooms-alert success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="rooms-alert error" role="alert">
          {error}
        </div>
      )}

      <section className="rooms-stats">
        <div className="rooms-stat">
          <span>Total Rooms</span>
          <strong>{rooms.length}</strong>
        </div>
        <div className="rooms-stat">
          <span>Occupied Beds</span>
          <strong>{occupiedBeds}</strong>
        </div>
        <div className="rooms-stat">
          <span>Available Beds</span>
          <strong>{availableBeds}</strong>
        </div>
      </section>

      <section className="rooms-panel">
        <h2>Create a Room</h2>
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

          <button className="rooms-button" disabled={saving} type="submit">
            {saving ? "Please wait..." : "+ Create Room"}
          </button>
        </form>
      </section>

      <section>
        <h2>Rooms and Student Allocation</h2>

        {rooms.length === 0 ? (
          <div className="rooms-empty">
            No rooms created yet. Use the form above to create your first room.
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => {
              const roomStudents = room.students || [];
              const occupied = roomStudents.length;
              const capacity = Number(room.capacity);
              const isFull = occupied >= capacity;
              const percentage =
                capacity > 0 ? Math.min(100, (occupied / capacity) * 100) : 0;

              return (
                <article className="room-card" key={room._id}>
                  <div className="room-card-top">
                    <div>
                      <h2>Room {room.roomNumber}</h2>
                      <p>Block {room.block} · Floor {room.floor}</p>
                    </div>
                    <span className={`room-status ${isFull ? "full" : ""}`}>
                      {isFull ? "Full" : "Available"}
                    </span>
                  </div>

                  <p>
                    <strong>Capacity:</strong> {occupied} / {capacity} students
                  </p>
                  <p>
                    <strong>Monthly Fee:</strong>{" "}
                    ₹{Number(room.monthlyFee || 0).toLocaleString("en-IN")}
                  </p>

                  <div
                    className="room-progress"
                    aria-label={`${occupied} of ${capacity} beds occupied`}
                  >
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
                      disabled={saving || isFull || availableStudents.length === 0}
                    >
                      <option value="">Select a student</option>
                      {availableStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.studentId})
                        </option>
                      ))}
                    </select>

                    <button
                      className="rooms-button"
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
                    <p>
                      No unassigned students available. Add a student or clear
                      their manually entered room number in Edit Student.
                    </p>
                  )}

                  <div className="room-students">
                    <h3>Assigned Students ({occupied})</h3>

                    {roomStudents.length === 0 ? (
                      <p>No students assigned to this room yet.</p>
                    ) : (
                      roomStudents.map((student) => (
                        <div
                          className="room-student"
                          key={student._id}
                        >
                          <div>
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
                            className="rooms-button danger"
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
                    className="rooms-button danger room-delete"
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
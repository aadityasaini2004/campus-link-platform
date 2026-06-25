import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building,
  Settings,
  LogOut,
  AlertCircle,
  CheckCircle2,
  X,
  UserPlus,
  Mail,
  User,
} from "lucide-react";

const AODashboard = () => {
  const navigate = useNavigate();

  // --- States ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null); // For Ticket Details Modal

  // --- Add Staff Modal States ---
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "" });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState({ type: "", text: "" });

  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(""); // 🔥 NAYA: For Assigning Ticket

  const userName = localStorage.getItem("userName") || "AO Admin";
  const initial = userName.charAt(0).toUpperCase();

  // --- Security Check ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "AO") {
      navigate("/login");
    }
  }, [navigate]);

  // --- Fetch Tickets & Staff List ---
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Tickets
        const { data: ticketsData } = await axios.get(
          "http://localhost:5000/api/tickets/all",
          config
        );
        setTickets(ticketsData);

        // 2. Fetch Staff List for Dropdown
        const { data: staffData } = await axios.get(
          "http://localhost:5000/api/ao/staff-list",
          config
        );
        setStaffList(staffData);
      } catch (error) {
        console.error("Error fetching live data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- Handle Add Staff Submit ---
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/ao/add-staff",
        staffForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStaffMessage({ type: "success", text: data.message });
      setStaffForm({ name: "", email: "" }); // Clear form

      // Refresh Staff List automatically
      const { data: updatedStaff } = await axios.get(
        "http://localhost:5000/api/ao/staff-list",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStaffList(updatedStaff);

      // Close modal after 2 seconds automatically
      setTimeout(() => {
        setIsStaffModalOpen(false);
        setStaffMessage({ type: "", text: "" });
      }, 2000);
    } catch (error) {
      setStaffMessage({
        type: "error",
        text: error.response?.data?.message || "Error adding staff",
      });
    } finally {
      setStaffLoading(false);
    }
  };

  // --- 🔥 NAYA: Handle Assign Ticket ---
  const handleAssignTicket = async () => {
    if (!selectedStaffId) {
      alert("Please select staff first!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/tickets/${selectedTicket._id}/assign`,
        { staffId: selectedStaffId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Modal band karo aur ID reset karo
      setSelectedTicket(null);
      setSelectedStaffId("");

      // Table ko refresh karne ke liye wapas data mangwa lo
      const { data: updatedTickets } = await axios.get(
        "http://localhost:5000/api/tickets/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(updatedTickets);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      alert("Error while assigning ticket. Please try again latter!");
    }
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "Open").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col z-10">
        <div className="p-6 text-2xl font-bold text-emerald-400 tracking-wide">
          Campus Link
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-emerald-400"
          >
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-gray-300 transition"
          >
            <Ticket size={20} /> All Tickets
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-gray-300 transition"
          >
            <Building size={20} /> Departments
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-gray-300 transition"
          >
            <Users size={20} /> Staff Directory
          </a>
        </nav>
        <div className="p-4 border-t border-slate-700 m-4 rounded-lg bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold truncate w-24">
                {userName}
              </p>
              <p className="text-xs text-emerald-400">AO Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition"
          >
            <UserPlus size={18} /> Create Staff
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Tickets</p>
              <p className="text-2xl font-bold text-slate-800">
                {loading ? "..." : totalTickets}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Open / Action Needed
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {loading ? "..." : openTickets}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-slate-800">
                {loading ? "..." : resolvedTickets}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT TICKETS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-slate-800">
              Live Incoming Tickets
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Issue / Description</th>
                  <th className="px-6 py-4 font-medium">Raised By</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      Loading live data...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {ticket.issueType}
                        </p>
                        <p className="text-sm text-gray-500 truncate w-48">
                          {ticket.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {ticket.raisedBy?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.raisedBy?.role || "User"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {ticket.location}
                      </td>
                      <td className="px-6 py-4">
                        {ticket.isHighPriority ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            High
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === "Open"
                              ? "bg-amber-100 text-amber-700"
                              : ticket.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                        >
                          Assign Staff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* =========================================================
          🔥 ADD STAFF MODAL
      ========================================================= */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-600" /> Create New
                Staff
              </h2>
              <button
                onClick={() => {
                  setIsStaffModalOpen(false);
                  setStaffMessage({ type: "", text: "" });
                }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {staffMessage.text && (
                <div
                  className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm border ${
                    staffMessage.type === "error"
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  }`}
                >
                  {staffMessage.type === "error" ? (
                    <AlertCircle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <p>{staffMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={staffForm.name}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, name: e.target.value })
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Email ID
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      placeholder="staff@krmangalam.edu.in"
                      value={staffForm.email}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, email: e.target.value })
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Default password for new staff will
                    be set to{" "}
                    <code className="bg-white px-1 py-0.5 rounded text-blue-600 font-bold">
                      StaffPassword123!
                    </code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg mt-4 transition-all disabled:opacity-50"
                >
                  {staffLoading
                    ? "Creating Profile..."
                    : "Confirm & Create Staff"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          🔥 TICKET DETAILS MODAL
      ========================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Ticket Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {selectedTicket._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedTicket.raisedBy?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {selectedTicket.raisedBy?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedTicket.raisedBy?.email || "No email provided"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-200 text-blue-800 text-[10px] font-bold uppercase rounded">
                    {selectedTicket.raisedBy?.role || "Student"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Category
                  </p>
                  <p className="font-semibold text-slate-800">
                    {selectedTicket.issueType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Location
                  </p>
                  <p className="font-semibold text-slate-800">
                    {selectedTicket.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedTicket.status === "Open"
                        ? "bg-amber-100 text-amber-700"
                        : selectedTicket.status === "Resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Priority
                  </p>
                  {selectedTicket.isHighPriority ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      Urgent
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      Normal
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">
                  Detailed Description
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-slate-700 text-sm whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>
            </div>
            
            {/* 🔥 FIXED: Assign Ticket Action Area */}
            <div className="bg-gray-50 border-t border-gray-100 p-6 flex justify-between items-center">
              <div className="flex-1 mr-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Assign to Staff Member
                </label>
                <select 
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="">-- Select Staff --</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <button 
                  onClick={handleAssignTicket}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Assign Ticket
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default AODashboard;
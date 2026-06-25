import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckCircle2, AlertCircle, LogOut, Clock, Activity, X } from "lucide-react";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  const userName = localStorage.getItem("userName") || "Staff Member";
  const initial = userName.charAt(0).toUpperCase();

  // --- Security Check ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "DepartmentStaff") {
      navigate("/login");
    }
  }, [navigate]);

  // --- Fetch Assigned Tickets ---
  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/tickets/assigned", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- Update Status Inline ---
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/tickets/${ticketId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Instantly update the UI
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
      
      // If the modal is currently open and we change status, update the modal state too
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // KPI Calculations
  const totalAssigned = tickets.length;
  const pendingTasks = tickets.filter(t => t.status === "Assigned" || t.status === "Currently Working").length;
  const completedTasks = tickets.filter(t => t.status === "Resolved").length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col z-10">
        <div className="p-6 text-2xl font-bold text-emerald-400 tracking-wide">
          Campus Link
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-emerald-400">
            <LayoutDashboard size={20} /> My Tasks
          </a>
        </nav>
        <div className="p-4 border-t border-slate-700 m-4 rounded-lg bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold truncate w-24">{userName}</p>
              <p className="text-xs text-emerald-400">Department Staff</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Staff Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and resolve your assigned campus issues.</p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Activity size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Assigned</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "..." : totalAssigned}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "..." : pendingTasks}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tasks Resolved</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "..." : completedTasks}</p>
            </div>
          </div>
        </div>

        {/* ASSIGNED TASKS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-slate-800">My Action Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Issue Detail</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Raised By</th>
                  <th className="px-6 py-4 font-medium">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading your tasks...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">No tasks assigned to you right now. Great job!</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr 
                      key={ticket._id} 
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)} // Open Modal on row click
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800">{ticket.issueType}</p>
                          {ticket.isHighPriority && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Urgent</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate w-64">{ticket.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{ticket.location}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{ticket.raisedBy?.name || "Student"}</td>
                      
                      {/* 🔥 UPDATE STATUS DROPDOWN (Stop Propagation so it doesn't open the modal) */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          className={`text-sm font-semibold rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 cursor-pointer
                            ${ticket.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' : ''}
                            ${ticket.status === 'Currently Working' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' : ''}
                            ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500' : ''}
                          `}
                        >
                          <option value="Assigned">Assigned</option>
                          <option value="Currently Working">Working on it</option>
                          <option value="Resolved">Mark as Resolved</option>
                        </select>
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
          🔥 TICKET DETAILS MODAL (POP-UP)
      ========================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Ticket Details</h2>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedTicket._id}</p>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Requester Info */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedTicket.raisedBy?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedTicket.raisedBy?.name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-600">{selectedTicket.raisedBy?.email || 'No email provided'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-200 text-blue-800 text-[10px] font-bold uppercase rounded">
                    {selectedTicket.raisedBy?.role || 'Student'}
                  </span>
                </div>
              </div>

              {/* Issue Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Category</p>
                  <p className="font-semibold text-slate-800">{selectedTicket.issueType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Location</p>
                  <p className="font-semibold text-slate-800">{selectedTicket.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Current Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedTicket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                        selectedTicket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Priority</p>
                  {selectedTicket.isHighPriority ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Urgent</span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Normal</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">Detailed Description</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-slate-700 text-sm whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
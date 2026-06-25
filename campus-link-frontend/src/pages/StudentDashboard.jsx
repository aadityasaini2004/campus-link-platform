import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut, CheckCircle2, Clock, X } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedTicket, setSelectedTicket] = useState(null); // For viewing details
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For creating new ticket

  // New Ticket Form State
  const [formData, setFormData] = useState({
    issueType: "IT Support",
    location: "",
    description: "",
    isHighPriority: false
  });

  const userName = localStorage.getItem("userName") || "Student";
  const initial = userName.charAt(0).toUpperCase();

  // --- Security Check ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    // Faculty can also use this dashboard layout, so we allow both
    if (!token || (role !== "Student" && role !== "Faculty")) {
      navigate("/login");
    }
  }, [navigate]);

  // --- Fetch My Tickets ---
  const fetchMyTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/tickets/my-tickets", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- Submit New Ticket ---
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/tickets",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and close modal
      setFormData({ issueType: "IT Support", location: "", description: "", isHighPriority: false });
      setIsCreateModalOpen(false);
      
      // Refresh ticket list
      fetchMyTickets();
      alert("Ticket raised successfully!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to raise ticket.");
    }
  };

  const activeTickets = tickets.filter(t => t.status !== "Resolved").length;
  const resolvedTickets = tickets.filter(t => t.status === "Resolved").length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col z-10">
        <div className="p-6 text-2xl font-bold text-emerald-400 tracking-wide">
          Campus Link
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-emerald-400">
            <LayoutDashboard size={20} /> My Dashboard
          </a>
        </nav>
        <div className="p-4 border-t border-slate-700 m-4 rounded-lg bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold truncate w-24">{userName}</p>
              <p className="text-xs text-emerald-400">User</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome, {userName.split(' ')[0]}</h1>
            <p className="text-gray-500 mt-1">Track your campus issues or raise a new one.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition"
          >
            <PlusCircle size={18} /> Raise Ticket
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Issues</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "..." : activeTickets}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved Issues</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "..." : resolvedTickets}</p>
            </div>
          </div>
        </div>

        {/* MY TICKETS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-slate-800">My Ticket History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Issue Detail</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading your tickets...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">You haven't raised any tickets yet.</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr 
                      key={ticket._id} 
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)} // Open Detail Modal
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
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' : 
                          ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.status}
                        </span>
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
          🔥 NEW TICKET MODAL 
      ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Raise New Ticket
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                <select 
                  required
                  value={formData.issueType}
                  onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="IT Support">IT Support (Wi-Fi, Computers)</option>
                  <option value="Maintenance">Maintenance (Plumbing, AC, Electrical)</option>
                  <option value="Housekeeping">Housekeeping (Cleaning, Restrooms)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Room No.</label>
                <input 
                  type="text" required placeholder="e.g. A-Block Room 101"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required placeholder="Describe the issue in detail..." rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" id="highPriority"
                  checked={formData.isHighPriority}
                  onChange={(e) => setFormData({...formData, isHighPriority: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="highPriority" className="text-sm text-gray-700">Mark as High Priority (Urgent)</label>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg mt-4 transition-all">
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          🔥 TICKET DETAILS MODAL (POP-UP)
      ========================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Ticket Details</h2>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedTicket._id}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
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
                  <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
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

export default StudentDashboard;
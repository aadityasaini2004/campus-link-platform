import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, AlertCircle, CheckCircle2, LogOut, Send, Clock, Activity } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Student';

  // --- States ---
  const [formData, setFormData] = useState({
    issueType: 'IT Support',
    description: '',
    location: '',
    isHighPriority: false
  });

  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTickets, setFetchingTickets] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- Security & Initial Fetch ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'Student') {
      navigate('/login');
    } else {
      fetchMyTickets(); // Token sahi hai toh tickets fetch karo
    }
  }, [navigate]);

  // --- API Call: Get Tickets ---
  const fetchMyTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(data);
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setFetchingTickets(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- API Call: Submit Ticket ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tickets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Ticket raised successfully!' });
      
      // Form reset
      setFormData({
        issueType: 'IT Support',
        description: '',
        location: '',
        isHighPriority: false
      });

      // 💥 Magic: Table ko instantly update karne ke liye data wapas mangwa lo
      fetchMyTickets(); 

      // 3 second baad success message hata do
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to raise ticket' });
    } finally {
      setLoading(false);
    }
  };

  // Helper function for status badge colors
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Assigned': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Currently Working': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 pb-12">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ClipboardList className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Campus Link</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-slate-400">Welcome, <strong className="text-emerald-400">{userName}</strong></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        
        {/* ================= FORM SECTION ================= */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Raise a New Ticket</h2>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'}`}>
              {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select name="issueType" value={formData.issueType} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-200">
                <option value="IT Support">IT Support</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Hostel">Hostel & Mess</option>
                <option value="Academics">Academics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g., Block A, Room 304"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe your issue..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 resize-none"></textarea>
            </div>

            <div className="md:col-span-2 flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <input type="checkbox" name="isHighPriority" id="priority" checked={formData.isHighPriority} onChange={handleChange}
                  className="w-5 h-5 accent-emerald-500 rounded bg-slate-900 border-slate-700" />
                <label htmlFor="priority" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Mark as High Priority
                </label>
              </div>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                {loading ? 'Submitting...' : <><Send size={18} /> Submit</>}
              </button>
            </div>
          </form>
        </div>

        {/* ================= HISTORY TABLE SECTION ================= */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-emerald-400" /> My Complaints History
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-sm">
                  <th className="py-4 px-6 font-medium">Issue Detail</th>
                  <th className="py-4 px-6 font-medium">Location</th>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {fetchingTickets ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      <Activity className="animate-spin mx-auto mb-2" size={24} />
                      Loading your tickets...
                    </td>
                  </tr>
                ) : myTickets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      You haven't raised any tickets yet.
                    </td>
                  </tr>
                ) : (
                  myTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-200 flex items-center gap-2">
                          {ticket.issueType}
                          {ticket.isHighPriority && (
                            <span className="text-[10px] uppercase font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 mt-1 truncate max-w-xs" title={ticket.description}>
                          {ticket.description}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-300">{ticket.location}</td>
                      <td className="py-4 px-6 text-sm text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
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

      </div>
    </div>
  );
};

export default StudentDashboard;
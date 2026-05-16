import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TbMessageChatbot } from 'react-icons/tb';
import { Trash2, Edit2, Plus, X, Loader2 } from 'lucide-react';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import { toast } from '../MainSystemComponents/Toast';




export default function SuMessagebot() {
    const [qaPairs, setQaPairs] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuthHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('superAdminToken')}` }
    });

    const fetchQA = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:7000/api/chatbot', getAuthHeader());
            if (response.data.success) {
                setQaPairs(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching Q&A:", error);
            toast({ message: "Failed to load Q&A pairs.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQA();
    }, []);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [modalQ, setModalQ] = useState('');
    const [modalA, setModalA] = useState('');
    const [modalR, setModalR] = useState('all');

    const [viewingQA, setViewingQA] = useState(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleSaveQA = async () => {
        if (!modalQ.trim() || !modalA.trim()) return;

        try {
            const payload = {
                question: modalQ,
                answer: modalA,
                role: modalR
            };

            if (editingId) {
                const response = await axios.put(`http://localhost:7000/api/chatbot/${editingId}`, payload, getAuthHeader());
                if (response.data.success) {
                    toast({ message: "Q&A updated successfully.", type: "success" });
                    fetchQA();
                }
            } else {
                const response = await axios.post('http://localhost:7000/api/chatbot', payload, getAuthHeader());
                if (response.data.success) {
                    toast({ message: "New Q&A added successfully.", type: "success" });
                    fetchQA();
                }
            }
            closeModal();
        } catch (error) {
            console.error("Error saving Q&A:", error);
            toast({ message: "Error saving Q&A. Please try again.", type: "error" });
        }
    };


    const handleDeleteQA = (id) => {
        setDeletingId(id);
        setIsConfirmOpen(true);
    };

    const confirmDeleteQA = async () => {
        if (deletingId) {
            try {
                const response = await axios.delete(`http://localhost:7000/api/chatbot/${deletingId}`, getAuthHeader());
                if (response.data.success) {
                    toast({ message: "Q&A deleted successfully.", type: "success" });
                    fetchQA();
                }
            } catch (error) {
                console.error("Error deleting Q&A:", error);
                toast({ message: "Failed to delete Q&A.", type: "error" });
            }
            setDeletingId(null);
        }
        setIsConfirmOpen(false);
    };


    const openModal = (pair) => {
        if (pair) {
            setEditingId(pair._id);
            setModalQ(pair.question);
            setModalA(pair.answer);
            setModalR(pair.role);
        } else {
            setEditingId(null);
            setModalQ('');
            setModalA('');
            setModalR('all');
        }
        setIsModalOpen(true);
    };


    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                    <TbMessageChatbot className="text-emerald-500 w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">ChatBot Message</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Manage Chatbot Messages</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm h-[70vh] flex flex-col relative">
                <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Question and Answers</h3>
                            <p className="text-xs text-slate-500">Manage questions and automated responses.</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 transition-colors"
                        >
                            <Plus size={16} /> Add New Q&A
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6 relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : qaPairs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                                <TbMessageChatbot size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">No Q&A pairs found</p>
                                <p className="text-xs">Add your first chatbot response to get started.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest rounded-tl-xl rounded-bl-xl">Question</th>
                                        <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Answer</th>
                                        <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                                        <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest text-right rounded-tr-xl rounded-br-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {qaPairs.map(qa => (
                                        <tr
                                            key={qa._id}
                                            onClick={() => setViewingQA(qa)}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 w-1/3 lowercase">{qa.question}</td>
                                            <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{qa.answer}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${qa.role === 'all' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                                                    qa.role === 'student' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                                                        qa.role === 'teacher' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' :
                                                            'bg-orange-50 text-orange-600 dark:bg-orange-900/30'
                                                    }`}>
                                                    {qa.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openModal(qa); }}
                                                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteQA(qa._id); }}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>


                </div>
            </div>

            {/* Modal Overlay via Portal */}
            <PortalPopup isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{editingId ? 'Edit Q&A' : 'Add New Q&A'}</h3>
                        <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question</label>
                            <input
                                type="text"
                                value={modalQ}
                                onChange={e => setModalQ(e.target.value)}
                                placeholder="e.g. How do I view my grades?"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Answer</label>
                            <textarea
                                value={modalA}
                                onChange={e => setModalA(e.target.value)}
                                placeholder="Type the bot's response here..."
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base h-40 resize-none focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">For Which User</label>
                            <select
                                value={modalR}
                                onChange={e => setModalR(e.target.value)}
                                className="w-full pl-5 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={closeModal}
                            className="flex-1 py-4 text-base font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveQA}
                            disabled={!modalQ.trim() || !modalA.trim()}
                            className="flex-1 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                        >
                            Save Q&A
                        </button>
                    </div>
                </div>
            </PortalPopup>

            {/* View Details Modal */}
            <PortalPopup isOpen={viewingQA !== null} onClose={() => setViewingQA(null)}>
                {viewingQA && (
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                                    <TbMessageChatbot className="text-emerald-500 w-6 h-6" />
                                </div>
                                Q&A Details
                            </h3>
                            <button
                                onClick={() => setViewingQA(null)}
                                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close details"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question</label>
                                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                        {viewingQA.question}
                                    </p>
                                </div>
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Answer</label>
                                <div className="px-5 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {viewingQA.answer}
                                    </p>
                                </div>
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">User</label>
                                <span className={`inline-flex px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${viewingQA.role === 'all' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                                    viewingQA.role === 'student' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                                        viewingQA.role === 'teacher' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' :
                                            'bg-orange-50 text-orange-600 dark:bg-orange-900/30'
                                    }`}>
                                    {viewingQA.role}
                                </span>
                            </div>

                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setViewingQA(null)}
                                className="px-8 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </PortalPopup>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDeleteQA}
                title="Delete Q&A"
                message="Are you sure you want to delete this Q&A? This action cannot be undone."
            />
        </div>
    );
}
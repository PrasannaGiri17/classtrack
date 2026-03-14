import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Send,
    User,
    MoreVertical,
    CheckCheck,
    Clock,
    Users,
    ShieldCheck,
    GraduationCap,
    MessageSquare,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../MainSystemComponents/toast/toast';
import ConfirmDialog from '../components/UI/ConfirmDialog';

// Static Data
const STATIC_USERS = [
    { uid: 'admin1', name: 'Principal Skinner', email: 'admin@school.com', role: 'admin', photoURL: 'https://picsum.photos/seed/admin1/200/200' },
    { uid: 't1', name: 'Mr. Smith', email: 'smith@school.com', role: 'teacher', classIds: ['1-A'], photoURL: 'https://picsum.photos/seed/t1/200/200' },
    { uid: 't2', name: 'Ms. Johnson', email: 'johnson@school.com', role: 'teacher', classIds: ['1-A', '2-B'], photoURL: 'https://picsum.photos/seed/t2/200/200' },
    { uid: 's1', name: 'Bart Simpson', email: 'bart@school.com', role: 'student', classId: '1-A', photoURL: 'https://picsum.photos/seed/s1/200/200' },
    { uid: 's2', name: 'Lisa Simpson', email: 'lisa@school.com', role: 'student', classId: '1-A', photoURL: 'https://picsum.photos/seed/s2/200/200' },
    { uid: 's3', name: 'Milhouse Van Houten', email: 'milhouse@school.com', role: 'student', classId: '2-B', photoURL: 'https://picsum.photos/seed/s3/200/200' },
    { uid: 's4', name: 'Nelson Muntz', email: 'nelson@school.com', role: 'student', classId: '2-B', photoURL: 'https://picsum.photos/seed/s4/200/200' },
];

const INITIAL_MESSAGES = [
    {
        id: 'm1',
        senderId: 't1',
        receiverId: 'admin1',
        text: 'Hello Principal, I have a question about the upcoming field trip.',
        timestamp: new Date(Date.now() - 3600000 * 2),
        read: true,
        conversationId: 'admin1_t1'
    },
    {
        id: 'm2',
        senderId: 'admin1',
        receiverId: 't1',
        text: 'Sure Mr. Smith, what is it?',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        conversationId: 'admin1_t1'
    }
];

const MessagesPage = () => {
    // Current user is hardcoded as Admin
    const [currentUser] = useState(STATIC_USERS[0]);
    const [contacts, setContacts] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showReportConfirm, setShowReportConfirm] = useState(false);
    const [blockedUserIds, setBlockedUserIds] = useState([]);

    const messagesEndRef = useRef(null);
    const moreMenuRef = useRef(null);

    // Handle click outside more menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize Contacts
    useEffect(() => {
        const otherUsers = STATIC_USERS.filter(u => u.uid !== currentUser.uid);
        setContacts(otherUsers);
    }, [currentUser]);

    // Update Conversations List
    useEffect(() => {
        const convos = contacts.map(contact => {
            const conversationId = [currentUser.uid, contact.uid].sort().join('_');
            const relevantMsgs = messages.filter(m => m.conversationId === conversationId);
            const lastMessage = relevantMsgs.length > 0 ? relevantMsgs[relevantMsgs.length - 1] : undefined;
            const unreadCount = relevantMsgs.filter(m => m.receiverId === currentUser.uid && !m.read).length;

            return {
                otherUser: contact,
                lastMessage,
                unreadCount
            };
        });

        // Sort by last message timestamp
        convos.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp.getTime() || 0;
            const timeB = b.lastMessage?.timestamp.getTime() || 0;
            return timeB - timeA;
        });

        setConversations(convos);
    }, [currentUser, contacts, messages]);

    // Mark as read when selecting user
    useEffect(() => {
        if (selectedUser) {
            setMessages(prev => prev.map(m => {
                if (m.senderId === selectedUser.uid && m.receiverId === currentUser.uid && !m.read) {
                    return { ...m, read: true };
                }
                return m;
            }));
        }
    }, [selectedUser, currentUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUser]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!selectedUser || !newMessage.trim()) return;

        const conversationId = [currentUser.uid, selectedUser.uid].sort().join('_');
        const msg = {
            id: `m-${Date.now()}`,
            senderId: currentUser.uid,
            receiverId: selectedUser.uid,
            text: newMessage,
            timestamp: new Date(),
            read: false,
            conversationId
        };

        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    const handleClearAll = () => {
        setShowClearConfirm(true);
        setShowMoreMenu(false);
    };

    const confirmClearAll = () => {
        if (!selectedUser) return;
        const conversationId = [currentUser.uid, selectedUser.uid].sort().join('_');
        setMessages(prev => prev.filter(m => m.conversationId !== conversationId));
        setShowClearConfirm(false);
        toast({
            type: 'success',
            message: 'Conversation cleared successfully'
        });
    };

    const handleReport = () => {
        setShowReportConfirm(true);
        setShowMoreMenu(false);
    };

    const confirmReport = () => {
        if (!selectedUser) return;
        // In a real app, this would send a report to the backend
        setBlockedUserIds(prev => [...prev, selectedUser.uid]);
        setShowReportConfirm(false);
        toast({
            type: 'info',
            message: `Report submitted for ${selectedUser.name}. User has been blocked.`
        });
    };

    const handleUnblock = () => {
        if (!selectedUser) return;
        setBlockedUserIds(prev => prev.filter(id => id !== selectedUser.uid));
        setShowMoreMenu(false);
        toast({
            type: 'success',
            message: `${selectedUser.name} has been unblocked.`
        });
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'admin' && c.otherUser.role === 'admin') ||
            (activeTab === 'teachers' && c.otherUser.role === 'teacher') ||
            (activeTab === 'classmates' && c.otherUser.role === 'student');
        return matchesSearch && matchesTab;
    });

    const isSelectedUserBlocked = selectedUser ? blockedUserIds.includes(selectedUser.uid) : false;

    const selectedMessages = selectedUser
        ? messages.filter(m => m.conversationId === [currentUser.uid, selectedUser.uid].sort().join('_'))
        : [];

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={confirmClearAll}
                title="Clear Conversation"
                message={`Are you sure you want to clear all messages with ${selectedUser?.name}? This action cannot be undone.`}
            />

            <ConfirmDialog
                isOpen={showReportConfirm}
                onClose={() => setShowReportConfirm(false)}
                onConfirm={confirmReport}
                title="Report Conversation"
                message={`Are you sure you want to report this conversation with ${selectedUser?.name}? Our moderation team will review the chat history.`}
            />

            {/* Sidebar: Conversation List */}
            <div className="w-[350px] border-r border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl pl-10 pr-4 text-sm font-medium text-slate-600 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto scrollbar-hide border-b border-slate-50 dark:border-slate-800">
                    {(['all', 'admin', 'teachers', 'classmates']).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map((convo) => (
                            <button
                                key={convo.otherUser.uid}
                                onClick={() => setSelectedUser(convo.otherUser)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left mb-1 group ${selectedUser?.uid === convo.otherUser.uid
                                        ? 'bg-emerald-50 dark:bg-emerald-900/10'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
                                        {convo.otherUser.photoURL ? (
                                            <img src={convo.otherUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <User className="text-emerald-600" size={20} />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className="flex items-center gap-2 truncate">
                                            <p className={`text-sm font-bold truncate ${selectedUser?.uid === convo.otherUser.uid ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {convo.otherUser.name}
                                            </p>
                                            {blockedUserIds.includes(convo.otherUser.uid) && (
                                                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[8px] font-black uppercase rounded-md">Blocked</span>
                                            )}
                                        </div>
                                        {convo.lastMessage && (
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {format(convo.lastMessage.timestamp, 'HH:mm')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-400 truncate flex-1">
                                            {convo.lastMessage ? convo.lastMessage.text : `Start a conversation with ${convo.otherUser.role}`}
                                        </p>
                                        {convo.unreadCount > 0 && (
                                            <span className="ml-2 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 p-8 text-center">
                            <Users size={48} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">No contacts found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/30 transition-colors">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-[80px] px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden">
                                    {selectedUser.photoURL ? (
                                        <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <User className="text-emerald-600" size={18} />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedUser.name}</h3>
                                        {isSelectedUserBlocked && (
                                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-lg">Blocked</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {selectedUser.role} {selectedUser.classId ? `• ${selectedUser.classId}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${showMoreMenu
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none'
                                            : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600'
                                        }`}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                <AnimatePresence>
                                    {showMoreMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-2">
                                                <button
                                                    onClick={handleClearAll}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                    Clear All
                                                </button>
                                                {isSelectedUserBlocked ? (
                                                    <button
                                                        onClick={handleUnblock}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 transition-all"
                                                    >
                                                        <ShieldCheck size={16} />
                                                        Unblock User
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleReport}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-600 transition-all"
                                                    >
                                                        <AlertTriangle size={16} />
                                                        Report & Block
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                            <AnimatePresence initial={false}>
                                {selectedMessages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser.uid;
                                    const showDate = idx === 0 || format(selectedMessages[idx - 1].timestamp, 'yyyy-MM-dd') !== format(msg.timestamp, 'yyyy-MM-dd');

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {showDate && (
                                                <div className="flex justify-center my-8">
                                                    <span className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm border border-slate-50 dark:border-slate-700">
                                                        {format(msg.timestamp, 'MMMM d, yyyy')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${isMe
                                                            ? 'bg-emerald-500 text-white rounded-tr-none'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-50 dark:border-slate-700'
                                                        }`}>
                                                        {msg.text}
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[10px] font-medium text-slate-400">
                                                            {format(msg.timestamp, 'HH:mm')}
                                                        </span>
                                                        {isMe && (
                                                            msg.read ? <CheckCheck size={12} className="text-emerald-500" /> : <Clock size={10} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
                            {isSelectedUserBlocked ? (
                                <div className="flex flex-col items-center justify-center py-2 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">You have blocked this user</p>
                                    <button
                                        onClick={handleUnblock}
                                        className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-all"
                                    >
                                        Unblock to send messages
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                    <div className="flex-1 relative group">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl px-6 text-sm font-medium text-slate-600 dark:text-slate-200 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300/30 transition-all outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                            <MessageSquare size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select a conversation</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                                Choose a contact from the left to start messaging.
                                Admins can message everyone, while teachers and students have role-based permissions.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <Clock size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <GraduationCap size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
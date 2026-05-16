import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
    AlertTriangle,
    Reply,
    X,
    Image as ImageIcon,
    Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { toast } from '../MainSystemComponents/Toast';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import Loading from '../MainSystemComponents/Loading';

import messageService from '../Api/messageService';
import { TbMessageChatbot } from "react-icons/tb";

const BOT_USER = {
    uid: 'bot',
    name: 'ClassTrack Assistant',
    role: 'ChatBot',
    isBot: true
};




const MessagesPage = () => {
    const location = useLocation();

    // Get current user from localStorage (synced with backend auth)
    const [currentUser] = useState(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        return {
            uid: user?.userId || user?.id || user?._id,
            name: user?.name,
            role: user?.role,
            photoURL: user?.profilePhoto,
            ...user
        };
    });

    const [contacts, setContacts] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [botQA, setBotQA] = useState([]);
    const [botQuickReplies, setBotQuickReplies] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [activeTab, setActiveTab] = useState('all');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showReportConfirm, setShowReportConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [blockedUserIds, setBlockedUserIds] = useState([]);
    const [replyTo, setReplyTo] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [clearedTimestamps, setClearedTimestamps] = useState(() => {
        const saved = localStorage.getItem(`cleared_convos_${currentUser.uid}`);
        return saved ? JSON.parse(saved) : {};
    });
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [botMessages, setBotMessages] = useState([
        { id: 'bot-initial', text: "Hello! I am your ClassTrack Assistant. How can I help you today?", senderId: 'bot', timestamp: new Date() }
    ]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const tabsRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - tabsRef.current.offsetLeft);
        setScrollLeft(tabsRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - tabsRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        tabsRef.current.scrollLeft = scrollLeft - walk;
    };
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const moreMenuRef = useRef(null);

    // Update localStorage when cleared timestamps change
    useEffect(() => {
        if (currentUser.uid) {
            localStorage.setItem(`cleared_convos_${currentUser.uid}`, JSON.stringify(clearedTimestamps));
        }
    }, [clearedTimestamps, currentUser.uid]);

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

    // Initialize Contacts from Backend
    const fetchContacts = async () => {
        try {
            const data = await messageService.getContacts(searchQuery);
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    useEffect(() => {
        const fetchBotData = async () => {
            try {
                const response = await axios.get('http://localhost:7000/api/chatbot');
                if (response.data.success) {
                    const allQA = response.data.data;
                    setBotQA(allQA);

                    // Map the response data into botQuickReplies filtered by currentUser.role
                    const filtered = allQA.filter(qa => qa.role === currentUser.role || qa.role === 'all');
                    const quickReplies = filtered.slice(0, 6).map(qa => {
                        const q = qa.question;
                        return q.charAt(0).toUpperCase() + q.slice(1);
                    });
                    setBotQuickReplies(quickReplies);
                }
            } catch (error) {
                console.error("Error fetching bot data:", error);
                setBotQuickReplies([]);
            }
        };

        fetchBotData();
    }, [currentUser.role]);

    useEffect(() => {
        fetchContacts();
    }, [searchQuery]);


    // Fetch Conversations list (latest messages)
    const fetchConversations = async () => {
        try {
            const data = await messageService.getConversations();
            // Process backend conversation format to frontend state
            const formatted = data.map(conv => ({
                otherUser: {
                    ...conv.otherUser,
                    uid: conv.otherUser._id, // Map for UI consistency
                    photoURL: conv.otherUser.profilePhoto // Map for profile photo rendering
                },
                lastMessage: {
                    ...conv.lastMessage,
                    timestamp: new Date(conv.lastMessage.createdAt)
                },
                unreadCount: conv.unreadCount
            }));
            setConversations(formatted);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll every 10s for sidebar updates
        return () => clearInterval(interval);
    }, []);

    // New Message Notification Polling (every 30s)
    const lastMessageIdRef = useRef(null);
    useEffect(() => {
        const checkNewMessages = async () => {
            try {
                const data = await messageService.getConversations();

                // Find the latest message that is NOT from the current user
                const latestMsg = data.reduce((latest, conv) => {
                    const msg = conv.lastMessage;
                    if (!msg || msg.senderId === currentUser.uid) return latest;
                    if (!latest || new Date(msg.createdAt) > new Date(latest.createdAt)) return msg;
                    return latest;
                }, null);

                if (latestMsg) {
                    lastMessageIdRef.current = latestMsg._id;
                } else if (lastMessageIdRef.current === null) {
                    lastMessageIdRef.current = "initialized";
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        const intervalId = setInterval(checkNewMessages, 30000);
        return () => clearInterval(intervalId);
    }, [currentUser.uid]);

    // Active Chat Polling (every 10s if a user is selected)
    useEffect(() => {
        if (!selectedUser) return;

        const interval = setInterval(async () => {
            try {
                const data = await messageService.getMessages(selectedUser.uid);
                const formatted = data.map(m => ({
                    ...m,
                    id: m._id,
                    timestamp: new Date(m.createdAt)
                }));

                // Filter out messages that were cleared on frontend
                const clearedAt = clearedTimestamps[selectedUser.uid];
                const filtered = clearedAt
                    ? formatted.filter(m => new Date(m.createdAt) > new Date(clearedAt))
                    : formatted;

                setMessages(filtered);
            } catch (err) {
                console.error("Active chat polling error:", err);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedUser, clearedTimestamps]);

    // Fetch full messages when a user is selected
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const data = await messageService.getMessages(selectedUser.uid);
                const formatted = data.map(m => ({
                    ...m,
                    id: m._id,
                    timestamp: new Date(m.createdAt)
                }));

                // Filter out messages that were cleared on frontend
                const clearedAt = clearedTimestamps[selectedUser.uid];
                const filtered = clearedAt
                    ? formatted.filter(m => new Date(m.createdAt) > new Date(clearedAt))
                    : formatted;

                setMessages(filtered);

                // Mark as read (use original formatted to ensure we don't skip marking unread messages as read even if they're hidden)
                if (formatted.some(m => !m.read && m.receiverId === currentUser.uid)) {
                    await messageService.markAsRead(formatted[0].conversationId);
                    fetchConversations(); // Update unread count in sidebar
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedUser, currentUser.uid]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUser]);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            id: URL.createObjectURL(file),
            file
        }));

        setSelectedImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (id) => {
        setSelectedImages(prev => prev.filter(img => img.id !== id));
    };

    const handleBotMessage = async (text) => {
        const userMsg = {
            id: Date.now(),
            text,
            senderId: currentUser.uid,
            timestamp: new Date()
        };
        setBotMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setIsBotTyping(true);

        try {
            const response = await axios.post('http://localhost:7000/api/chatbot/match', {
                question: text,
                role: currentUser.role
            });

            const responseText = response.data.answer;

            setTimeout(() => {
                const botReply = {
                    id: Date.now() + 1,
                    text: responseText,
                    senderId: 'bot',
                    timestamp: new Date()
                };
                setBotMessages(prev => [...prev, botReply]);
                setIsBotTyping(false);
            }, 600);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setTimeout(() => {
                const botReply = {
                    id: Date.now() + 1,
                    text: "I'm having trouble connecting to my knowledge base. Please try again later.",
                    senderId: 'bot',
                    timestamp: new Date()
                };
                setBotMessages(prev => [...prev, botReply]);
                setIsBotTyping(false);
            }, 600);
        }
    };


    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!selectedUser || (!newMessage.trim() && selectedImages.length === 0)) return;

        if (selectedUser.isBot) {
            handleBotMessage(newMessage);
            return;
        }

        try {
            // Convert images to base64 strings before sending to backend
            const filePromises = selectedImages.map(img => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(img.file);
                });
            });

            const base64Images = await Promise.all(filePromises);

            const msgData = {
                receiverId: selectedUser.uid,
                text: newMessage,
                images: base64Images,
                replyToId: replyTo?.id
            };

            const savedMsg = await messageService.sendMessage(msgData);

            // Add to local state
            setMessages(prev => [...prev, {
                ...savedMsg,
                id: savedMsg._id,
                timestamp: new Date(savedMsg.createdAt)
            }]);

            setNewMessage('');
            setReplyTo(null);
            setSelectedImages([]);
            fetchConversations(); // refresh sidebar
        } catch (error) {
            toast({ type: 'error', message: error.message || 'Failed to send message' });
        }
    };

    const handleClearAll = () => {
        setShowClearConfirm(true);
        setShowMoreMenu(false);
    };

    const confirmClearAll = () => {
        if (!selectedUser) return;

        const now = new Date().toISOString();
        setClearedTimestamps(prev => ({
            ...prev,
            [selectedUser.uid]: now
        }));

        setMessages([]);
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
        setBlockedUserIds(prev => [...prev, selectedUser.uid]);
        setShowReportConfirm(false);
        toast({
            type: 'info',
            message: `Report submitted for ${selectedUser.name}. User has been blocked.`
        });
    };

    const handleDeleteMessage = (msg) => {
        setMessageToDelete(msg);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteMessage = async () => {
        if (!messageToDelete) return;

        try {
            await messageService.deleteMessage(messageToDelete.id);
            setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
            setShowDeleteConfirm(false);
            setMessageToDelete(null);
            toast({ type: 'success', message: 'Message deleted' });
            fetchConversations();
        } catch (error) {
            toast({ type: 'error', message: 'Failed to delete message' });
        }
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

    const visibleTabs = (() => {
        if (currentUser.role === 'admin') return ['all', 'teachers', 'students'];
        if (currentUser.role === 'teacher') return ['all', 'admin', 'teachers', 'students'];
        if (currentUser.role === 'student') return ['all', 'admin', 'teachers', 'classmates'];
        return ['all'];
    })();

    const filteredConversations = (() => {
        // We want to show people from conversations OR all contacts if a search/tab is active
        // Let's create a combined list: Conversations first, then contacts who aren't in convos
        const convoUserIds = new Set(conversations.map(c => c.otherUser.uid));

        let displayList = [...conversations];

        // Add contacts who aren't in conversations yet
        contacts.forEach(contact => {
            if (!convoUserIds.has(contact._id)) {
                displayList.push({
                    otherUser: {
                        ...contact,
                        uid: contact._id,
                        photoURL: contact.profilePhoto // Map for profile photo rendering
                    },
                    lastMessage: null,
                    unreadCount: 0
                });
            }
        });

        return displayList.filter(c => {
            const matchesSearch = c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesTab = false;
            if (activeTab === 'all') matchesTab = true;
            else if (activeTab === 'admin') matchesTab = (c.otherUser.role === 'admin');
            else if (activeTab === 'teachers') matchesTab = (c.otherUser.role === 'teacher');
            else if (activeTab === 'students' || activeTab === 'classmates') matchesTab = (c.otherUser.role === 'student');

            // If message was cleared, don't show last message in sidebar
            const clearedAt = clearedTimestamps[c.otherUser.uid];
            if (clearedAt && c.lastMessage && new Date(c.lastMessage.timestamp) <= new Date(clearedAt)) {
                return matchesSearch && matchesTab;
            }

            return matchesSearch && matchesTab;
        }).map(c => {
            // Effectively hide last message and unread count if conversation was cleared
            const clearedAt = clearedTimestamps[c.otherUser.uid];
            if (clearedAt && c.lastMessage && new Date(c.lastMessage.timestamp) <= new Date(clearedAt)) {
                return {
                    ...c,
                    lastMessage: null,
                    unreadCount: 0
                };
            }
            return c;
        });
    })();

    const displayConversations = filteredConversations;

    const isSelectedUserBlocked = selectedUser ? blockedUserIds.includes(selectedUser.uid) : false;

    const selectedMessages = selectedUser ? messages : [];

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

                {/* Tabs Area: Movable tabs with Fixed AI Action */}
                <div className="relative flex items-center px-4 py-3 border-b border-slate-50 dark:border-slate-800 transition-colors">
                    <div className="flex-1 min-w-0 relative">
                        <div
                            ref={tabsRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            className={`flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-nowrap pr-8 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                            style={{
                                scrollSnapType: isDragging ? 'none' : 'x mandatory',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {visibleTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => !isDragging && setActiveTab(tab)}
                                    style={{ scrollSnapAlign: 'start' }}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex-shrink-0 ${activeTab === tab
                                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                                        : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        {/* Gradient Fade Indicator */}
                        <div className="absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
                    </div>

                    <div className="flex-shrink-0 ml-2">
                        <button
                            onClick={() => setSelectedUser(BOT_USER)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${selectedUser?.uid === 'bot'
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 shadow-sm'
                                }`}
                            title="ChatBot"
                        >
                            <TbMessageChatbot size={20} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                    {displayConversations.length > 0 ? (
                        displayConversations.map((convo) => (
                            <button
                                key={convo.otherUser.uid}
                                onClick={() => setSelectedUser(convo.otherUser)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left mb-1 group ${selectedUser?.uid === convo.otherUser.uid
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="relative">
                                    {convo.isBot ? (
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                            <TbMessageChatbot size={24} />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
                                            {convo.otherUser.photoURL ? (
                                                <img src={convo.otherUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <User className="text-emerald-600" size={20} />
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className="flex items-center gap-2 truncate">
                                            <p className={`text-sm font-bold truncate ${selectedUser?.uid === convo.otherUser.uid ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {convo.otherUser.name}
                                            </p>
                                            {!convo.isBot && blockedUserIds.includes(convo.otherUser.uid) && (
                                                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[8px] font-black uppercase rounded-md">Blocked</span>
                                            )}
                                            {convo.isBot && (
                                                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase rounded-md">AI</span>
                                            )}
                                        </div>
                                        {convo.lastMessage && (
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {convo.isBot ? 'Now' : format(convo.lastMessage.timestamp, 'HH:mm')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-400 truncate flex-1">
                                            {convo.lastMessage ? convo.lastMessage.text : `Start a conversation with ${convo.otherUser.role}`}
                                        </p>
                                        {!convo.isBot && convo.unreadCount > 0 && (
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
                                {selectedUser.isBot ? (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                        <TbMessageChatbot size={20} />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden">
                                        {selectedUser.photoURL ? (
                                            <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <User className="text-emerald-600" size={18} />
                                        )}
                                    </div>
                                )}
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
                            {!selectedUser.isBot && (
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
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative">
                            {isLoadingMessages ? (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[2px]">
                                    <Loading fullScreen={false} text="Retrieving messages" />
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {(selectedUser.isBot ? botMessages : selectedMessages).map((msg, idx) => {
                                        const isMe = msg.senderId === currentUser.uid;
                                        const convoSrc = selectedUser.isBot ? botMessages : selectedMessages;
                                        const showDate = idx === 0 || format(convoSrc[idx - 1].timestamp, 'yyyy-MM-dd') !== format(msg.timestamp, 'yyyy-MM-dd');

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
                                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group w-full`}>
                                                    <div className={`relative max-w-[70%] flex ${isMe ? 'items-end flex-col' : 'items-start flex-col'}`}>
                                                        {!selectedUser.isBot && (
                                                            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ${isMe ? '-left-20' : '-right-20'}`}>
                                                                <button
                                                                    onClick={() => setReplyTo(msg)}
                                                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 shadow-sm transition-all"
                                                                    title="Reply to message"
                                                                >
                                                                    <Reply size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg)}
                                                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-all"
                                                                    title="Delete message"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${isMe
                                                            ? 'bg-emerald-500 text-white rounded-tr-none'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-50 dark:border-slate-700'
                                                            }`}>
                                                            {msg.text && (
                                                                <div className={`whitespace-pre-wrap ${msg.images?.length > 0 ? 'mb-2' : ''}`}>
                                                                    {msg.text}
                                                                </div>
                                                            )}

                                                            {msg.images?.length > 0 && (
                                                                <div className={`grid gap-2 ${msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 shadow-inner'}`}>
                                                                    {msg.images.map((img, i) => (
                                                                        <img
                                                                            key={i}
                                                                            src={img}
                                                                            alt="sent"
                                                                            onClick={() => setPreviewImage(img)}
                                                                            className="rounded-xl object-cover w-full h-auto max-h-64 border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={`flex items-center gap-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                {format(msg.timestamp, 'HH:mm')}
                                                            </span>
                                                            {isMe && !selectedUser.isBot && (
                                                                msg.read ? <CheckCheck size={12} className="text-emerald-500" /> : <Clock size={10} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    {isBotTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-50 dark:border-slate-700">
                                                <div className="flex gap-1">
                                                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors flex flex-col">
                            {/* Reply Context Bar */}
                            <AnimatePresence>
                                {replyTo && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                <Reply size={10} /> Replying to {replyTo.senderId === currentUser.uid ? 'Yourself' : selectedUser?.name}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                {replyTo.text}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setReplyTo(null)}
                                            className="p-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-6">
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
                                    <>
                                        {/* Image Preview Bar */}
                                        <AnimatePresence>
                                            {selectedImages.length > 0 && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-0 py-4 bg-transparent flex gap-3 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-800 mb-4"
                                                >
                                                    {selectedImages.map((img) => (
                                                        <div key={img.id} className="relative flex-shrink-0">
                                                            <img src={img.id} alt="preview" className="w-20 h-20 object-cover rounded-xl border-2 border-white dark:border-slate-700 shadow-sm" />
                                                            <button
                                                                onClick={() => removeImage(img.id)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all scale-90"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Bot Quick Replies (Role-based) */}
                                        {selectedUser.isBot && botQuickReplies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4 px-2">
                                                {botQuickReplies.map((reply, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewMessage(reply);
                                                            handleBotMessage(reply);
                                                        }}
                                                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-sm"
                                                    >
                                                        {reply}
                                                    </button>
                                                ))}
                                            </div>
                                        )}


                                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                            />
                                            {!selectedUser.isBot && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-500 transition-all"
                                                >
                                                    <ImageIcon size={22} />
                                                </button>
                                            )}
                                            <div className="flex-1 relative group">
                                                <input
                                                    type="text"
                                                    placeholder={selectedUser.isBot ? "Ask the ChatBot..." : "Type a message..."}
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl px-6 text-sm font-medium text-slate-600 dark:text-slate-200 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300/30 transition-all outline-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() && selectedImages.length === 0}
                                                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
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
                                Select a contact from the left to start messaging.
                                All messages are private and can only be seen by you and the recipient.
                                If a message is reported, it becomes visible to ClassTrack administrators or School Admin
                                for review and moderation purposes.
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

            {/* Photo Preview Modal */}
            <PortalPopup
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
            >
                <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center p-2">
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800"
                    />
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center shadow-xl hover:text-red-500 transition-colors pointer-events-auto"
                    >
                        <X size={20} />
                    </button>
                </div>
            </PortalPopup>

            {/* Deletion Confirm Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setMessageToDelete(null);
                }}
                onConfirm={confirmDeleteMessage}
                title="Delete Message"
                message={messageToDelete?.senderId === currentUser.uid
                    ? "Are you sure you want to delete this message? It will be removed for everyone."
                    : "Are you sure you want to delete this message for yourself?"}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default MessagesPage;
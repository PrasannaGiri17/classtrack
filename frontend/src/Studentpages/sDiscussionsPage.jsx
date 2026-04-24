import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  ChevronDown,
  MoreVertical,
  Image as ImageIcon,
  Send,
  User as UserIcon,
  Clock,
  ArrowLeft,
  X,
  Lock,
  MessageCircle,
  ShieldAlert,
  GraduationCap,
  Trash2,
  AlertCircle,
  Flag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import teacherService from '../Api/teacherService';
import studentService from '../Api/studentService';
import gradeService from '../Api/gradeService';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import discussionService from '../Api/discussionService';


// --- Mock Data ---

// Mock subjects for students (fallback)
const DEFAULT_SUBJECTS = [
  { id: 'math', name: 'Mathematics' },
  { id: 'sci', name: 'Science' },
  { id: 'hist', name: 'History' },
];

// --- Shared Components ---

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'Just now') return dateStr || 'Just now';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};

const ImageGrid = ({ urls }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className={`grid gap-3 mt-4 overflow-hidden rounded-3xl max-w-2xl ${
      urls.length === 1 ? 'grid-cols-1 w-fit' : 'grid-cols-2'
    }`}>
      {urls.map((url, idx) => (
        <div key={idx} className={`relative overflow-hidden border border-slate-100 dark:border-slate-800 ${
          urls.length === 1 ? 'max-h-[400px]' : 
          (urls.length === 3 && idx === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-video')
        }`}>
          <img 
            src={url} 
            className={`${urls.length === 1 ? 'w-auto max-h-[400px] object-contain' : 'w-full h-full object-cover'} transition-transform duration-700 hover:scale-105`} 
            alt="Attached Reference" 
          />
        </div>
      ))}
    </div>
  );
};

// --- Modals ---

const CreatePostModal = ({ isOpen, onClose, onSubmit, subjects }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (images.length >= 3) {
        toast({ type: 'error', message: 'Maximum 3 images allowed.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePost = () => {
    if (!title || !body || !subjectId) return;
    onSubmit({ title, body, subjectId, imageUrls: images.length > 0 ? images : undefined });
    setTitle(''); setBody(''); setSubjectId(''); setImages([]);
    onClose();
    toast({ type: 'success', message: 'Discussion posted successfully!' });
  };

  return (
    <PortalPopup isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize tracking-tight leading-none">Start Discussion</h3>
              <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest mt-2">Engage with your grade community</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Related Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
            >
              <option value="">Select a Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is your question or topic?"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Details</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Provide context, share insights, or ask for help..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner resize-none leading-relaxed"
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group/img">
                  <img src={img} className="w-full h-full object-cover" alt="Preview" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-lg backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-6 pt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 3}
              className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 rounded-2xl font-black text-[10px] capitalize tracking-widest transition-all disabled:opacity-30"
            >
              <ImageIcon size={18} />
              {images.length >= 3 ? 'Max Reached' : `Attach Image (${images.length}/3)`}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

            <button
              disabled={!title || !body || !subjectId}
              onClick={handlePost}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs capitalize tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Post Discussion <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </PortalPopup>
  );
};

// --- Page Components ---

const DiscussionCard = ({ post, onClick, onDelete, onReport, user, subjects }) => {
  const subject = subjects?.find(s => s.id === post.subjectId) || { name: 'Discussion' };
  const currentUserId = user?.studentId || user?.teacherId || user?._id || user?.id || user?.userId;
  const isAuthor = String(post.authorId) === String(currentUserId);

  // Robust name cleanup
  let authorName = isAuthor ? `${user?.firstName} ${user?.lastName}` : (post.authorName || 'Guest User');
  if (!isAuthor && (authorName.includes('undefined') || authorName === 'Undefined Undefined')) {
    authorName = post.authorRole === 'teacher' ? 'School Teacher' : 'School Student';
  }

  const authorAvatar = isAuthor ? (user?.profilePhoto || user?.avatar) : post.authorAvatar;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff`;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 group hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group-hover:border-emerald-500/20 transition-all flex items-center justify-center bg-slate-100">
            <img
              src={authorAvatar || fallbackAvatar}
              alt={authorName}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = fallbackAvatar; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white capitalize tracking-tight">{authorName}</h4>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black capitalize tracking-widest border ${post.authorRole === 'teacher'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                {post.authorRole}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 capitalize tracking-widest">
              <Clock size={12} className="text-emerald-500" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl text-[9px] font-black text-slate-500 capitalize tracking-widest border border-transparent group-hover:border-emerald-500/20 transition-all">
            {subject?.name}
          </span>
          {isAuthor ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(post._id || post.id); }}
              className="p-2 text-white hover:bg-red-500 rounded-xl transition-all"
              title="Delete Discussion"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onReport(post); }}
              className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
              title="Report Discussion"
            >
              <Flag size={18} />
            </button>
          )}
          <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-500 transition-colors capitalize tracking-tight">
          {post.title}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {post.body}
        </p>

        {post.imageUrls && <ImageGrid urls={post.imageUrls} />}

        <div className="flex items-center gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] capitalize tracking-widest">
            <MessageCircle size={14} className="text-emerald-500" />
            {post.commentCount} Comments
          </div>
          <div className="text-[10px] font-bold text-slate-300 capitalize tracking-widest flex-1 text-right">
            Click to Participate
          </div>
        </div>
      </div>
    </div>
  );
};

const DiscussionDetailView = ({ post, onBack, onDelete, onReport, user, subjects }) => {
  const [commentText, setCommentText] = useState('');
  const [commentImages, setCommentImages] = useState([]);
  const [comments, setComments] = useState([]);
  const fileInputRef = useRef(null);
  const currentUserId = user?.studentId || user?.teacherId || user?._id || user?.id || user?.userId;
  const isAuthor = String(post.authorId) === String(currentUserId);

  const loadComments = async () => {
    try {
      const data = await discussionService.getComments(post._id || post.id);
      setComments(data);
    } catch (err) {
      console.error("LOAD_COMMENTS_ERROR:", err);
    }
  };

  useEffect(() => {
    if (post) loadComments();
  }, [post]);

  const canComment = useMemo(() => {
    // 1. Teachers and Admins have full access
    if (user?.role === 'teacher' || user?.role === 'admin') return true;

    // 2. Author always has access
    if (isAuthor) return true;

    // 3. Students must match the grade of the post
    if (user?.role === 'student') {
      const userGradeId = user?.gradeId || user?.classId;
      if (!userGradeId || !post?.gradeId) return false;
      return String(userGradeId) === String(post.gradeId);
    }

    return false;
  }, [post, user, isAuthor]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (commentImages.length >= 3) {
        toast({ type: 'error', message: 'Maximum 3 images allowed.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setCommentImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCommentImage = (idx) => {
    setCommentImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePostComment = async () => {
    if (!commentText.trim() && commentImages.length === 0) return;
    try {
      const commentData = {
        body: commentText,
        imageUrls: commentImages.length > 0 ? commentImages : []
      };
      await discussionService.addComment(post._id || post.id, commentData);
      setCommentText('');
      setCommentImages([]);
      loadComments();
      toast({ type: 'success', message: 'Comment posted.' });
    } catch (err) {
      toast({ type: 'error', message: 'Failed to post comment.' });
    }
  };

  let authorName = isAuthor ? `${user?.firstName} ${user?.lastName}` : (post.authorName || 'Guest User');
  if (!isAuthor && (authorName.includes('undefined') || authorName === 'Undefined Undefined')) {
    authorName = post.authorRole === 'teacher' ? 'School Teacher' : 'School Student';
  }

  const authorAvatar = isAuthor ? (user?.profilePhoto || user?.avatar) : post.authorAvatar;
  const authorFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black text-[10px] tracking-widest transition-all p-3 hover:bg-emerald-50 rounded-2xl group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO FEED
        </button>

        <div className="flex items-center gap-3">
          {isAuthor ? (
            <button
              onClick={() => onDelete(post._id || post.id)}
              className="p-4 bg-transparent text-white hover:bg-red-500 active:bg-red-600 rounded-2xl transition-all shadow-sm"
              title="Delete Discussion"
            >
              <Trash2 size={20} />
            </button>
          ) : (
            <button
              onClick={() => onReport(post)}
              className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-all shadow-sm"
              title="Report Discussion"
            >
              <Flag size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/20 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none mb-10 overflow-hidden">
        <div className="p-10 lg:p-14 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 bg-slate-100 flex items-center justify-center">
                <img
                  src={authorAvatar || authorFallback}
                  className="w-full h-full object-cover"
                  alt={authorName}
                  onError={(e) => { e.target.src = authorFallback; }}
                />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight">{authorName}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-black text-emerald-500 capitalize tracking-widest">{post.authorRole}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[9px] font-bold text-slate-400 capitalize tracking-widest">{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-[10px] font-black text-emerald-600 dark:text-emerald-400 capitalize tracking-widest h-fit">
              {subjects?.find(s => s.id === post.subjectId)?.name || 'Discussion'}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter capitalize leading-tight">
              {post.title}
            </h2>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.body}
            </p>
            {post.imageUrls && <ImageGrid urls={post.imageUrls} />}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-emerald-500" size={20} />
          <h3 className="text-[11px] font-black text-slate-400 capitalize tracking-[0.3em]">Participation Center</h3>
        </div>

        {canComment ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 space-y-4 focus-within:ring-4 ring-emerald-500/5 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center">
                <img
                  src={(user?.profilePhoto || user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'Me')}`}
                  className="w-full h-full object-cover"
                  alt="Me"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'Me')}`; }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 capitalize tracking-widest">
                Posting as <span className="text-emerald-500">{user?.firstName} {user?.lastName}</span>
              </span>
            </div>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts or answer this question..."
              className="w-full bg-transparent border-none text-base font-medium text-slate-700 dark:text-slate-200 outline-none resize-none min-h-[100px] scrollbar-hide"
            />

            {commentImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {commentImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 group/cimg">
                    <img src={img} className="w-full h-full object-cover" alt="Comment attachment" />
                    <button
                      onClick={() => removeCommentImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-md opacity-0 group-hover/cimg:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={commentImages.length >= 3}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-emerald-500 transition-colors text-[10px] font-black capitalize tracking-widest disabled:opacity-30"
              >
                <ImageIcon size={18} />
                {commentImages.length >= 3 ? 'Max' : `+ Image (${commentImages.length}/3)`}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() && commentImages.length === 0}
                className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-2xl font-black text-[10px] capitalize tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                Send Comment <Send size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex flex-col items-center text-center space-y-4">
            <Lock size={32} className="text-amber-500" />
            <div className="max-w-md">
              <p className="text-xs font-black text-amber-700 dark:text-amber-400 capitalize tracking-widest">Read Only Access</p>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-500 mt-2">Only students of this Grade and assigned Subject Teachers can participate in this discussion.</p>
            </div>
          </div>
        )}

        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          {comments.map((comment) => {
            const isCommentAuthor = String(comment.authorId) === String(currentUserId);
            let cName = isCommentAuthor ? `${user?.firstName} ${user?.lastName}` : (comment.authorName || 'Guest User');
            if (!isCommentAuthor && (cName.includes('undefined') || cName === 'Undefined Undefined' || cName === 'null null')) {
              cName = comment.authorRole === 'teacher' ? 'School Teacher' : 'School Student';
            }
            const cAvatar = isCommentAuthor ? (user?.profilePhoto || user?.avatar) : comment.authorAvatar;
            const cFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(cName)}&background=random&color=fff`;

            return (
              <div key={comment._id || comment.id} className="flex gap-5 group animate-in slide-in-from-top-4 duration-300">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 flex items-center justify-center">
                  <img
                    src={cAvatar || cFallback}
                    className="w-full h-full object-cover"
                    alt={cName}
                    onError={(e) => { e.target.src = cFallback; }}
                  />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-800/30 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800/50 group-hover:border-emerald-500/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-800 dark:text-white capitalize tracking-tight">{cName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[7px] font-black capitalize tracking-widest border ${comment.authorRole === 'teacher' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                        {comment.authorRole}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 capitalize tracking-widest">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {comment.body}
                  </p>
                  {comment.imageUrls && <ImageGrid urls={comment.imageUrls} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main Container ---

const SDiscussionsPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        if (isTeacher) {
          const teacherId = localStorage.getItem('teacherId');
          if (!teacherId) return;
          const tData = await teacherService.getTeacherById(teacherId);
          const subs = [];

          if (tData.primarySubject) {
            const sName = typeof tData.primarySubject === 'object' ? (tData.primarySubject.subjectName || tData.primarySubject.title) : tData.primarySubject;
            const sId = typeof tData.primarySubject === 'object' ? tData.primarySubject._id : tData.primarySubject;
            if (sName) subs.push({ id: sId, name: sName });
          }
          if (tData.secondarySubject) {
            const sName = typeof tData.secondarySubject === 'object' ? (tData.secondarySubject.subjectName || tData.secondarySubject.title) : tData.secondarySubject;
            const sId = typeof tData.secondarySubject === 'object' ? tData.secondarySubject._id : tData.secondarySubject;
            if (sName && !subs.some(s => s.name === sName)) subs.push({ id: sId, name: sName });
          }
          setSubjects(subs);
        } else {
          // Fetch real subjects for student's grade
          const schoolId = user?.schoolId || localStorage.getItem('schoolId');
          if (!schoolId) return;

          const grades = await gradeService.getGrades(schoolId);
          let userGradeId = user?.gradeId || user?.classId;

          // EMERGENCY: If gradeId missing, fetch student profile
          if (!userGradeId && user?.studentId) {
            try {
              const sProfile = await studentService.getStudentById(user.studentId);
              userGradeId = sProfile.classId || sProfile.gradeId || (sProfile.sectionId && (sProfile.sectionId.gradeId || sProfile.sectionId.classId));
            } catch (err) { console.error("Grade recover fail:", err); }
          }

          if (!userGradeId) {
            console.warn("No Grade ID found for student");
            setSubjects([]);
            return;
          }

          const currentGrade = grades.find(g => String(g._id) === String(userGradeId));

          if (currentGrade && currentGrade.subjects) {
            const subs = currentGrade.subjects
              .filter(s => s.subjectId)
              .map(s => ({
                id: s.subjectId._id || s.subjectId,
                name: s.subjectId.subjectName || s.subjectId.title || 'Unknown Subject'
              }));
            setSubjects(subs);
          } else {
            console.warn("No subjects found for grade", userGradeId);
            setSubjects([]);
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
        setSubjects([]);
      }
    };
    if (user) loadSubjects();
  }, [user, isTeacher]);

  // Handle auto-selection of single subject
  useEffect(() => {
    if (subjects.length === 1) {
      setFilterSubject(subjects[0].id);
    } else {
      setFilterSubject('all');
    }
  }, [subjects]);

  const loadPosts = async () => {
    try {
      const filters = {
        subjectId: filterSubject,
        search: searchQuery,
        gradeId: !isTeacher ? user?.gradeId : undefined
      };

      const data = await discussionService.getDiscussions(filters);
      setPosts(data);
    } catch (err) {
      console.error("LOAD_POSTS_ERROR:", err);
      toast({ type: 'error', message: 'Failed to load discussions.' });
    }
  };

  useEffect(() => {
    if (user) loadPosts();
  }, [user, filterSubject, searchQuery, activeTab]);


  // Deletion States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Report States
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  // Filter Logic
  const visiblePosts = useMemo(() => {
    return posts.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
      const matchesSubject = filterSubject === 'all' || p.subjectId === filterSubject;

      let matchesTab = true;
      if (activeTab === 'my') {
        const currentUserId = String(user?.studentId || user?.teacherId || user?._id || user?.id || user?.userId);
        if (isTeacher) {
          // Teacher sees posts they authored OR posts they replied to
          matchesTab = p.repliedBy?.includes(currentUserId) || String(p.authorId) === currentUserId;
        } else {
          // Student sees posts they authored
          matchesTab = String(p.authorId) === currentUserId;
        }
      }

      return matchesSearch && matchesSubject && matchesTab;
    });
  }, [posts, searchQuery, filterSubject, activeTab, isTeacher, user]);

  const handleCreatePost = async (newPostData) => {
    try {
      await discussionService.createDiscussion(newPostData);
      loadPosts();
      toast({ type: 'success', message: 'Discussion started!' });
    } catch (err) {
      toast({ type: 'error', message: 'Failed to create discussion.' });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await discussionService.deleteDiscussion(postId);
      setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
      toast({ type: 'success', message: 'Discussion removed.' });
    } catch (err) {
      toast({ type: 'error', message: 'Failed to delete discussion.' });
    }
  };

  const handleReportPost = async (postId) => {
    try {
      const res = await discussionService.reportDiscussion(postId);
      if (isTeacher) {
        toast({ type: 'success', message: 'Discussion removed by moderation.' });
        loadPosts();
        if (selectedPost?._id === postId || selectedPost?.id === postId) setSelectedPost(null);
      } else {
        toast({ type: 'success', message: 'Post reported to moderators.' });
      }
    } catch (err) {
      toast({ type: 'error', message: 'Failed to report post.' });
    }
  };

  return (
    <div className="w-full">
      {selectedPost ? (
        <DiscussionDetailView
          post={selectedPost}
          user={user}
          subjects={subjects}
          onBack={() => setSelectedPost(null)}
          onDelete={(id) => {
            setPostToDelete(id);
            setIsDeleteDialogOpen(true);
          }}
          onReport={(id) => {
            setPostToReport(id?._id || id?.id || id);
            setIsReportDialogOpen(true);
          }}
        />
      ) : (
        <div className="space-y-10">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight">Discussion</h2>
            </div>
            {!isTeacher && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] capitalize tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18} /> New Discussion
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="w-full lg:max-w-md relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200 shadow-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative">
              <button
                onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all dark:text-slate-200 shadow-sm min-w-[180px] justify-between"
              >
                <span>{subjects.find(s => s.id === filterSubject)?.name || 'All Channels'}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSubjectDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsSubjectDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => { setFilterSubject('all'); setIsSubjectDropdownOpen(false); }}
                      className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filterSubject === 'all' ? 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      All Channels
                    </button>
                    {subjects.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setFilterSubject(s.id); setIsSubjectDropdownOpen(false); }}
                        className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filterSubject === s.id ? 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black capitalize tracking-widest transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  Stream
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black capitalize tracking-widest transition-all ${activeTab === 'my' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  {isTeacher ? 'Your Replied' : 'My Posts'}
                </button>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="grid grid-cols-1 gap-6">
            {visiblePosts.length > 0 ? (
              visiblePosts.map(p => (
                <DiscussionCard
                  key={p._id || p.id}
                  post={p}
                  user={user}
                  subjects={subjects}
                  onClick={() => setSelectedPost(p)}
                  onDelete={(id) => {
                    setPostToDelete(id);
                    setIsDeleteDialogOpen(true);
                  }}
                  onReport={(post) => {
                    setPostToReport(post._id || post.id);
                    setIsReportDialogOpen(true);
                  }}
                />
              ))
            ) : (
              <div className="py-40 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[64px] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <MessageCircle size={48} className="text-slate-200 mx-auto mb-6" />
                <p className="text-sm font-black text-slate-400 capitalize tracking-[0.4em]">No Discussions Found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        subjects={subjects}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (postToDelete) {
            handleDeletePost(postToDelete);
            setIsDeleteDialogOpen(false);
            if (selectedPost?._id === postToDelete || selectedPost?.id === postToDelete) setSelectedPost(null);
          }
        }}
        title="Delete Discussion?"
        message="This action cannot be undone. All comments under this discussion will also be removed permanently."
      />

      <ConfirmDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        onConfirm={() => {
          if (postToReport) {
            handleReportPost(postToReport);
            setIsReportDialogOpen(false);
          }
        }}
        title={isTeacher ? "Moderate Content?" : "Report Content?"}
        message={isTeacher
          ? "As a teacher, reporting this post will permanently delete it and all its comments. Proceed?"
          : "Are you sure you want to report this post? Our moderators will review it within 24 hours."}
      />
    </div>
  );
};

export default SDiscussionsPage;
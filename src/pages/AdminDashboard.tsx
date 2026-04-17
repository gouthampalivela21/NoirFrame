import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeToReviews, updateReview, deleteReview } from '@/lib/reviewService';
import { Pencil, Trash2, LogOut, Star, X } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  role: string;
  message: string;
  rating: number;
  date: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', message: '', rating: 5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToReviews(setReviews);
    return () => unsub();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const openEdit = (review: Review) => {
    setEditForm({ name: review.name, role: review.role, message: review.message, rating: review.rating });
    setEditingReview(review);
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    setSaving(true);
    try {
      await updateReview(editingReview.id, editForm);
      setEditingReview(null);
    } catch { /* silently fail */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingReview) return;
    setSaving(true);
    try {
      await deleteReview(deletingReview.id);
      setDeletingReview(null);
    } catch { /* silently fail */ }
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-body animate-pulse">Loading...</div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-lg p-8 md:p-10 w-full max-w-md">
          <h1 className="font-heading text-3xl text-foreground text-center mb-2">Admin Login</h1>
          <p className="text-muted-foreground font-body text-sm text-center mb-8">
            Noir <span className="text-primary">Frame</span> Dashboard
          </p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm focus:border-primary/50 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] outline-none transition-all duration-300"
                placeholder="admin@noirframe.com"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm focus:border-primary/50 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-destructive font-body text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full px-8 py-4 border border-primary/30 text-primary font-body text-sm tracking-widest uppercase glow-button rounded-sm transition-all duration-300 hover:bg-primary/10"
            >
              Sign In
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-primary transition-colors text-center"
          >
            ← Back to site
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="font-heading text-xl text-foreground">
              Noir <span className="text-primary">Frame</span> Admin
            </h1>
            <p className="text-muted-foreground font-body text-xs mt-0.5">{reviews.length} reviews</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-body text-xs hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-xs tracking-widest uppercase"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Reviews table */}
      <div className="container py-8">
        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">No reviews yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block glass rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Name</th>
                    <th className="text-left px-6 py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Role</th>
                    <th className="text-left px-6 py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Review</th>
                    <th className="text-left px-6 py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Rating</th>
                    <th className="text-left px-6 py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Date</th>
                    <th className="text-right px-6 py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-body text-foreground text-sm">{r.name}</td>
                      <td className="px-6 py-4 font-body text-muted-foreground text-sm">{r.role || '—'}</td>
                      <td className="px-6 py-4 font-body text-foreground/80 text-sm max-w-xs truncate">{r.message}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-body text-muted-foreground text-xs">{r.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-2 rounded-sm hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingReview(r)}
                            className="p-2 rounded-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="glass rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-heading text-foreground text-sm">{r.name}</p>
                      {r.role && <p className="text-muted-foreground font-body text-xs mt-0.5">{r.role}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-sm hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingReview(r)} className="p-1.5 rounded-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-body text-foreground/80 text-sm leading-relaxed">{r.message}</p>
                  <p className="text-muted-foreground/60 font-body text-xs mt-3">{r.date}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setEditingReview(null)}>
          <div className="glass rounded-lg p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl text-foreground">Edit Review</h2>
              <button onClick={() => setEditingReview(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm focus:border-primary/50 outline-none transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">Role</label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm focus:border-primary/50 outline-none transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className={`text-2xl transition-all duration-200 hover:scale-110 ${star <= editForm.rating ? 'text-primary' : 'text-border'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">Review</label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  rows={4}
                  className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm focus:border-primary/50 outline-none transition-all duration-300 resize-none"
                />
              </div>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full px-8 py-4 border border-primary/30 text-primary font-body text-sm tracking-widest uppercase glow-button rounded-sm transition-all duration-300 hover:bg-primary/10 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setDeletingReview(null)}>
          <div className="glass rounded-lg p-8 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <Trash2 className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h2 className="font-heading text-xl text-foreground mb-2">Delete Review?</h2>
            <p className="text-muted-foreground font-body text-sm mb-6">
              This will permanently delete the review by <strong className="text-foreground">{deletingReview.name}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingReview(null)}
                className="flex-1 px-6 py-3 border border-border text-muted-foreground font-body text-sm tracking-widest uppercase rounded-sm hover:bg-secondary/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-destructive/20 border border-destructive/30 text-destructive font-body text-sm tracking-widest uppercase rounded-sm hover:bg-destructive/30 transition-all disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
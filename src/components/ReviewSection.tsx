import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

// ✅ FIXED IMPORT PATH (change if needed based on your folder)
import { subscribeToReviews, addReview, type Review } from '../lib/reviewService';
import {
  validateReview,
  checkRateLimit,
  checkDuplicate,
  recordSubmission,
  isHoneypotFilled,
} from '../lib/spamProtection';

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: '', role: '', message: '', rating: 5 });
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToReviews(setReviews);
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isHoneypotFilled(honeypot)) return;

    const validationError = validateReview(form.name, form.message);
    if (validationError) { setError(validationError); return; }

    const rateError = checkRateLimit();
    if (rateError) { setError(rateError); return; }

    const dupeError = checkDuplicate(form.message);
    if (dupeError) { setError(dupeError); return; }

    setLoading(true);
    try {
      await addReview({
        name: form.name.trim(),
        role: form.role.trim(),
        message: form.message.trim(),
        rating: form.rating,
        date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      });

      recordSubmission(form.message);
      setForm({ name: '', role: '', message: '', rating: 5 });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="relative py-32 md:py-44 grain">
      <div className="container max-w-6xl relative z-10">

        {/* Heading */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">
              Your Voice Matters
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              Share your experience
            </h2>
            <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
              Tell us how Noir Frame transformed your brand
            </p>
          </div>
        </ScrollReveal>

        {/* FORM */}
        <ScrollReveal>
          <form onSubmit={handleSubmit} className="glass rounded-lg p-8 md:p-10 max-w-2xl mx-auto mb-16">

            {/* Honeypot */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* ✅ FORM GRID RESTORED */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body block mb-2">
                  Your Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground font-body text-sm"
                  placeholder="CEO, Company Name"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="text-xs uppercase text-muted-foreground font-body block mb-3">
                Rating
              </label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className={`text-2xl ${star <= form.rating ? 'text-primary' : 'text-border'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <div className="mb-6">
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="w-full bg-secondary/50 border border-border rounded-sm px-4 py-3 text-foreground"
                placeholder="Write your review..."
              />
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-4 border text-primary">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>

            {submitted && <p className="text-center text-primary mt-4">Thanks! ✨</p>}
          </form>
        </ScrollReveal>

        {/* ✅ REVIEWS SLIDER */}
        {reviews.length > 0 && (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-4 snap-x snap-mandatory">

            {reviews.map((r, i) => (
              <ScrollReveal key={r.id} delay={i * 120}>
                <div className="min-w-[85%] md:min-w-0 snap-center">

                  <div className="glass rounded-lg p-8">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: r.rating }).map((_, s) => (
                        <span key={s}>★</span>
                      ))}
                    </div>

                    <p className="italic">"{r.message}"</p>

                    <div className="mt-6 border-t pt-4">
                      <p>{r.name}</p>
                      <p className="text-sm">{r.date}</p>
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { MessageCircle } from 'lucide-react';

export default function ContactSection() {

  const [focused, setFocused] = useState<string | null>(null);

  
  // ✅ ADDED STATE
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!name || !email || !message) {
    alert("Please fill all fields ⚠️");
    return;
  }

  const subject = "New Project Inquiry - Noir Frame";

  const body = `Name: ${name}
Email: ${email}

Project Details:
${message}`;

  const mailtoLink = `mailto:teamnoirframe@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=teamnoirframe@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isMobile) {
    // 📱 Mobile → directly open mail app
    window.location.href = mailtoLink;
  } else {
    // 💻 Desktop → try Gmail, fallback to mail app
    const win = window.open(gmailLink, "_blank");

    if (!win) {
      window.location.href = mailtoLink;
    }
  }
};

  return (
    <section id="contact" className="relative py-32 md:py-44 grain layered-bg-alt">
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] -translate-y-1/2 pointer-events-none" />

      <div className="container max-w-2xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">Start a Project</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              Let's build something exceptional.
            </h2>
            <p className="text-muted-foreground font-body text-lg font-light mt-6">
              If you're serious about elevating your brand, let's talk.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {[
              { name: 'name', label: 'Your Name', type: 'text' },
              { name: 'email', label: 'Your Email', type: 'email' },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  placeholder={field.label}
                  onFocus={() => setFocused(field.name)}
                  onBlur={() => setFocused(null)}
                  value={field.name === 'name' ? name : email}
                  onChange={(e) =>
                    field.name === 'name'
                      ? setName(e.target.value)
                      : setEmail(e.target.value)
                  }
                  className={`w-full bg-transparent border-b py-4 px-0 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-500 ${
                    focused === field.name ? 'border-primary' : 'border-border'
                  }`}
                />
                {focused === field.name && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.5),0_0_30px_hsl(var(--primary)/0.2)]" />
                )}
              </div>
            ))}

            <div className="relative">
              <textarea
                placeholder="Tell us about your project and budget"
                rows={4}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full bg-transparent border-b py-4 px-0 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none transition-all duration-500 ${
                  focused === 'message' ? 'border-primary' : 'border-border'
                }`}
              />
              {focused === 'message' && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.5),0_0_30px_hsl(var(--primary)/0.2)]" />
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="px-8 py-4 border border-primary/30 text-primary font-body text-sm tracking-widest uppercase glow-button"
              >
                Start Your Project
              </button>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
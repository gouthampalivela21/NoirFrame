import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Contact from "../components/Contact.jsx";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = "Contact & Inquiries — Start a Conversation | Phantom Labs";

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = "";
    if (metaDesc) {
      originalDesc = metaDesc.getAttribute("content") || "";
      metaDesc.setAttribute(
        "content",
        "Start a conversation with Phantom Labs. Available for portraits, couples, events, brands, and editorial photography commissions worldwide."
      );
    }

    return () => {
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
    };
  }, []);

  return (
    <motion.article
      className="contact-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ paddingTop: "calc(var(--nav-height) + 24px)" }}
    >
      <Contact />
    </motion.article>
  );
}

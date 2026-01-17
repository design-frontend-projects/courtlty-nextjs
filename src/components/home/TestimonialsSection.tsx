"use client";

import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Ahmed Hassan",
    role: "Basketball Team Captain",
    avatar: "",
    content:
      "Courtly has completely transformed how our team books courts. The real-time availability feature saves us so much time, and the team management tools are exactly what we needed.",
    rating: 5,
    sport: "🏀",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    role: "Tennis Enthusiast",
    avatar: "",
    content:
      "I love how easy it is to find and book tennis courts near me. The payment splitting feature is brilliant when I play doubles with friends!",
    rating: 5,
    sport: "🎾",
  },
  {
    id: 3,
    name: "Mohamed Ali",
    role: "Football Team Manager",
    avatar: "",
    content:
      "Managing our football team has never been easier. From scheduling practice sessions to organizing matches, Courtly handles it all seamlessly.",
    rating: 5,
    sport: "⚽",
  },
  {
    id: 4,
    name: "Lisa Chen",
    role: "Volleyball Player",
    avatar: "",
    content:
      "The notification system is a lifesaver! I never miss a game anymore, and finding new teams to join was so simple through the platform.",
    rating: 5,
    sport: "🏐",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Loved by Players</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            What Our{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Join thousands of satisfied players who have transformed their
            sports experience with Courtly.
          </motion.p>
        </div>

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden lg:grid grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-emerald-500/20 dark:text-emerald-400/20">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Sport badge */}
                <div className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-2xl shadow-lg">
                  {testimonial.sport}
                </div>

                {/* Content */}
                <div className="pt-12">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-emerald-200 dark:border-emerald-700">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
          >
            {/* Sport badge */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-2xl shadow-lg mb-6">
              {testimonials[activeIndex].sport}
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
              &ldquo;{testimonials[activeIndex].content}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-emerald-200 dark:border-emerald-700">
                <AvatarImage src={testimonials[activeIndex].avatar} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white font-semibold">
                  {testimonials[activeIndex].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {testimonials[activeIndex].role}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-8 bg-gradient-to-r from-emerald-500 to-cyan-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

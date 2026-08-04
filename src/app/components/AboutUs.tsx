import { motion } from 'motion/react';
import { Sparkles, Crown, Heart, ShieldCheck, Feather } from 'lucide-react';

export function AboutUs() {
  return (
    <section id="about-us" className="py-16 lg:py-24 bg-[#fdfcfb] border-b border-[#e5e5e5]/60 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f4f1e8] rounded-full blur-3xl opacity-40 pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#eef3eb] rounded-full blur-3xl opacity-40 pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-12 relative z-10">
        
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2efe6] border border-[#e2dccb] mb-4">
            <Crown className="w-4 h-4 text-[#8c7643]" />
            <span className="text-xs font-bold tracking-widest text-[#8c7643] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
              OUR BRAND STORY
            </span>
          </div>
          <h2
            className="text-3xl lg:text-5xl font-extrabold text-[#2c4c3b] tracking-wider uppercase mb-6"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            ABOUT RICH GIRL
          </h2>
          <p
            className="text-gray-600 text-base lg:text-lg leading-relaxed font-normal"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            At <strong className="text-[#2c4c3b] font-semibold">RICH GIRL</strong>, fashion is more than apparel—it is a celebration of individuality, luxury, and cultural fusion. We craft contemporary silhouettes infused with rich heritage, empowering women to feel regal, confident, and effortless every single day.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            {
              icon: <Crown className="w-7 h-7 text-[#2c4c3b]" />,
              title: "Royal Craftsmanship",
              desc: "Intricate embroideries and hand-curated details designed by master artisans."
            },
            {
              icon: <Feather className="w-7 h-7 text-[#2c4c3b]" />,
              title: "Luxurious Fabrics",
              desc: "Pure breathable cottons, rich silks, and premium blends crafted for ultimate comfort."
            },
            {
              icon: <Sparkles className="w-7 h-7 text-[#2c4c3b]" />,
              title: "Fusion Perfection",
              desc: "A seamless harmony of timeless Indian tradition and sleek Western elegance."
            },
            {
              icon: <ShieldCheck className="w-7 h-7 text-[#2c4c3b]" />,
              title: "Uncompromising Quality",
              desc: "Every garment undergoes rigorous quality standards to ensure flawless durability."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border border-[#e8e4db] shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-xl bg-[#f2f6f1] group-hover:bg-[#2c4c3b] transition-colors flex items-center justify-center mb-6">
                <span className="group-hover:[&>svg]:text-white">
                  {item.icon}
                </span>
              </div>
              <h3
                className="text-lg font-bold text-[#2c4c3b] mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-gray-500 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Editorial Quote Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 lg:mt-16 bg-[#2c4c3b] rounded-2xl p-8 lg:p-14 text-white text-center relative overflow-hidden shadow-xl"
        >
          <div className="max-w-3xl mx-auto relative z-10">
            <Heart className="w-10 h-10 mx-auto text-[#c2b48d] mb-4 opacity-80" />
            <blockquote
              className="text-xl lg:text-3xl font-light italic leading-relaxed text-[#f7f5f0] mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              &ldquo;Elegance is not about being noticed, it&apos;s about being remembered.&rdquo;
            </blockquote>
            <div className="w-12 h-0.5 bg-[#c2b48d] mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#c2b48d] font-bold" style={{ fontFamily: 'var(--font-body)' }}>
              THE RICH GIRL PROMISE
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

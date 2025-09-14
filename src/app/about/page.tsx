'use client';

import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function AboutPage() {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const pColor = theme === 'light' ? 'text-gray-700' : 'text-gray-300';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen font-sans`}>
      <Header />

      <main className="pt-28 md:pt-24 relative z-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto my-16 space-y-16">
            {/* About Section */}
            <section>
              <h2 className="text-4xl font-serif font-light mb-8">About Lockup Studio</h2>
              <p className={`text-lg ${pColor} leading-relaxed mb-4`}>
                Lockup Studio is a passionate team of photographers dedicated to capturing the beauty and emotion of your most precious moments. We believe that every event tells a unique story, and our goal is to tell that story through our lenses.
              </p>
              <p className={`text-lg ${pColor} leading-relaxed`}>
                With a focus on a classic and timeless style, we strive to create images that you will cherish for a lifetime. From weddings and engagements to family portraits and special events, we are here to document your memories with artistry and care.
              </p>
            </section>

            {/* Contact Section */}
            <section className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-serif font-light mb-6">Contact Us</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className={`text-lg font-medium ${pColor}`}>Owner</h4>
                    <p className={pColor}>Naveenkumar Venkatesan</p>
                  </div>
                  <div>
                    <h4 className={`text-lg font-medium ${pColor}`}>Contact</h4>
                    <p className={pColor}>Phone: +91 9629801619</p>
                    <p className={pColor}>Email: lockupstudiothiruvarur@gmail.com</p>
                  </div>
                  <div>
                    <h4 className={`text-lg font-medium ${pColor}`}>Address</h4>
                    <p className={pColor}>GK Clinic Opposite, Durgalaya Road, Thiruvarur</p>
                    <p className={pColor}>TamilNadu, India. 610001</p>
                  </div>
                </div>
              </div>
              
              {/* Google Maps Embed */}
              <div className={`aspect-square md:aspect-auto border ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'} rounded-lg overflow-hidden`}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.444014519881!2d79.62396617586116!3d10.777265059176628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5547cdafe25ff1%3A0x9dd7ed4c3ce2d01f!2sLockup%20Studio!5e0!3m2!1sen!2sin!4v1755337231945!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lockup Studio Location"
                ></iframe>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}


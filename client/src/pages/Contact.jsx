import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Timepiece Acquisition Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Timepiece Acquisition Inquiry',
        message: ''
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-2">
            Private Horological Concierge
          </span>
          <h1 className="text-3xl sm:text-5xl font-['Cinzel'] font-bold text-white mb-4">
            Contact {BRAND_CONFIG.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-light">
            Whether seeking assistance with a bespoke commission, servicing an heirloom, or scheduling an atelier visit, our concierge is at your command.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Contact Info */}
          <div className="space-y-6">
            <div className="bg-[#121217] border border-[#242432] rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="font-['Cinzel'] font-bold text-lg text-white pb-3 border-b border-[#20202c]">
                Boutique Headquarters
              </h3>

              <div className="space-y-5 text-xs text-gray-300">
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-[#2dd4bf] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Flagship Atelier</span>
                    <span>{BRAND_CONFIG.contact.address}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone size={18} className="text-[#2dd4bf] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Direct Concierge</span>
                    <span>{BRAND_CONFIG.contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail size={18} className="text-[#2dd4bf] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Electronic Mail</span>
                    <span>{BRAND_CONFIG.contact.email}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock size={18} className="text-[#2dd4bf] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Hours of Reception</span>
                    <span>{BRAND_CONFIG.contact.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Atelier Visit Banner */}
            <div className="bg-[#181822] border border-[#2dd4bf]/30 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-[#2dd4bf]">
                <Calendar size={18} />
                <span className="text-xs uppercase tracking-widest font-semibold">Private Viewing Salon</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Private appointments are available in our New York, Geneva, and London reception suites. Complimentary champagne and horological consultation included.
              </p>
            </div>
          </div>

          {/* Right: Interactive Concierge Message Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#121217] border border-[#242432] rounded-2xl p-6 sm:p-10 shadow-2xl">
              <h2 className="font-['Cinzel'] font-bold text-xl text-white mb-2">
                Transmit a Message to the Atelier
              </h2>
              <p className="text-xs text-gray-400 mb-8">
                Responses are provided within 4 hours by a senior horological advisor.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#1c1c28] border border-[#2dd4bf] mx-auto flex items-center justify-center text-[#2dd4bf]">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-['Cinzel'] text-xl font-bold text-white">Inquiry Received</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Thank you, {formData.name}. Our private concierge team has received your communication and will contact you promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Lord / Lady / Mr. / Ms."
                        className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="patron@example.com"
                        className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">Inquiry Nature</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2dd4bf] cursor-pointer"
                      >
                        <option value="Timepiece Acquisition Inquiry">Timepiece Acquisition Inquiry</option>
                        <option value="Private Atelier Appointment">Private Atelier Appointment</option>
                        <option value="Bespoke Horological Commission">Bespoke Horological Commission</option>
                        <option value="Chronometer Servicing & Warranty">Chronometer Servicing & Warranty</option>
                        <option value="Press & Institutional Relations">Press & Institutional Relations</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">Message Details</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Please specify any specific references, questions, or appointment preferences..."
                      className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#2dd4bf]/20"
                  >
                    <Send size={15} />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;

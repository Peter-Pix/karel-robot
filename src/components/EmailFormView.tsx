import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Briefcase, ShoppingBag, Wifi, Sparkles, Send, PenLine } from 'lucide-react';
import { EmailInput } from '../types';
import { generateTemplate, CompanyIndustry, EmailIntent } from '../lib/templateGenerator';

interface EmailFormViewProps {
  initialData?: EmailInput;
  onSubmit: (data: EmailInput) => void;
}

export function EmailFormView({ initialData, onSubmit }: EmailFormViewProps) {
  const [industry, setIndustry] = useState<CompanyIndustry>('eshop');
  const [customMode, setCustomMode] = useState(false);
  
  const [formData, setFormData] = useState<EmailInput>({
    sender: initialData?.sender || '',
    subject: initialData?.subject || '',
    body: initialData?.body || '',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const handleTemplateClick = (intent: EmailIntent) => {
    setCustomMode(false);
    const template = generateTemplate(industry, intent);
    setFormData({
      sender: template.sender,
      subject: template.subject,
      body: template.body,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.body.trim()) return;
    
    onSubmit({
      sender: formData.sender || 'Zákazník <zakaznik@email.cz>',
      subject: formData.subject.trim(),
      body: formData.body.trim(),
    });
  };

  const industries: { id: CompanyIndustry, label: string, icon: React.ReactNode }[] = [
    { id: 'eshop', label: 'E-shop', icon: <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'telco', label: 'Telco & ISP', icon: <Wifi className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'b2b', label: 'B2B Služby', icon: <Briefcase className="w-4 h-4 md:w-5 md:h-5" /> }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto px-6 pb-24"
    >
      <motion.div variants={itemVariants} className="text-center mb-12 mt-8">
        <span className="text-gray-900 dark:text-gray-100 font-semibold tracking-wide text-sm uppercase mb-3 block">
          E-mail přijde. Karel to zařídí.
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
          Nekonečno reálných scénářů
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Rozpozná zákazníka, pochopí požadavek a připraví další krok.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-6 mb-12 overflow-x-auto no-scrollbar max-w-2xl mx-auto md:justify-center border-b border-gray-100 dark:border-gray-800 pb-px">
        {industries.map(ind => (
          <button
            key={ind.id}
            onClick={() => {
              setIndustry(ind.id);
              if (!customMode && formData.subject) handleTemplateClick('query');
            }}
            className={`relative flex-none md:flex-1 max-w-[120px] flex items-center justify-center gap-2 pb-4 text-sm font-medium transition-colors outline-none whitespace-nowrap ${
              industry === ind.id 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {ind.icon}
            {ind.label}
            {industry === ind.id && (
              <motion.div 
                layoutId="activeIndustry"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
              />
            )}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-4 md:gap-8 items-center justify-center mb-12">
          <button
            type="button"
            onClick={() => handleTemplateClick('query')}
            className={`flex items-center gap-2 text-sm md:text-base font-medium transition-colors outline-none ${!customMode && formData.subject && formData.subject.includes('Dotaz') ? 'text-gray-900 dark:text-brand' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Sparkles className={`w-4 h-4 ${!customMode && formData.subject && formData.subject.includes('Dotaz') ? 'animate-pulse' : ''}`} />
            Dotaz
          </button>
          <button
            type="button"
            onClick={() => handleTemplateClick('complaint')}
            className={`flex items-center gap-2 text-sm md:text-base font-medium transition-colors outline-none ${!customMode && formData.subject && formData.subject.includes('Reklamace') ? 'text-gray-900 dark:text-brand' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Sparkles className={`w-4 h-4 ${!customMode && formData.subject && formData.subject.includes('Reklamace') ? 'animate-pulse' : ''}`} />
            Stížnost
          </button>
          <button
            type="button"
            onClick={() => handleTemplateClick('escalation')}
            className={`flex items-center gap-2 text-sm md:text-base font-medium transition-colors outline-none ${!customMode && formData.subject && formData.subject.includes('Zrušení') ? 'text-gray-900 dark:text-brand' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Sparkles className={`w-4 h-4 ${!customMode && formData.subject && formData.subject.includes('Zrušení') ? 'animate-pulse' : ''}`} />
            Požadavek
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              setFormData({ sender: '', subject: '', body: '' });
            }}
            className={`flex items-center gap-2 text-sm md:text-base font-medium transition-colors outline-none ${customMode ? 'text-gray-900 dark:text-brand' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <PenLine className="w-4 h-4" />
            Vlastní
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-0 sm:px-6">
          <AnimatePresence mode="popLayout">
            {(formData.subject || formData.body || customMode) ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="group relative">
                  <input
                    type="text"
                    id="sender"
                    value={formData.sender}
                    onChange={(e) => setFormData({...formData, sender: e.target.value})}
                    placeholder=" "
                    className="block w-full px-0 py-3 md:py-4 bg-transparent border-0 border-b border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-gray-900 dark:focus:border-brand text-lg md:text-xl text-gray-900 dark:text-gray-100 font-light transition-colors peer placeholder-transparent"
                  />
                  <label htmlFor="sender" className="absolute left-0 -top-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:font-light peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 md:peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-gray-900 dark:peer-focus:text-brand cursor-text">
                    Odesílatel <span className="lowercase font-normal opacity-60">(nepovinné)</span>
                  </label>
                </div>
                
                <div className="group relative">
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder=" "
                    className="block w-full px-0 py-3 md:py-4 bg-transparent border-0 border-b border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-gray-900 dark:focus:border-brand text-xl md:text-2xl text-gray-900 dark:text-gray-100 font-medium transition-colors peer placeholder-transparent"
                    required
                  />
                  <label htmlFor="subject" className="absolute left-0 -top-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-xl md:peer-placeholder-shown:text-2xl peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 md:peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-gray-900 dark:peer-focus:text-brand cursor-text">
                    Předmět zprávy
                  </label>
                </div>
                
                <div className="group relative pt-4">
                  <textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    placeholder=" "
                    rows={8}
                    className="block w-full px-0 py-3 md:py-4 bg-transparent border-0 border-b border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-gray-900 dark:focus:border-brand text-lg md:text-xl text-gray-900 dark:text-gray-100 font-light resize-y leading-relaxed transition-colors peer placeholder-transparent"
                    required
                  />
                  <label htmlFor="body" className="absolute left-0 top-0 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-lg md:peer-placeholder-shown:text-xl peer-placeholder-shown:font-light peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-8 peer-focus:top-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-gray-900 dark:peer-focus:text-brand cursor-text">
                    Tělo e-mailu
                  </label>
                </div>
                
                <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-0">
                  <p className="text-sm text-gray-400 text-center sm:text-left font-light">
                    {customMode ? 'Vyplňte vlastní text a nechte Karla pracovat.' : 'Vyberte jinou šablonu pro náhodnou variantu.'}
                  </p>
                  <button
                    type="submit"
                    disabled={!formData.subject.trim() || !formData.body.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 dark:shadow-white/5 focus:ring-4 focus:ring-gray-900/20 dark:focus:ring-white/20 outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-lg"
                  >
                    Odeslat e-mail
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700"
              >
                <Mail className="w-12 h-12 mb-6 opacity-50" />
                <p className="text-xl font-light text-gray-500 dark:text-gray-400">Vyberte šablonu nahoře</p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </motion.div>
  );
}

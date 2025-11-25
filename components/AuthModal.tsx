
import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, MapPin, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: any) => Promise<void>;
  onRegister: (data: any) => Promise<void>;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, language }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    village: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Translations for the modal
  const t = {
    [Language.ENGLISH]: {
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email Address",
      password: "Password",
      name: "Full Name",
      village: "Village Name",
      submit: isSignUp ? "Create Account" : "Sign In",
      toggle: isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up",
      error: "Please fill in all fields",
      welcome: isSignUp ? "Join GrameenConnect" : "Welcome Back"
    },
    [Language.HINDI]: {
      signIn: "साइन इन",
      signUp: "साइन अप",
      email: "ईमेल पता",
      password: "पासवर्ड",
      name: "पूरा नाम",
      village: "गाँव का नाम",
      submit: isSignUp ? "खाता बनाएं" : "साइन इन करें",
      toggle: isSignUp ? "क्या आपके पास पहले से खाता है? साइन इन करें" : "खाता नहीं है? साइन अप करें",
      error: "कृपया सभी फ़ील्ड भरें",
      welcome: isSignUp ? "ग्रामीण कनेक्ट से जुड़ें" : "वापसी पर स्वागत है"
    },
    [Language.TELUGU]: {
      signIn: "సైన్ ఇన్",
      signUp: "సైన్ అప్",
      email: "ఇమెయిల్",
      password: "పాస్వర్డ్",
      name: "పూర్తి పేరు",
      village: "గ్రామం పేరు",
      submit: isSignUp ? "ఖాతా సృష్టించండి" : "సైన్ ఇన్",
      toggle: isSignUp ? "ఖాతా ఉందా? సైన్ ఇన్ చేయండి" : "ఖాతా లేదా? సైన్ అప్ చేయండి",
      error: "దయచేసి అన్ని వివరాలను పూరించండి",
      welcome: isSignUp ? "గ్రామీణ్ కనెక్ట్‌లో చేరండి" : "స్వాగతం"
    },
    [Language.TAMIL]: {
      signIn: "உள்நுழைக",
      signUp: "பதிவு செய்க",
      email: "மின்னஞ்சல் முகவரி",
      password: "கடவுச்சொல்",
      name: "முழு பெயர்",
      village: "கிராமத்தின் பெயர்",
      submit: isSignUp ? "கணக்கை உருவாக்கு" : "உள்நுழைக",
      toggle: isSignUp ? "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக" : "கணக்கு இல்லையா? பதிவு செய்க",
      error: "தயவுசெய்து அனைத்து தகவல்களையும் நிரப்பவும்",
      welcome: isSignUp ? "GrameenConnect இல் சேரவும்" : "மீண்டும் வருக"
    },
    [Language.MALAYALAM]: {
      signIn: "സൈൻ ഇൻ",
      signUp: "സൈൻ അപ്പ്",
      email: "ഇമെയിൽ വിലാസം",
      password: "പാസ്‌വേഡ്",
      name: "മുഴുവൻ പേര്",
      village: "ഗ്രാമത്തിൻ്റെ പേര്",
      submit: isSignUp ? "അക്കൗണ്ട് സൃഷ്ടിക്കുക" : "സൈൻ ഇൻ",
      toggle: isSignUp ? "അക്കൗണ്ട് ഉണ്ടോ? സൈൻ ഇൻ" : "അക്കൗണ്ട് ഇല്ലേ? സൈൻ അപ്പ്",
      error: "ദയവായി എല്ലാ വിവരങ്ങളും നൽകുക",
      welcome: isSignUp ? "GrameenConnect-ൽ ചേരുക" : "സ്വാഗതം"
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError(t.error);
      return;
    }
    if (isSignUp && (!formData.name || !formData.village)) {
      setError(t.error);
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await onRegister(formData);
      } else {
        await onLogin(formData);
      }
      onClose();
      // Reset form on success
      setFormData({ email: '', password: '', name: '', village: '' });
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-600 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-2xl font-bold">{t.welcome}</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {isSignUp ? "Empowering you digitally." : "Access your dashboard."}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-emerald-500/50 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">{t.name}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={t.name}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">{t.village}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.village}
                    onChange={e => setFormData({...formData, village: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={t.village}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            disabled={isLoading}
            className="mt-6"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : t.submit}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              {t.toggle}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

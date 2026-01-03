import React, { useState, useEffect, useRef } from 'react';
import { Check, Volume2, Shield, Clock, Users, Terminal, Sword, AlertTriangle, Loader2, Image as ImageIcon, X } from 'lucide-react';

// --- CONFIGURATION ---
const DISCORD_WEBHOOK_URL = "/api/discord"; 
// Replace this URL with your uploaded image link if you host it, or convert your image to Base64
const BACKGROUND_IMAGE = "https://media.discordapp.net/attachments/306349104295051265/1456900028592558180/2026-01-01_11.09.11.png?ex=695a0b62&is=6958b9e2&hm=28e9107864baddf6f5902cb0095d1bf3d8220e1e038f8383a1f336bda9cbaa71&=&format=webp&quality=lossless";

// --- Assets & Styles ---
const MINECRAFT_FONT = "'VT323', monospace";

// Custom Animation Styles via Tailwind & Inline
const STYLES = {
  // REMOVED: Flat/Gradient background classes (now handled by the main container)
  panel: "bg-[#bdc3c7]/95 border-t-4 border-l-4 border-[#ecf0f1] border-b-4 border-r-4 border-[#7f8c8d] shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-blur-sm", 
  panelDark: "bg-[#2c1b18] border-2 border-[#c0392b]",
  button: "bg-[#7f8c8d] hover:bg-[#95a5a6] active:bg-[#586465] border-t-2 border-l-2 border-[#bdc3c7] border-b-2 border-r-2 border-[#2c3e50] text-white font-bold transition-all active:border-t-[#2c3e50] active:border-l-[#2c3e50] active:border-b-[#bdc3c7] active:border-r-[#bdc3c7] active:translate-y-1",
  buttonPrimary: "bg-[#c0392b] hover:bg-[#d94e41] active:bg-[#962d22] border-t-2 border-l-2 border-[#e74c3c] border-b-2 border-r-2 border-[#641e16] text-white font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-1 active:shadow-none",
  input: "bg-[#1a1210]/90 border-2 border-[#7f8c8d] text-[#ecf0f1] p-2 font-mono outline-none focus:border-[#c0392b] focus:scale-[1.01] focus:shadow-[0_0_10px_rgba(192,57,43,0.3)] transition-all duration-200 placeholder-opacity-50 placeholder-gray-500",
  label: "text-[#2c3e50] font-bold text-lg mb-1 block",
};

// --- Components ---

const MCButton = ({ children, onClick, variant = 'default', className = '', type = 'button', disabled = false }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      ${variant === 'primary' ? STYLES.buttonPrimary : STYLES.button}
      px-6 py-3 text-xl uppercase tracking-wider relative flex items-center justify-center gap-2
      ${className}
    `}
    style={{ fontFamily: MINECRAFT_FONT }}
  >
    {children}
  </button>
);

const SectionHeader = ({ icon: Icon, title, delay }: any) => (
  <div 
    className="flex items-center gap-3 mb-6 border-b-4 border-[#7f8c8d] pb-2 mt-8 animate-in slide-in-from-left-4 fade-in duration-700 fill-mode-both"
    style={{ animationDelay: delay }}
  >
    <div className="bg-[#c0392b] p-2 border-2 border-[#641e16] shadow-sm transform transition-transform hover:rotate-12 hover:scale-110">
      <Icon size={24} color="white" />
    </div>
    <h2 className="text-3xl font-bold text-[#2c3e50] uppercase drop-shadow-sm" style={{ fontFamily: MINECRAFT_FONT }}>
      {title}
    </h2>
  </div>
);

const RadioGroup = ({ label, name, options, value, onChange }: any) => (
  <div className="mb-6 group">
    <label className={`${STYLES.label} group-hover:text-[#c0392b] transition-colors`} style={{ fontFamily: MINECRAFT_FONT }}>{label}</label>
    <div className="flex flex-col gap-2">
      {options.map((option: string) => (
        <label key={option} className="flex items-center gap-3 cursor-pointer group/item transition-transform hover:translate-x-2 duration-200">
          <div className={`w-6 h-6 border-2 border-[#2c3e50] flex items-center justify-center transition-colors duration-200 ${value === option ? 'bg-[#c0392b]' : 'bg-[#7f8c8d]'}`}>
             {value === option && <div className="w-3 h-3 bg-white animate-bounce-in" />}
          </div>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(name, e.target.value)}
            className="hidden"
          />
          <span className={`text-lg transition-colors ${value === option ? 'text-[#c0392b] font-bold' : 'text-[#2c3e50] group-hover/item:text-[#c0392b]'}`} style={{ fontFamily: MINECRAFT_FONT }}>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup = ({ label, name, options, values = [], onChange }: any) => {
    const handleCheck = (option: string) => {
        const newValues = values.includes(option)
            ? values.filter((v: string) => v !== option)
            : [...values, option];
        onChange(name, newValues);
    };

    return (
        <div className="mb-6 group">
            <label className={`${STYLES.label} group-hover:text-[#c0392b] transition-colors`} style={{ fontFamily: MINECRAFT_FONT }}>{label}</label>
            <div className="flex flex-col gap-2">
                {options.map((option: string) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group/item transition-transform hover:translate-x-2 duration-200">
                        <div className={`w-6 h-6 border-2 border-[#2c3e50] flex items-center justify-center transition-colors duration-200 ${values.includes(option) ? 'bg-[#c0392b]' : 'bg-[#7f8c8d]'}`}>
                            {values.includes(option) && <Check size={16} color="white" className="animate-in zoom-in duration-200" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={values.includes(option)}
                            onChange={() => handleCheck(option)}
                            className="hidden"
                        />
                        <span className={`text-lg transition-colors ${values.includes(option) ? 'text-[#c0392b] font-bold' : 'text-[#2c3e50] group-hover/item:text-[#c0392b]'}`} style={{ fontFamily: MINECRAFT_FONT }}>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const TextInput = ({ label, name, value, onChange, placeholder = '', multiline = false, required = false }: any) => (
  <div className="mb-6 group">
    <label className={`${STYLES.label} group-hover:text-[#c0392b] transition-colors`} style={{ fontFamily: MINECRAFT_FONT }}>
      {label} {required && <span className="text-[#c0392b] animate-pulse">*</span>}
    </label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`${STYLES.input} w-full h-24 resize-y text-lg`}
        style={{ fontFamily: MINECRAFT_FONT }}
      />
    ) : (
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`${STYLES.input} w-full text-lg`}
        style={{ fontFamily: MINECRAFT_FONT }}
      />
    )}
  </div>
);

// --- Main Application ---

export default function IronBarkApp() {
  const [formData, setFormData] = useState({
    discordName: '',
    ign: '',
    timezone: '', 
    ageGroup: '',
    voiceChat: '',
    newServerBehavior: '',
    petPeeves: '',
    disagreement: '',
    riskTolerance: '',
    earlyGameScenario: '',
    playstyleStrategy: '',
    playstyleWhy: '',
    socialPref: '',
    hoursPerWeek: '',
    sessionStyle: '',
    longevity: '',
    baseAlteration: '',
    economy: '',
    altruism: '',
    altruismWhy: '',
    humor: [] as string[],
    lines: '',
    banned: '',
    antiPersona: '',
    badHabit: '',
    seriousness: 5,
    seriousnessWhy: '',
    finalVibeQuestion: 'A',
    finalVibeAnswer: ''
  });

  // State for image handling
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const handleChange = (name: string, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation: limit to images and size (e.g., 5MB)
      if (file.size > 8 * 1024 * 1024) {
        alert("File too large! Keep it under 8MB.");
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateReport = () => {
    return `
=== IRON BARK SMP APPLICATION ===
Discord: ${formData.discordName}
IGN: ${formData.ign}
Timezone/Country: ${formData.timezone}
Age Group: ${formData.ageGroup}

[SOCIAL]
- Voice: ${formData.voiceChat}
- New Server: ${formData.newServerBehavior}
- Reaction to Disagreement: ${formData.disagreement}
- Pet Peeves: ${formData.petPeeves}

[PLAYSTYLE]
- Risk: ${formData.riskTolerance}
- Early Game: ${formData.earlyGameScenario}
- Strategy: ${formData.playstyleStrategy}
- Why: ${formData.playstyleWhy}
- Social: ${formData.socialPref}

[COMMITMENT]
- Hours: ${formData.hoursPerWeek}
- Sessions: ${formData.sessionStyle}
- Retention: ${formData.longevity}

[ETHICS]
- Base Alteration: ${formData.baseAlteration}
- Economy: ${formData.economy}
- Altruism: ${formData.altruism} (${formData.altruismWhy})

[PERSONALITY]
- Humor: ${formData.humor.join(', ')}
- Limits: ${formData.lines}
- Banned?: ${formData.banned}
- Bad Habit: ${formData.badHabit}
- Seriousness: ${formData.seriousness}/10 (${formData.seriousnessWhy})

[VIBE CHECK]
Question ${formData.finalVibeQuestion}: ${formData.finalVibeAnswer}

[ATTACHMENT]
Image: ${screenshot ? screenshot.name : 'None'}
    `.trim();
  };

  const sendToWebhook = async () => {
    setStatus('sending');

    // Create Discord Embed Object
    const embed = {
      title: "🛡️ New Iron Bark SMP Application",
      description: `**IGN:** \`${formData.ign}\`\n**Discord:** \`${formData.discordName}\``,
      color: 12604715, // Rust Red (Hex #C0392B converted to decimal)
      fields: [
        {
          name: "📍 Demographics",
          value: `**Age:** ${formData.ageGroup}\n**Timezone/Country:** ${formData.timezone}`,
          inline: true
        },
        {
          name: "🗣️ Social & Voice",
          value: `**Voice:** ${formData.voiceChat}\n**New Server:** ${formData.newServerBehavior}\n**Disagreements:** ${formData.disagreement}\n**Peeves:** ${formData.petPeeves}`,
          inline: false
        },
        {
          name: "⚔️ Playstyle",
          value: `**Risk:** ${formData.riskTolerance}\n**Strategy:** ${formData.playstyleStrategy}\n**Why:** ${formData.playstyleWhy}\n**Early Game:** ${formData.earlyGameScenario}`,
          inline: false
        },
        {
          name: "⏳ Commitment",
          value: `**Hours:** ${formData.hoursPerWeek}\n**Sessions:** ${formData.sessionStyle}\n**Longevity:** ${formData.longevity}`,
          inline: true
        },
        {
          name: "🤝 Cooperation",
          value: `**Base Alt:** ${formData.baseAlteration}\n**Economy:** ${formData.economy}\n**Altruism:** ${formData.altruism}\n*(${formData.altruismWhy})*`,
          inline: true
        },
        {
          name: "🎭 Personality",
          value: `**Humor:** ${formData.humor.join(', ')}\n**Limits:** ${formData.lines}\n**Banned:** ${formData.banned}\n**Bad Habit:** ${formData.badHabit}`,
          inline: false
        },
        {
          name: "🧠 Vibe Check",
          value: `**Seriousness:** ${formData.seriousness}/10\n*${formData.seriousnessWhy}*\n\n**Question ${formData.finalVibeQuestion}:**\n${formData.finalVibeAnswer}`,
          inline: false
        }
      ],
      // If we have an image, we can try to reference it in the embed if we use multipart/form-data
      // image: screenshot ? { url: `attachment://${screenshot.name}` } : undefined,
      footer: {
        text: "Iron Bark Application System • React to Vote"
      },
      timestamp: new Date().toISOString()
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      let body: any;
      let headers: any = {};

      if (screenshot) {
        // If there is a file, we MUST use FormData to send it to Discord
        const formDataPayload = new FormData();
        // The JSON payload must be sent as a string under the 'payload_json' key
        formDataPayload.append('payload_json', JSON.stringify({
           content: "A new traveller seeks entry! @everyone (Vote below)",
           embeds: [embed]
        }));
        // Attach the file
        formDataPayload.append('file', screenshot);
        
        body = formDataPayload;
        // Do NOT set Content-Type header for FormData; the browser sets it with the boundary
      } else {
        // Standard JSON payload
        body = JSON.stringify({
          content: "A new traveller seeks entry! @everyone (Vote below)",
          embeds: [embed]
        });
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && (responseData.success !== false)) {
        setStatus('success');
      } else {
        if (response.status === 500) {
          setStatus('success');
        } else {
          // If 400 Bad Request, it might be the proxy failing to handle FormData
          throw new Error(responseData.error || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToWebhook();
  };

  const handleCopy = () => {
    const report = generateReport();
    try {
        navigator.clipboard.writeText(report);
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = report;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen relative font-sans pb-32 overflow-x-hidden`}>
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      
      {/* BACKGROUND IMAGE CONTAINER */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
            backgroundImage: `url(${BACKGROUND_IMAGE})`,
            filter: 'blur(4px) brightness(0.4)'
        }}
      />
      
      {/* Global CSS for custom keyframes that Tailwind doesn't have by default */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-in { animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .slide-up-content { animation: slide-up 0.6s ease-out forwards; opacity: 0; }
        
        /* Custom scrollbar for textareas */
        textarea::-webkit-scrollbar { width: 12px; }
        textarea::-webkit-scrollbar-track { background: #2c1b18; border: 2px solid #7f8c8d; }
        textarea::-webkit-scrollbar-thumb { background: #7f8c8d; border: 2px solid #bdc3c7; }
        textarea::-webkit-scrollbar-thumb:hover { background: #95a5a6; }
      `}</style>

      {/* Header */}
      <div className={`max-w-3xl mx-auto mb-12 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="animate-float">
            <h1 className="text-6xl md:text-8xl text-[#c0392b] mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-widest" style={{ fontFamily: MINECRAFT_FONT }}>
            IRON BARK
            </h1>
            <div className="inline-block bg-[#c0392b] text-white px-4 py-1 transform -rotate-2 border-2 border-[#ecf0f1] shadow-lg hover:rotate-0 transition-transform duration-300">
                <p className="text-2xl font-bold uppercase" style={{ fontFamily: MINECRAFT_FONT }}>
                SMP Application
                </p>
            </div>
        </div>
      </div>

      {/* Form Container */}
      <form 
        onSubmit={handleSubmit} 
        className={`max-w-3xl mx-auto ${STYLES.panel} p-6 md:p-10 relative slide-up-content`}
        style={{ animationDelay: '0.2s' }}
      >
        {/* Decorative corner bolts */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d] shadow-sm"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d] shadow-sm"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d] shadow-sm"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d] shadow-sm"></div>

        {/* Intro */}
        <div className="text-center mb-8 border-b-4 border-[#7f8c8d] pb-6 bg-[#ecf0f1]/90 p-6 rounded-sm border-2 border-[#bdc3c7] hover:bg-[#ecf0f1] transition-colors duration-300">
          <p className="text-xl text-[#2c3e50] mb-4" style={{ fontFamily: MINECRAFT_FONT }}>
            Welcome, traveler. Fill out this parchment to request entry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
             <TextInput 
                label="Discord Username" 
                name="discordName" 
                value={formData.discordName} 
                onChange={handleChange} 
                placeholder="username#0000" 
                required 
             />
             <TextInput 
                label="Minecraft IGN" 
                name="ign" 
                value={formData.ign} 
                onChange={handleChange} 
                placeholder="Steve" 
                required 
             />
             
             {/* UPDATED FIELDS */}
             <TextInput 
                label="Timezone / Country" 
                name="timezone" 
                value={formData.timezone} 
                onChange={handleChange} 
                placeholder="EST (USA) / GMT+2 (Germany)" 
                required 
             />
             <div className="mb-6 group">
                <label className={`${STYLES.label} group-hover:text-[#c0392b] transition-colors`} style={{ fontFamily: MINECRAFT_FONT }}>Age Group <span className="text-[#c0392b] animate-pulse">*</span></label>
                <div className="flex flex-wrap gap-2">
                   {['<16', '16-18', '19-25', '25+'].map((opt) => (
                      <label key={opt} className={`cursor-pointer px-3 py-1 border-2 ${formData.ageGroup === opt ? 'bg-[#c0392b] border-[#641e16] text-white' : 'bg-[#7f8c8d] border-[#2c3e50] text-[#2c3e50]'} font-bold transition-all hover:scale-105`} style={{ fontFamily: MINECRAFT_FONT }}>
                         <input 
                            type="radio" 
                            name="ageGroup" 
                            value={opt} 
                            checked={formData.ageGroup === opt} 
                            onChange={(e) => handleChange('ageGroup', e.target.value)}
                            className="hidden"
                         />
                         {opt}
                      </label>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* --- Social --- */}
        <SectionHeader icon={Volume2} title="Voice & Social" delay="0.3s" />
        
        <RadioGroup
          label="How talkative are you on voice chat?"
          name="voiceChat"
          value={formData.voiceChat}
          onChange={handleChange}
          options={["Silent lurker", "Occasional call-outs", "Regular chatter", "Chronically online menace"]}
        />

        <RadioGroup
          label="When you join a new server, do you usually:"
          name="newServerBehavior"
          value={formData.newServerBehavior}
          onChange={handleChange}
          options={["Stick solo for a while", "Slowly integrate", "Immediately look for a group", "Accidentally become mayor"]}
        />

        <TextInput
          label="What annoys you most about multiplayer servers? (This reveals everything.)"
          name="petPeeves"
          value={formData.petPeeves}
          onChange={handleChange}
          multiline
        />

        <TextInput
          label="How do you usually react when someone disagrees with you in-game?"
          name="disagreement"
          value={formData.disagreement}
          onChange={handleChange}
          multiline
        />

        {/* --- Playstyle --- */}
        <SectionHeader icon={Sword} title="Playstyle & Decisions" delay="0.4s" />

        <RadioGroup
          label="Pick the statement that fits you best:"
          name="riskTolerance"
          value={formData.riskTolerance}
          onChange={handleChange}
          options={['"Slow, safe, methodical — I hate dying"', '"Calculated risks are worth it"', '"Send it, I\'ll recover"', '"Death is content"']}
        />

        <TextInput
          label="Early game choice: You spawn near a cave at night with iron tools. What do you do?"
          name="earlyGameScenario"
          value={formData.earlyGameScenario}
          onChange={handleChange}
          multiline
        />

        <RadioGroup
          label="Are you more likely to:"
          name="playstyleStrategy"
          value={formData.playstyleStrategy}
          onChange={handleChange}
          options={["Build a safe base early", "Rush progression", "Farm + trade", "Explore aggressively"]}
        />
        <TextInput
          label="Explain why you chose the above:"
          name="playstyleWhy"
          value={formData.playstyleWhy}
          onChange={handleChange}
          placeholder="Justify your strategy..."
        />

        <RadioGroup
          label="Do you prefer playing:"
          name="socialPref"
          value={formData.socialPref}
          onChange={handleChange}
          options={["Alone", "With 1–2 close players", "In a larger group", "Depends on the server"]}
        />

        {/* --- Commitment --- */}
        <SectionHeader icon={Clock} title="Time & Consistency" delay="0.5s" />

        <RadioGroup
          label="Realistically, how many hours can you play per week?"
          name="hoursPerWeek"
          value={formData.hoursPerWeek}
          onChange={handleChange}
          options={["<5", "5–10", "10–20", "20+"]}
        />

        <RadioGroup
          label="Do you play:"
          name="sessionStyle"
          value={formData.sessionStyle}
          onChange={handleChange}
          options={["Short frequent sessions", "Long grind sessions", "Completely random times"]}
        />

        <TextInput
          label="How long do you usually stick around on a server before losing interest?"
          name="longevity"
          value={formData.longevity}
          onChange={handleChange}
          multiline
        />

        {/* --- Cooperation --- */}
        <SectionHeader icon={Shield} title="Cooperation & Trust" delay="0.6s" />

        <TextInput
          label="If you log in and someone has slightly altered your base without asking, what's your reaction?"
          name="baseAlteration"
          value={formData.baseAlteration}
          onChange={handleChange}
          multiline
        />

        <TextInput
          label="What's your opinion on shared resources vs personal storage?"
          name="economy"
          value={formData.economy}
          onChange={handleChange}
          multiline
        />

        <RadioGroup
          label="Would you rather:"
          name="altruism"
          value={formData.altruism}
          onChange={handleChange}
          options={["Help a struggling player and slow your progress", "Focus on your own survival first"]}
        />
        <TextInput
          label="Explain why:"
          name="altruismWhy"
          value={formData.altruismWhy}
          onChange={handleChange}
          placeholder="Reasoning..."
        />

        {/* --- Humor & Limits --- */}
        <SectionHeader icon={Users} title="Humor & Chaos" delay="0.7s" />

        <CheckboxGroup
          label="What kind of humor do you bring? (Select all that apply)"
          name="humor"
          value={formData.humor}
          onChange={handleChange}
          options={["Dry", "Dark", "Dumb", "Wholesome", "Unhinged (within reason)"]}
        />

        <TextInput
          label="What crosses the line for you in jokes or pranks?"
          name="lines"
          value={formData.lines}
          onChange={handleChange}
          multiline
        />

        <TextInput
          label="Have you ever been banned or kicked from a server? If yes — why?"
          name="banned"
          value={formData.banned}
          onChange={handleChange}
          multiline
        />

        {/* --- Self Awareness --- */}
        <SectionHeader icon={Terminal} title="Elite Filter (Self-Awareness)" delay="0.8s" />

        <TextInput
          label="What kind of player do you not get along with?"
          name="antiPersona"
          value={formData.antiPersona}
          onChange={handleChange}
          multiline
        />

        <TextInput
          label="What's a bad habit you have in multiplayer?"
          name="badHabit"
          value={formData.badHabit}
          onChange={handleChange}
          multiline
        />
        
        {/* --- SHOWCASE SECTION --- */}
        <SectionHeader icon={ImageIcon} title="Showcase" delay="0.85s" />
        <div className="mb-6">
          <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>
            Show us something you've built or a cool screenshot:
          </label>
          
          <div className="relative group cursor-pointer">
            <input
              type="file"
              ref={fileInputRef}
              accept=".png, .jpg, .jpeg"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {screenshotPreview ? (
              <div className="relative w-full max-w-md mx-auto mt-4 border-4 border-[#2c3e50] bg-[#1a1210] shadow-lg transform transition-transform group-hover:scale-[1.02]">
                <img 
                  src={screenshotPreview} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[400px] object-contain" 
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                  className="absolute -top-3 -right-3 bg-[#c0392b] text-white p-1 border-2 border-[#fff] shadow-md hover:bg-[#e74c3c]"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs truncate font-mono">
                  {screenshot?.name}
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-4 border-dashed border-[#7f8c8d] bg-[#1a1210]/50 flex flex-col items-center justify-center gap-2 hover:bg-[#1a1210]/80 hover:border-[#c0392b] transition-all duration-300 rounded-sm"
              >
                <ImageIcon size={48} className="text-[#7f8c8d] group-hover:text-[#c0392b] transition-colors" />
                <p className="text-[#ecf0f1] text-lg opacity-80" style={{ fontFamily: MINECRAFT_FONT }}>
                  Click or Drop Image Here (optional)
                </p>
                <p className="text-[#7f8c8d] text-sm">Max 8MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 group mt-8">
           <label className={`${STYLES.label} group-hover:text-[#c0392b] transition-colors`} style={{ fontFamily: MINECRAFT_FONT }}>On a scale of 1–10, how seriously do you take Minecraft?</label>
           <input 
             type="range" 
             min="1" 
             max="10" 
             value={formData.seriousness} 
             onChange={(e) => handleChange('seriousness', parseInt(e.target.value))}
             className="w-full accent-[#c0392b] cursor-pointer h-4 bg-[#7f8c8d] appearance-none rounded-none border-2 border-[#2c3e50] mb-2 hover:bg-[#95a5a6] transition-colors"
           />
           <div className="text-center font-bold text-2xl mb-2 text-[#c0392b] animate-bounce" style={{ fontFamily: MINECRAFT_FONT }}>{formData.seriousness}</div>
           <TextInput
            label="What makes it a good experience for you?"
            name="seriousnessWhy"
            value={formData.seriousnessWhy}
            onChange={handleChange}
            multiline
          />
        </div>

        {/* --- Final Vibe --- */}
        <SectionHeader icon={AlertTriangle} title="Final Vibe Question" delay="0.9s" />

        <div className="mb-6">
           <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>Pick one of these — they're brutal in a quiet way:</label>
           <select 
             value={formData.finalVibeQuestion} 
             onChange={(e) => handleChange('finalVibeQuestion', e.target.value)}
             className={`${STYLES.input} w-full mb-4 cursor-pointer hover:bg-[#2c2c2c]`}
             style={{ fontFamily: MINECRAFT_FONT }}
           >
             <option value="A">A. "Describe your ideal night on the server in one paragraph."</option>
             <option value="B">B. "Why do you think some people hate hardcore servers?"</option>
             <option value="C">C. "What would make you leave this server?"</option>
           </select>
           
           <TextInput
             label="Your Answer:"
             name="finalVibeAnswer"
             value={formData.finalVibeAnswer}
             onChange={handleChange}
             multiline
           />
        </div>

        <div className="pt-8 flex justify-center">
            <MCButton 
              type="submit" 
              variant="primary" 
              className="w-full md:w-auto min-w-[200px] shadow-xl hover:scale-105 transition-all"
              disabled={status === 'sending'}
            >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Dispatching...
                  </>
                ) : 'Submit Application'}
            </MCButton>
        </div>

      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-[#ecf0f1] animate-pulse" style={{ fontFamily: MINECRAFT_FONT }}>
        <p>Iron Bark SMP © {new Date().getFullYear()}</p>
        <p className="text-sm mt-1 opacity-60">Not affiliated with Mojang AB.</p>
      </div>

      {/* Submission Modal */}
      {status === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1b18] bg-opacity-90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className={`${STYLES.panelDark} p-8 max-w-lg w-full shadow-2xl relative animate-bounce-in`}>
              <div className="absolute top-0 left-0 w-full h-2 bg-[#c0392b] animate-pulse"></div>
              
              <h2 className="text-4xl text-[#c0392b] mb-4 text-center drop-shadow-md" style={{ fontFamily: MINECRAFT_FONT }}>
                Application Sent!
              </h2>
              
              <p className="mb-6 text-xl text-[#ecf0f1]" style={{ fontFamily: MINECRAFT_FONT }}>
                Your scroll has been delivered to the council via carrier pigeon. Watch your Discord DMs.
              </p>
              
              <div className="flex flex-col gap-3">
                 <MCButton onClick={() => setStatus('idle')}>
                   Close
                 </MCButton>
              </div>
           </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1b18] bg-opacity-90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className={`${STYLES.panelDark} p-8 max-w-lg w-full shadow-2xl relative animate-bounce-in`}>
              <h2 className="text-4xl text-red-500 mb-4 text-center drop-shadow-md" style={{ fontFamily: MINECRAFT_FONT }}>
                Webhook Error!
              </h2>
              <p className="mb-6 text-xl text-[#ecf0f1]" style={{ fontFamily: MINECRAFT_FONT }}>
                 The carrier pigeon died on the way. Please copy your application manually below and paste it in Discord.
              </p>
               <div className="bg-[#1a1210] p-4 border-2 border-[#c0392b] mb-6 max-h-40 overflow-y-auto custom-scrollbar shadow-inner">
                <pre className="text-[#ecf0f1] text-xs whitespace-pre-wrap font-mono opacity-90">
                   {generateReport()}
                </pre>
              </div>
              <MCButton onClick={handleCopy} variant="primary">
                 {copied ? <span className="animate-pulse">Copied!</span> : "Copy Manually"}
              </MCButton>
               <div className="mt-4">
               <MCButton onClick={() => setStatus('idle')}>
                   Close
                 </MCButton>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}

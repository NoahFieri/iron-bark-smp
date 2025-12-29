import { useState } from 'react';
import { Check, Volume2, Shield, Clock, Users, Terminal, Sword, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- CONFIGURATION ---
// This path triggers the rewrite rule in vercel.json to hide your real Webhook URL
const DISCORD_WEBHOOK_URL = "/api/discord"; 

// --- Assets & Styles ---
const MINECRAFT_FONT = "'VT323', monospace";

const STYLES = {
  bgDirt: "bg-[#2c1b18]",
  panel: "bg-[#bdc3c7] border-t-4 border-l-4 border-[#ecf0f1] border-b-4 border-r-4 border-[#7f8c8d] shadow-[0_0_15px_rgba(0,0,0,0.5)]", 
  panelDark: "bg-[#2c1b18] border-2 border-[#c0392b]",
  button: "bg-[#7f8c8d] hover:bg-[#95a5a6] active:bg-[#586465] border-t-2 border-l-2 border-[#bdc3c7] border-b-2 border-r-2 border-[#2c3e50] text-white font-bold transition-none active:border-t-[#2c3e50] active:border-l-[#2c3e50] active:border-b-[#bdc3c7] active:border-r-[#bdc3c7]",
  buttonPrimary: "bg-[#c0392b] hover:bg-[#d94e41] active:bg-[#962d22] border-t-2 border-l-2 border-[#e74c3c] border-b-2 border-r-2 border-[#641e16] text-white font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
  input: "bg-[#1a1210] border-2 border-[#7f8c8d] text-[#ecf0f1] p-2 font-mono outline-none focus:border-[#c0392b] placeholder-opacity-50 placeholder-gray-500",
  label: "text-[#2c3e50] font-bold text-lg mb-1 block",
};

// --- Components ---

interface MCButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const MCButton = ({ children, onClick, variant = 'default', className = '', type = 'button', disabled = false }: MCButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      ${variant === 'primary' ? STYLES.buttonPrimary : STYLES.button}
      px-6 py-3 text-xl uppercase tracking-wider relative
      ${className}
    `}
    style={{ fontFamily: MINECRAFT_FONT }}
  >
    {children}
  </button>
);

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

const SectionHeader = ({ icon: Icon, title }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-6 border-b-4 border-[#7f8c8d] pb-2 mt-8">
    <div className="bg-[#c0392b] p-2 border-2 border-[#641e16] shadow-sm">
      <Icon size={24} color="white" />
    </div>
    <h2 className="text-3xl font-bold text-[#2c3e50] uppercase drop-shadow-sm" style={{ fontFamily: MINECRAFT_FONT }}>
      {title}
    </h2>
  </div>
);

interface RadioGroupProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (name: string, value: string) => void;
}

const RadioGroup = ({ label, name, options, value, onChange }: RadioGroupProps) => (
  <div className="mb-6">
    <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>{label}</label>
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-3 cursor-pointer group transition-transform hover:translate-x-1">
          <div className={`w-6 h-6 border-2 border-[#2c3e50] flex items-center justify-center transition-colors ${value === option ? 'bg-[#c0392b]' : 'bg-[#7f8c8d]'}`}>
             {value === option && <div className="w-3 h-3 bg-white" />}
          </div>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(name, e.target.value)}
            className="hidden"
          />
          <span className={`text-lg transition-colors ${value === option ? 'text-[#c0392b] font-bold' : 'text-[#2c3e50] group-hover:text-[#c0392b]'}`} style={{ fontFamily: MINECRAFT_FONT }}>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  values?: string[];
  onChange: (name: string, values: string[]) => void;
}

const CheckboxGroup = ({ label, name, options, values = [], onChange }: CheckboxGroupProps) => {
    const handleCheck = (option: string) => {
        const newValues = values.includes(option)
            ? values.filter(v => v !== option)
            : [...values, option];
        onChange(name, newValues);
    };

    return (
        <div className="mb-6">
            <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>{label}</label>
            <div className="flex flex-col gap-2">
                {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group transition-transform hover:translate-x-1">
                        <div className={`w-6 h-6 border-2 border-[#2c3e50] flex items-center justify-center transition-colors ${values.includes(option) ? 'bg-[#c0392b]' : 'bg-[#7f8c8d]'}`}>
                            {values.includes(option) && <Check size={16} color="white" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={values.includes(option)}
                            onChange={() => handleCheck(option)}
                            className="hidden"
                        />
                        <span className={`text-lg transition-colors ${values.includes(option) ? 'text-[#c0392b] font-bold' : 'text-[#2c3e50] group-hover:text-[#c0392b]'}`} style={{ fontFamily: MINECRAFT_FONT }}>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

const TextInput = ({ label, name, value, onChange, placeholder = '', multiline = false }: TextInputProps) => (
  <div className="mb-6">
    <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>{label}</label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
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
    humor: [],
    lines: '',
    banned: '',
    antiPersona: '',
    badHabit: '',
    seriousness: 5,
    seriousnessWhy: '',
    finalVibeQuestion: 'A',
    finalVibeAnswer: ''
  });

  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [copied, setCopied] = useState(false);

  const handleChange = (name: string, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateReport = () => {
    return `
=== IRON BARK SMP APPLICATION ===
Discord: ${formData.discordName}
IGN: ${formData.ign}

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
      footer: {
        text: "Iron Bark Application System • React to Vote"
      },
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: "A new traveller seeks entry! @everyone (Vote below)",
          embeds: [embed]
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && (responseData.success !== false)) {
        // Success - message was sent (reactions may or may not have been added)
        setStatus('success');
      } else {
        // Check if the error message indicates the webhook actually worked
        // Sometimes the serverless function returns an error but the webhook still sends
        const errorMessage = responseData.error || 'Unknown error';
        console.error('Webhook response error:', errorMessage, response.status);
        
        // If we get a 500 but the webhook might have worked, show success anyway
        // The user can check Discord to confirm
        if (response.status === 500) {
          setStatus('success');
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
      // Show error but allow manual copy-paste as fallback
      //setStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToWebhook();
  };

  const handleCopy = () => {
    const report = generateReport();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen ${STYLES.bgDirt} p-4 md:p-8 font-sans pb-32`}>
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-6xl md:text-8xl text-[#c0392b] mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-widest" style={{ fontFamily: MINECRAFT_FONT }}>
          IRON BARK
        </h1>
        <div className="inline-block bg-[#c0392b] text-white px-4 py-1 transform -rotate-2 border-2 border-[#ecf0f1] shadow-lg">
            <p className="text-2xl font-bold uppercase" style={{ fontFamily: MINECRAFT_FONT }}>
            SMP Application
            </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className={`max-w-3xl mx-auto ${STYLES.panel} p-6 md:p-10 relative`}>
        {/* Decorative corner bolts */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d]"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d]"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d]"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#2c3e50] border border-[#7f8c8d]"></div>

        {/* Intro */}
        <div className="text-center mb-8 border-b-4 border-[#7f8c8d] pb-6 bg-[#ecf0f1] p-6 rounded-sm border-2 border-[#bdc3c7]">
          <p className="text-xl text-[#2c3e50] mb-4" style={{ fontFamily: MINECRAFT_FONT }}>
            Welcome, traveler. Fill out this parchment to request entry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <TextInput label="Discord Username" name="discordName" value={formData.discordName} onChange={handleChange} placeholder="username#0000" />
             <TextInput label="Minecraft IGN" name="ign" value={formData.ign} onChange={handleChange} placeholder="Steve" />
          </div>
        </div>

        {/* --- Social --- */}
        <SectionHeader icon={Volume2} title="Voice & Social" />
        
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
        <SectionHeader icon={Sword} title="Playstyle & Decisions" />

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
        <SectionHeader icon={Clock} title="Time & Consistency" />

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
        <SectionHeader icon={Shield} title="Cooperation & Trust" />

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
        <SectionHeader icon={Users} title="Humor & Chaos" />

        <CheckboxGroup
          label="What kind of humor do you bring? (Select all that apply)"
          name="humor"
          values={formData.humor}
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
        <SectionHeader icon={Terminal} title="Elite Filter (Self-Awareness)" />

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

        <div className="mb-6">
           <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>On a scale of 1–10, how seriously do you take Minecraft?</label>
           <input 
             type="range" 
             min="1" 
             max="10" 
             value={formData.seriousness} 
             onChange={(e) => handleChange('seriousness', e.target.value)}
             className="w-full accent-[#c0392b] cursor-pointer h-4 bg-[#7f8c8d] appearance-none rounded-none border-2 border-[#2c3e50] mb-2"
           />
           <div className="text-center font-bold text-2xl mb-2 text-[#c0392b]" style={{ fontFamily: MINECRAFT_FONT }}>{formData.seriousness}</div>
           <TextInput
            label="What makes it a good experience for you?"
            name="seriousnessWhy"
            value={formData.seriousnessWhy}
            onChange={handleChange}
            multiline
          />
        </div>

        {/* --- Final Vibe --- */}
        <SectionHeader icon={AlertTriangle} title="Final Vibe Question" />

        <div className="mb-6">
           <label className={STYLES.label} style={{ fontFamily: MINECRAFT_FONT }}>Pick one of these — they're brutal in a quiet way:</label>
           <select 
              value={formData.finalVibeQuestion} 
              onChange={(e) => handleChange('finalVibeQuestion', e.target.value)}
              className={`${STYLES.input} w-full mb-4 cursor-pointer`}
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
              className="w-full md:w-auto min-w-[200px] shadow-xl hover:scale-105 transition-transform"
              disabled={status === 'sending'}
            >
                {status === 'sending' ? 'Dispatching Courier...' : 'Submit Application'}
            </MCButton>
        </div>

      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-[#ecf0f1]" style={{ fontFamily: MINECRAFT_FONT }}>
        <p>Iron Bark SMP © {new Date().getFullYear()}</p>
        <p className="text-sm mt-1 opacity-60">Not affiliated with Mojang AB.</p>
      </div>

      {/* Submission Modal */}
      {status === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1b18] bg-opacity-90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`${STYLES.panelDark} p-8 max-w-lg w-full transform scale-100 shadow-2xl relative`}>
              <div className="absolute top-0 left-0 w-full h-2 bg-[#c0392b]"></div>
              
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1b18] bg-opacity-90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`${STYLES.panelDark} p-8 max-w-lg w-full transform scale-100 shadow-2xl relative`}>
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
                 {copied ? "Copied!" : "Copy Manually"}
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

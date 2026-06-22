import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, Copy, CheckCircle2, Moon, Sun, Calendar, HelpCircle, BarChart2, Eye, X, FileDown, RefreshCw, Award, Zap } from 'lucide-react';
import { jsPDF } from 'jspdf';

type GenerateResult = {
  optimizedTitles: string[];
  polishedCaption: string;
  hashtags: string;
  trendingPosts: { title: string; description: string }[];
  videoScript?: string;
};

type HistoryItem = {
  id: string;
  timestamp: number;
  platform: string;
  niche: string;
  result: GenerateResult;
};

type SeoKeyword = {
  word: string;
  selected: boolean;
};

export default function App() {
  const [niche, setNiche] = useState(() => localStorage.getItem('socialDraft_niche') || '');
  const [platform, setPlatform] = useState(() => localStorage.getItem('socialDraft_platform') || 'Instagram');
  const [contentType, setContentType] = useState(() => localStorage.getItem('socialDraft_contentType') || 'Image');
  const [contentLanguage, setContentLanguage] = useState(() => localStorage.getItem('socialDraft_contentLanguage') || 'English');
  const [brandVoice, setBrandVoice] = useState(() => localStorage.getItem('socialDraft_brandVoice') || 'Authentic');
  const [rawDraft, setRawDraft] = useState(() => localStorage.getItem('socialDraft_rawDraft') || '');
  const [promo, setPromo] = useState(() => localStorage.getItem('socialDraft_promo') || '');
  const [generateVideoScript, setGenerateVideoScript] = useState(() => localStorage.getItem('socialDraft_videoScript') === 'true');
  const [scheduledDate, setScheduledDate] = useState(() => localStorage.getItem('socialDraft_scheduledDate') || '');
  const [scheduledTime, setScheduledTime] = useState(() => localStorage.getItem('socialDraft_scheduledTime') || '');
  
  const [seoKeywords, setSeoKeywords] = useState<SeoKeyword[]>([]);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [repurposeTarget, setRepurposeTarget] = useState('X');
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('socialDraft_theme') === 'dark');
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  useEffect(() => {
    localStorage.setItem('socialDraft_niche', niche);
    localStorage.setItem('socialDraft_platform', platform);
    localStorage.setItem('socialDraft_contentType', contentType);
    localStorage.setItem('socialDraft_contentLanguage', contentLanguage);
    localStorage.setItem('socialDraft_brandVoice', brandVoice);
    localStorage.setItem('socialDraft_rawDraft', rawDraft);
    localStorage.setItem('socialDraft_promo', promo);
    localStorage.setItem('socialDraft_videoScript', generateVideoScript.toString());
    localStorage.setItem('socialDraft_scheduledDate', scheduledDate);
    localStorage.setItem('socialDraft_scheduledTime', scheduledTime);
    localStorage.setItem('socialDraft_theme', isDarkMode ? 'dark' : 'light');
  }, [niche, platform, contentType, contentLanguage, brandVoice, rawDraft, promo, generateVideoScript, scheduledDate, scheduledTime, isDarkMode]);

  const platforms = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'X', 'WhatsApp', 'Threads'];
  const contentTypes = ['Image', 'Short Video (Reels/TikTok/Shorts)', 'Long Video (YouTube/Facebook Watch)'];
  const contentLanguages = ['English', 'Filipino', 'Bisaya (Cebuano)', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Hindi', 'Arabic'];
  const brandVoices = ['Conversational & Approachable', 'Bold & Motivational', 'Humorous & Witty', 'Minimalist & Confident', 'Informative & Trustworthy', 'Empathetic & Compassionate'];
  //const brandVoices = ['Authentic', 'Playful', 'Authoritative', 'Minimalist', 'Energetic'];

  const getPlatformTip = (plat: string) => {
    switch (plat) {
      case 'Facebook': return 'Include details about local events, community involvement, or ask an open-ended question to encourage comments and sharing.';
      case 'Instagram': return 'Describe the visual aesthetic, the mood, or the behind-the-scenes effort. Aesthetics matter here.';
      case 'TikTok': return 'Focus on a strong hook, a relatable problem, or a quick story. Be conversational and dynamic.';
      case 'YouTube': return 'Provide a structured breakdown of what the video covers. Mention key learning points naturally.';
      case 'X': return 'Keep it concise. Focus on a single strong opinion, a contrarian take, or a valuable tip.';
      case 'WhatsApp': return 'Write like you are texting a friend. Keep it personal and include a clear, direct call-to-action.';
      case 'Threads': return 'Ask a thought-provoking question or share a quick, relatable observation to start a conversation.';
      default: return 'Provide as much context as possible for the best results.';
    }
  };

  const getEngagementPrediction = () => {
    if (!platform) return null;
    let reachRange = '';
    let potentialText = '';
    
    if (platform === 'TikTok' || platform === 'Instagram') {
      reachRange = 'High (10k - 50k+)';
      potentialText = 'High virality potential for visual/trendy content.';
    } else if (platform === 'YouTube' || platform === 'Facebook') {
      reachRange = 'Medium (5k - 15k)';
      potentialText = 'Steady community growth and long-term searchability.';
    } else if (platform === 'X' || platform === 'Threads') {
      reachRange = 'Varied (1k - 10k)';
      potentialText = 'Good for conversational engagement and quick updates.';
    } else if (platform === 'WhatsApp') {
      reachRange = 'Targeted (100 - 500)';
      potentialText = 'Direct communication with warm leads and existing clients.';
    }

    const n = niche.toLowerCase();
    if (n && (n.includes('tattoo') || n.includes('art') || n.includes('design') || n.includes('photo') || n.includes('beauty') || n.includes('fashion'))) {
      if (platform === 'Instagram' || platform === 'TikTok') {
        potentialText = 'Excellent match! Highly visual niches perform best here.';
        reachRange = 'Very High (15k - 100k+)';
      }
    } else if (n && (n.includes('tech') || n.includes('finance') || n.includes('business') || n.includes('edu'))) {
      if (platform === 'X' || platform === 'YouTube' || platform === 'Threads') {
        potentialText = 'Strong match! Educational and thought-leadership content succeeds here.';
      }
    } else if (n && (n.includes('local') || n.includes('food') || n.includes('restaurant') || n.includes('cafe'))) {
      if (platform === 'Facebook' || platform === 'Instagram') {
        potentialText = 'Great for local discovery! Facebook and Instagram drive strong foot traffic.';
      }
    }

    return { reachRange, potentialText };
  };

  const getQualityScore = () => {
    if (!result || !result.polishedCaption) return null;
    let score = 100;
    const feedback: string[] = [];
    const caption = result.polishedCaption;
    const wordCount = caption.split(/\s+/).filter(w => w.length > 0).length;
    const hashtagCount = (result.hashtags?.match(/#/g) || []).length;
    
    // Platform word count rules
    if (platform === 'X' || platform === 'Threads') {
      if (wordCount > 40) {
        score -= 15;
        feedback.push("Slightly long for micro-blogging; keep it brief.");
      } else {
        feedback.push("Ideal word count for quick reading.");
      }
      if (hashtagCount > 3) {
        score -= 10;
        feedback.push("Too many hashtags (aim for 1-3).");
      } else {
        feedback.push("Good, focused hashtag usage.");
      }
    } else if (platform === 'Instagram' || platform === 'Facebook') {
      if (wordCount < 20) {
        score -= 5;
        feedback.push("Could use more storytelling/depth.");
      } else {
        feedback.push("Good descriptive length.");
      }
      if (hashtagCount < 5 || hashtagCount > 15) {
        score -= 10;
        feedback.push("Optimal hashtag count is usually 5-15.");
      } else {
        feedback.push("Excellent hashtag density.");
      }
    } else if (platform === 'TikTok') {
      if (wordCount > 30) {
        score -= 10;
        feedback.push("Keep captions very short and punchy.");
      } else {
        feedback.push("Perfect length for fast engagement.");
      }
      if (hashtagCount > 5) {
        score -= 5;
        feedback.push("Keep to 3-5 hyper-relevant hashtags.");
      } else {
        feedback.push("Keywords and tags are well optimized.");
      }
    } else {
       feedback.push("Standard engagement metrics applied.");
    }
    
    // Hook presence
    const firstLine = caption.split(/[\n\r]+/)[0];
    if (firstLine && firstLine.length > 80) {
      score -= 5;
      feedback.push("Direct opening hook could be sharper.");
    } else {
      feedback.push("Strong, punchy text hook.");
    }

    const lower = caption.toLowerCase();
    if (!lower.includes('link') && !lower.includes('comment') && !lower.includes('book') && !lower.includes('visit') && !lower.includes('share') && !lower.includes('dm') && !lower.includes('message')) {
      score -= 10;
      feedback.push("Could strengthen the Call-to-Action (e.g. 'Link in bio').");
    } else {
      feedback.push("Clear Call-to-Action present.");
    }

    score = Math.max(0, Math.min(100, score));

    return { score, feedback };
  };

  const suggestKeywords = async () => {
    if (!niche) {
      setError('Please enter a Business Niche first to get keyword suggestions.');
      return;
    }
    setIsSuggestingKeywords(true);
    setError('');
    try {
      const response = await fetch('/api/suggest-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get keyword suggestions');
      }
      const newKeywords = (data.result || []).map((word: string) => ({ word, selected: true }));
      setSeoKeywords(newKeywords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSuggestingKeywords(false);
    }
  };

  const toggleKeyword = (word: string) => {
    setSeoKeywords(prev => prev.map(k => k.word === word ? { ...k, selected: !k.selected } : k));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !rawDraft) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const activeKeywords = seoKeywords.filter(k => k.selected).map(k => k.word).join(', ');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, platform, contentType, language: contentLanguage, rawDraft, promo, brandVoice, generateVideoScript, seoKeywords: activeKeywords }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate copy');
      }
      
      const newResult = data.result;
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform,
        niche,
        result: newResult
      };

      setHistory(prev => [newItem, ...prev].slice(0, 5));
      setViewingHistoryId(newItem.id);
      setResult(newResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepurpose = async () => {
    if (!result || !result.polishedCaption) return;
    setIsRepurposing(true);
    setPlatform(repurposeTarget);
    setError('');

    try {
      const activeKeywords = seoKeywords.filter(k => k.selected).map(k => k.word).join(', ');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, platform: repurposeTarget, contentType, language: contentLanguage, rawDraft: result.polishedCaption, promo, brandVoice, generateVideoScript, seoKeywords: activeKeywords }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to repurpose copy');
      }
      
      const newResult = data.result;
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform: repurposeTarget,
        niche,
        result: newResult
      };

      setHistory(prev => [newItem, ...prev].slice(0, 5));
      setViewingHistoryId(newItem.id);
      setResult(newResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRepurposing(false);
    }
  };

  const handleRegenerateHashtags = async () => {
    if (!result) return;
    
    setIsGeneratingHashtags(true);
    setError('');
    
    try {
      const resp = await fetch('/api/generate-hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, platform, polishedCaption: result.polishedCaption }),
      });
      
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to generate hashtags');
      }
      
      // Update result with new hashtags
      const newResult = { ...result, hashtags: data.result.hashtags };
      setResult(newResult);

      // update current history item
      setHistory(prev => prev.map(item => item.id === viewingHistoryId ? { ...item, result: newResult } : item));
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const copyAllToClipboard = () => {
    if (!result) return;
    const fullText = `Titles:\n${result.optimizedTitles.join('\n')}\n\nCaption:\n${result.polishedCaption}\n\nHashtags:\n${result.hashtags}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyCaptionToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.polishedCaption}\n\n${result.hashtags}`);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const exportToPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;

    const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Social Media Draft", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Platform: ${platform} | Niche: ${niche}`, margin, y);
    y += 15;

    // Optimized Titles
    if (result.optimizedTitles && result.optimizedTitles.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Optimized Titles:", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      result.optimizedTitles.forEach(title => {
        const lines = doc.splitTextToSize(`• ${title}`, maxLineWidth);
        checkPageBreak(lines.length * 6);
        doc.text(lines, margin, y);
        y += lines.length * 6 + 2;
      });
      y += 5;
    }

    // Polished Caption
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Polished Caption:", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const captionText = result.polishedCaption || '';
    const captionLines = doc.splitTextToSize(captionText, maxLineWidth);
    
    captionLines.forEach((line: string) => {
       checkPageBreak(10);
       doc.text(line, margin, y);
       y += 6;
    });
    y += 10;

    // Hashtags
    if (result.hashtags) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Hashtags:", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const hashtagLines = doc.splitTextToSize(result.hashtags, maxLineWidth);
      
      hashtagLines.forEach((line: string) => {
         checkPageBreak(10);
         doc.text(line, margin, y);
         y += 6;
      });
      y += 10;
    }

    if (result.videoScript) {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Video Script Idea:", margin, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const videoLines = doc.splitTextToSize(result.videoScript, maxLineWidth);
        
        videoLines.forEach((line: string) => {
           checkPageBreak(10);
           doc.text(line, margin, y);
           y += 6;
        });
        y += 10;
    }

    doc.save(`Draft_${platform.replace(/\s+/g, '')}_${new Date().getTime()}.pdf`);
  };

  const downloadCalendarFile = () => {
    if (!result || !scheduledDate) return;
    
    // Create an iCal file string
    const eventName = `Publish on ${platform}: ${result.optimizedTitles[0] || 'Social Post'}`;
    const description = `${result.polishedCaption}\n\n${result.hashtags}`;
    
    let dtStart = '';
    let dtEnd = '';
    
    try {
      const dateParts = scheduledDate.split('-'); // YYYY-MM-DD
      const timeParts = scheduledTime ? scheduledTime.split(':') : ['12', '00']; // HH:MM
      
      const startDate = new Date(
        parseInt(dateParts[0]), 
        parseInt(dateParts[1]) - 1, 
        parseInt(dateParts[2]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1])
      );
      
      const endDate = new Date(startDate.getTime() + 15 * 60000); // Add 15 minutes
      
      const formatDT = (d: Date) => {
        return d.getFullYear().toString() + 
               (d.getMonth() + 1).toString().padStart(2, '0') + 
               d.getDate().toString().padStart(2, '0') + 'T' + 
               d.getHours().toString().padStart(2, '0') + 
               d.getMinutes().toString().padStart(2, '0') + '00';
      };
      
      dtStart = formatDT(startDate);
      dtEnd = formatDT(endDate);
    } catch (e) {
      console.error('Error parsing date/time', e);
      return;
    }
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SocialDraft Pro//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${eventName}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-post-${platform.toLowerCase()}-${scheduledDate}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCharacterLimit = (selectedPlatform: string) => {
    switch (selectedPlatform) {
      case 'X': return 280;
      case 'Threads': return 500;
      case 'Instagram':
      case 'TikTok': return 2200;
      case 'YouTube': return 5000;
      case 'Facebook': return 63206;
      case 'WhatsApp': return 65536;
      default: return 2200;
    }
  };

  const limit = getCharacterLimit(platform);
  const isOverLimit = rawDraft.length > limit;

  return (
    <div className={`flex flex-col h-screen w-full font-sans overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className={`text-lg sm:text-xl font-semibold tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Skinkraft TV <span className="text-indigo-600">POSTGEN</span>
          </h1>
          <span className={`hidden sm:inline-block ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
            Elite Mode
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-y-auto lg:overflow-hidden">
        <div className={`w-full lg:w-[580px] flex-shrink-0 flex flex-col gap-5 p-6 md:p-8 rounded-xl border shadow-sm lg:overflow-y-auto transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Campaign Parameters</h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Provide the context to generate your optimized copy.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="niche">
                Business Niche
              </label>
              <input
                id="niche"
                type="text"
                placeholder="e.g. Tattoo Artist, Web Designer..."
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-slate-50 border-slate-200'}`}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                  SEO Target Keywords
                  <div className="relative group/tooltip">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-xs rounded shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 text-center">
                      Auto-generate high-ranking keywords for your niche and toggle them.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={suggestKeywords}
                  disabled={isSuggestingKeywords || !niche}
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}
                >
                  {isSuggestingKeywords ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {isSuggestingKeywords ? 'Suggesting...' : 'Suggest Keywords'}
                </button>
              </div>
              
              {seoKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((k, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleKeyword(k.word)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${k.selected ? (isDarkMode ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-300 text-indigo-700') : (isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400')}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${k.selected ? 'bg-indigo-500' : 'bg-transparent'}`}></span>
                      {k.word}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`text-xs p-3 border border-dashed rounded-lg text-left ${isDarkMode ? 'border-slate-800/80 text-slate-600 bg-slate-900/50' : 'border-slate-300 text-slate-400 bg-slate-50/50'}`}>
                  No keywords added yet. Enter a business niche and click 'Suggest Keywords' to let AI find high-ranking terms.
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="promo">
                Special Promo / Offers (Optional)
              </label>
              <input
                id="promo"
                type="text"
                placeholder="e.g. 20% off weekend bookings, only 3 slots left..."
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-slate-50 border-slate-200'}`}
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="platform">
                  Target Platform
                </label>
                <select
                  id="platform"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="contentType">
                  Content Type
                </label>
                <select
                  id="contentType"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  {contentTypes.map(c => <option key={c} value={c}>{c.split(' (')[0]}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="contentLanguage">
                  Content Language
                </label>
                <select
                  id="contentLanguage"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}
                  value={contentLanguage}
                  onChange={(e) => setContentLanguage(e.target.value)}
                >
                  {contentLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="brandVoice">
                  Brand Voice
                </label>
                <select
                  id="brandVoice"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                >
                  {brandVoices.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {contentType.includes('Video') && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                  Video Options
                </label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        target="_blank"
                        className="peer appearance-none w-4 h-4 rounded-sm border border-slate-400 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-900 transition-all cursor-pointer"
                        checked={generateVideoScript}
                        onChange={(e) => setGenerateVideoScript(e.target.checked)}
                      />
                      <svg className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm select-none group-hover:text-indigo-400 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Create video script for storytelling post</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="scheduledDate">
                  Scheduled Date (Optional)
                </label>
                <input
                  id="scheduledDate"
                  type="date"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 cursor-pointer placeholder-slate-600' : 'bg-slate-50 border-slate-200 cursor-pointer'}`}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="scheduledTime">
                  Scheduled Time (Optional)
                </label>
                <input
                  id="scheduledTime"
                  type="time"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 cursor-pointer placeholder-slate-600' : 'bg-slate-50 border-slate-200 cursor-pointer'}`}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <label className={`block text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} htmlFor="rawDraft">
                  Raw Draft
                </label>
                <div className="relative group/tooltip">
                  <HelpCircle className="w-4 h-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-slate-200 text-xs leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10">
                    <div className="font-bold text-indigo-400 mb-1">Expert Tip for {platform}</div>
                    {getPlatformTip(platform)}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              </div>
              <textarea
                id="rawDraft"
                rows={6}
                placeholder="Just finished this piece today. Pls DM to book. Next month is open..."
                className={`flex-1 w-full p-4 border rounded-lg text-sm leading-relaxed resize-none focus:ring-2 focus:outline-none transition-all min-h-[150px] ${
                  isOverLimit ? 'border-amber-400 focus:ring-amber-500 ' + (isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50') : (isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-indigo-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500')
                }`}
                value={rawDraft}
                onChange={(e) => setRawDraft(e.target.value)}
                required
              />
              <div className={`mt-2 text-right text-xs font-semibold ${isOverLimit ? 'text-amber-500' : 'text-slate-400'}`}>
                {rawDraft.length} / {limit.toLocaleString()} <span className="font-normal opacity-70">for {platform}</span>
              </div>
            </div>

            {getEngagementPrediction() && (
              <div className={`p-4 rounded-xl border flex gap-3 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-800'}`}>
                <BarChart2 className={`w-5 h-5 shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Estimated Reach: {getEngagementPrediction()?.reachRange}</span>
                  <span className="text-xs opacity-90 leading-relaxed mt-0.5">{getEngagementPrediction()?.potentialText}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !niche || !rawDraft}
              className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:shadow-none disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Elite Copy
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex-1 flex flex-col gap-4 md:gap-5 bg-slate-900 rounded-xl p-6 md:p-8 border border-slate-800 shadow-2xl relative lg:overflow-hidden min-h-[600px] lg:min-h-0">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          
          <div className="z-10 flex flex-col h-full">
            <div className="flex flex-wrap items-center justify-between mb-2 pb-4 border-b border-slate-800 gap-2">
              <h2 className="text-white text-lg font-bold">Optimized Output</h2>
              <div className="flex gap-3">
                {result && scheduledDate && (
                  <button 
                    onClick={downloadCalendarFile}
                    className="text-xs text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    AddToCalendar
                  </button>
                )}
                {result && (
                  <>
                    <button 
                      onClick={exportToPDF}
                      className="text-xs text-rose-400 font-bold uppercase tracking-widest hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Export PDF
                    </button>
                    <button 
                      onClick={copyAllToClipboard}
                      className="text-xs text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedAll ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedAll ? 'Copied' : 'Copy'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {history.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setResult(item.result);
                      setViewingHistoryId(item.id);
                      setPlatform(item.platform);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      viewingHistoryId === item.id 
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {item.platform} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            )}
            
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              {!result && !isLoading && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-sm max-w-[280px]">Your optimized, SEO-rich social media copy will appear here.</p>
                </div>
              )}
              
              {isLoading && (
                <div className="h-full flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4 text-slate-500">
                     <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                     <p className="text-sm font-bold uppercase tracking-widest animate-pulse text-indigo-400">Crafting Masterpiece...</p>
                   </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/40 border border-red-800 text-red-200 p-4 rounded-xl text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {result && !isLoading && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized Titles</span>
                    <div className="space-y-2">
                      {result.optimizedTitles.map((title, i) => (
                        <div key={i} className="p-3 bg-slate-800 rounded border border-slate-700 text-sm text-slate-200">
                          {i + 1}. {title}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getQualityScore() && (
                      <div className={`border rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <div className={`flex items-center justify-between mb-3 border-b pb-3 ${isDarkMode ? 'border-indigo-500/10' : 'border-indigo-200'}`}>
                           <div className="flex items-center gap-2">
                             <Award className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Content Quality Score</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className={`text-xl font-black ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{getQualityScore()?.score}</div>
                             <span className={`text-xs ${isDarkMode ? 'text-indigo-500' : 'text-indigo-400'}`}>/ 100</span>
                           </div>
                        </div>
                        <ul className="space-y-2">
                          {getQualityScore()?.feedback.map((fb, idx) => (
                            <li key={idx} className={`flex gap-2 text-xs leading-relaxed ${isDarkMode ? 'text-indigo-200/80' : 'text-indigo-900/80'}`}>
                              <Zap className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                              {fb}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 items-center justify-between mb-2 flex-wrap gap-3">
                      <span className="text-xs text-slate-400 font-medium tracking-wide">Repurpose for another platform:</span>
                      <div className="flex items-center gap-2">
                        <select 
                          value={repurposeTarget}
                          onChange={(e) => setRepurposeTarget(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                          {platforms.filter(p => p !== platform).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <button 
                          onClick={handleRepurpose}
                          disabled={isRepurposing}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                        >
                          {isRepurposing ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3" />}
                          Repurpose
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Polished Caption</span>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setShowPreview(true)}
                          className="text-[10px] text-sky-400 font-bold uppercase tracking-widest hover:text-sky-300 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        <button 
                          onClick={copyCaptionToClipboard}
                          className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedCaption ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedCaption ? 'Copied' : 'Copy Caption'}
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {result.polishedCaption}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trending & Local SEO Hashtags</span>
                      <button 
                         onClick={handleRegenerateHashtags}
                         disabled={isGeneratingHashtags}
                         className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                         {isGeneratingHashtags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                         {isGeneratingHashtags ? 'Regenerating...' : 'Regenerate'}
                      </button>
                    </div>
                    <div className="p-4 bg-slate-800 border border-dashed border-slate-600 rounded-lg text-sm text-indigo-400 font-mono">
                      {result.hashtags}
                    </div>
                  </div>

                  {result.trendingPosts && result.trendingPosts.length > 0 && (
                     <div className="space-y-3 mt-8 pt-6 border-t border-slate-800/50">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Top 5 Trending Post Ideas</span>
                       <div className="grid grid-cols-1 gap-3">
                         {result.trendingPosts.map((post, i) => (
                           <div key={i} className="p-4 bg-slate-800/80 rounded border border-slate-700 flex flex-col gap-1.5">
                             <div className="text-sm font-bold text-slate-200">{post.title}</div>
                             <div className="text-xs text-slate-400 leading-relaxed">{post.description}</div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}

                  {result.videoScript && (
                     <div className="space-y-3 mt-8 pt-6 border-t border-slate-800/50">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Video Script</span>
                       <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                         {result.videoScript}
                       </div>
                     </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
              <span className="text-xs italic">Generated via Skinkraft TV postgen • v1.5</span>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800/20">
              <span className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                {platform} Preview
              </span>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-full hover:bg-slate-800/10 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {/* Mock Platform Container */}
              <div className={`rounded-xl border p-4 ${platform === 'X' ? 'bg-black border-slate-800' : platform === 'Instagram' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : platform === 'Facebook' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                
                {/* Header Mock */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${platform === 'Instagram' || platform === 'Facebook' ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                    S
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${platform === 'X' ? 'text-slate-200' : platform === 'Instagram' || platform === 'Facebook' ? 'text-slate-900' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Skinkraft Studio</div>
                    <div className={`text-xs ${platform === 'X' ? 'text-slate-500' : platform === 'Instagram' || platform === 'Facebook' ? 'text-slate-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Just now</div>
                  </div>
                </div>

                {/* Content Mock */}
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${platform === 'X' ? 'text-slate-200' : platform === 'Instagram' || platform === 'Facebook' ? 'text-slate-900' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {result.polishedCaption}
                </div>

                {/* Hashtags Mock */}
                <div className={`text-sm mt-3 font-medium ${platform === 'X' ? 'text-sky-500' : platform === 'Instagram' ? 'text-blue-900' : platform === 'Facebook' ? 'text-blue-600' : isDarkMode ? 'text-sky-400' : 'text-blue-600'}`}>
                  {result.hashtags}
                </div>

                {/* Footer Mock */}
                <div className={`mt-4 pt-3 border-t flex gap-6 ${platform === 'X' ? 'border-slate-800 text-slate-500' : platform === 'Instagram' || platform === 'Facebook' ? 'border-slate-100 text-slate-500' : isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
                  <span className="flex items-center gap-1.5 cursor-not-allowed hover:text-red-500 transition-colors"><HelpCircle className="w-4 h-4" /></span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800/20 bg-slate-900/10 text-center">
               <span className="text-xs text-slate-500 font-medium">This is an approximation. Actual appearance depends on the platform and device layout.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

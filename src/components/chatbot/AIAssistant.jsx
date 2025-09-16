import React, { useState, useEffect, useRef } from 'react';

const AIAssistant = ({ isOpen, onToggle, artisanData }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState(false);
  const messagesEndRef = useRef(null);

  // Smart welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: `🎨 Hello ${artisanData?.displayName || 'there'}! I'm your "Smart KraftHouse Assistant".

I can help you with:
✨ Creative project ideas for ${artisanData?.craftType || 'your craft'}
🛠️ Tool recommendations for your skill level (${artisanData?.experience || 'beginner'})
🎨 Color theory & design guidance
📈 Marketing strategies for your handmade business
💰 Pricing advice for ${artisanData?.location || 'your area'}
🎯 Skill development roadmaps

Ask me anything specific about crafts, techniques, or growing your artisan business!`,
        timestamp: new Date()
      }]);
    }
  }, [artisanData, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fixed Gemini API call
  const getSmartResponse = async (userMessage) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    // Check if API key exists
    if (!apiKey) {
      setApiError(true);
      return `🔑 **API Key Missing!**

To enable AI responses, please:
1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to your .env file: \`REACT_APP_GEMINI_API_KEY=your_key_here\`
3. Restart your development server

Meanwhile, here's some helpful advice for "${userMessage}":

🎨 Quick Tips:
- Research master craftspeople in your field for inspiration
- Practice fundamental techniques daily (even 15 minutes helps!)
- Document your process with photos to track improvement
- Connect with artisan communities online for support
- Start with quality basic tools before investing in advanced equipment

💡 Next Steps:
1. Break your goal into 3 smaller, actionable tasks
2. Set aside focused practice time this week
3. Join artisan Facebook groups or subreddits
4. Take progress photos to see your improvement
5. Share your work for constructive feedback

What specific technique would you like to focus on?`;
    }

    try {
      const contextPrompt = `You are CraftAI, an expert artisan mentor helping ${artisanData?.displayName || 'an artisan'} who specializes in ${artisanData?.craftType || 'various crafts'} with ${artisanData?.experience || 'beginner'} experience.

USER PROFILE:
- Craft: ${artisanData?.craftType || 'General'}
- Experience: ${artisanData?.experience || 'Beginner'} 
- Skills: ${artisanData?.skills?.join(', ') || 'Learning'}
- Location: ${artisanData?.location || 'Unknown'}

CONVERSATION HISTORY:
${messages.slice(-2).map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

USER QUESTION: "${userMessage}"

As an expert artisan mentor, provide specific, actionable advice including:
- Concrete techniques or step-by-step instructions
- Tool/material recommendations with budget considerations
- Inspirational examples from master craftspeople
- Clear next steps they can take today
- Encouraging, supportive tone

Keep response under 150 words. Use emojis and formatting for readability.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Details:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setApiError(false);
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No valid response from API');
      }
      
    } catch (error) {
      console.error('AI API Error:', error);
      setApiError(true);
      
      // Provide intelligent fallback response
      return getIntelligentFallback(userMessage, artisanData);
    }
  };

  // Intelligent fallback responses
  const getIntelligentFallback = (userMessage, userData) => {
    const message = userMessage.toLowerCase();
    const craft = userData?.craftType?.toLowerCase() || 'craft';
    const experience = userData?.experience?.toLowerCase() || 'beginner';

    if (message.includes('project') || message.includes('idea')) {
      return `🎨 ${craft.charAt(0).toUpperCase() + craft.slice(1)} Project Ideas for ${experience.charAt(0).toUpperCase() + experience.slice(1)}s:

Beginner-Friendly:
1. Simple ${craft} coasters - Practice basic techniques with quick results
2. Mini decorative pieces - Build confidence with small projects  
3. Color study samples - Experiment with different combinations

Next Level:
4. Functional items - Combine beauty with utility
5. Seasonal decorations - Create items for holidays/seasons

💡 Pro Tip: Start with one project, master it completely, then move to the next. Quality over quantity always wins!

Materials you'll need: Basic ${craft} supplies, good lighting, and patience. Budget around $20-50 to start.

What type of project appeals to you most?`;
    }

    if (message.includes('tool') || message.includes('equipment')) {
      return `🛠️ **Essential ${craft.charAt(0).toUpperCase() + craft.slice(1)} Tools for ${experience.charAt(0).toUpperCase() + experience.slice(1)}s:**

Must-Have Basics ($30-60):
- Quality basic tools (specific to your craft)
- Good lighting setup
- Workspace organization system
- Basic measuring tools

Next Investment ($60-150):
- Professional-grade primary tool
- Specialized accessories
- Storage solutions
- Quality materials

Advanced Tools (When ready):
- Power tools or specialized equipment
- Professional finishing supplies

💰 Budget Strategy: Buy quality basics first, cheap tools cost more in the long run. One good tool is better than three mediocre ones.

🎯 Today's Action: Research one tool you need most and read 3 reviews from actual craftspeople.

What's the next tool on your wishlist?`;
    }

    if (message.includes('color') || message.includes('design')) {
      return `🎨 **Color & Design Mastery for ${craft.charAt(0).toUpperCase() + craft.slice(1)}:**

Color Theory Basics:
- Complementary colors create vibrant contrast
- Analogous colors give harmony and calm
- Triadic colors offer balanced diversity

Design Principles:
1. Rule of thirds - Place focal points strategically
2. Balance - Distribute visual weight evenly
3. Contrast - Use light/dark, rough/smooth differences
4. Unity - Keep consistent style elements

For your specifically:
- Study master pieces in your field
- Create color swatches before starting projects
- Practice with monochrome first, then add colors
- Take photos to see your work objectively

🌈 This Week's Challenge: Create 5 color combinations and test them on small sample pieces.

What colors are you most drawn to in your work?`;
    }

    if (message.includes('sell') || message.includes('price') || message.includes('market')) {
      return `💰 Pricing & Marketing Your ${craft.charAt(0).toUpperCase() + craft.slice(1)} Work:

Pricing Formula:
- Materials cost × 2 = Base price
- Add hourly wage (minimum $15-25/hour)
- Add 10-20% for business expenses
- Research competitor prices in ${userData?.location || 'your area'}

Marketing Strategies:
1. Instagram/TikTok - Show your process, not just results
2. Local craft fairs - Build personal connections
3. Etsy/online shops - Reach global customers
4. Word of mouth - Your best marketing tool

Content Ideas:
- Time-lapse creation videos
- Behind-the-scenes process shots
- Customer testimonials and photos
- Educational posts about your craft

📈 This Month's Goal: Post 3 process videos and price 5 of your best pieces using the formula above.

What's your biggest challenge with selling your work?`;
    }

    // General craft advice
    return `💡 **Expert Advice for "${userMessage}":**

For ${craft.charAt(0).toUpperCase() + craft.slice(1)} at ${experience.charAt(0).toUpperCase() + experience.slice(1)} Level:

🎯 Immediate Actions:
- Focus on mastering one technique at a time
- Document your process with photos
- Practice consistently, even if just 15 minutes daily
- Connect with other ${craft} artisans online

🛠️ Skill Building:
- Watch master craftspeople on YouTube
- Join ${craft} Facebook groups or Reddit communities
- Take before/after photos to track improvement
- Ask specific questions in artisan forums

📚 Learning Resources:
- Library books on your crafting techniques
- Online courses from established artisans
- Local workshops or classes
- Museum visits for inspiration

🎨 Creative Development:
- Study work you admire - what makes it special?
- Experiment with new materials or techniques monthly
- Keep an inspiration folder/board
- Challenge yourself with small stretch projects

What specific aspect of ${craft} would you like to focus on improving first?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const aiResponse = await getSmartResponse(inputMessage.trim());
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const quickActions = [
    { emoji: '🎨', text: 'Project Ideas', prompt: `Give me 3 unique ${artisanData?.craftType || 'craft'} project ideas for ${artisanData?.experience || 'my skill level'}` },
    { emoji: '🛠️', text: 'Tool Help', prompt: 'What tools should I invest in next to improve my craft?' },
    { emoji: '💰', text: 'Pricing', prompt: `How should I price my ${artisanData?.craftType || 'handmade'} items for ${artisanData?.location || 'my area'}?` },
    { emoji: '📈', text: 'Marketing', prompt: 'Give me 5 creative ways to market my handmade products online' },
    { emoji: '🎯', text: 'Skills', prompt: `What's the next technique I should learn to advance from ${artisanData?.experience || 'beginner'} level?` },
    { emoji: '🌈', text: 'Colors', prompt: 'Help me choose a color palette that will make my work stand out' }
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '650px',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
      border: '1px solid #e0e0e0'
    }}>
      {/* Enhanced Header */}
      <div style={{
        background: apiError 
          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>🤖</div>
            <div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                CraftAI Assistant
              </h4>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>
                {isTyping ? '💭 Thinking...' : apiError ? '⚠️ Offline Mode' : '🧠 AI Powered'}
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f8f9ff'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            marginBottom: '20px',
            alignItems: 'flex-start',
            flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
          }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : apiError
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: message.type === 'user' ? '0 0 0 12px' : '0 12px 0 0',
              fontSize: '16px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              maxWidth: '75%',
              padding: '16px 20px',
              borderRadius: '20px',
              backgroundColor: message.type === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'white',
              color: message.type === 'user' ? 'white' : '#333',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-line',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: apiError
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'white'
            }}>🤖</div>
            <div style={{
              backgroundColor: 'white',
              padding: '16px 20px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div className="typing-animation">
                <span></span><span></span><span></span>
              </div>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {apiError ? 'Preparing expert advice...' : 'AI is thinking...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '15px 20px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(action.prompt)}
              style={{
                background: apiError
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 'bold'
              }}
              title={action.text}
            >
              {action.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Input */}
      <div style={{
        display: 'flex',
        padding: '20px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white',
        gap: '12px'
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask me anything about crafts, techniques, or growing your business..."
          disabled={isTyping}
          style={{
            flex: 1,
            border: '2px solid #e9ecef',
            borderRadius: '20px',
            padding: '12px 16px',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
            minHeight: '24px',
            maxHeight: '80px',
            background: '#f8f9ff'
          }}
          rows="1"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          style={{
            background: !inputMessage.trim() || isTyping 
              ? '#ccc' 
              : apiError
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: !inputMessage.trim() || isTyping ? 'not-allowed' : 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {isTyping ? '⏳' : '🚀'}
        </button>
      </div>

      <style>{`
        .typing-animation span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
          margin-right: 3px;
          animation: typing 1.4s infinite;
        }
        .typing-animation span:nth-child(2) { animation-delay: 0.2s; }
        .typing-animation span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;

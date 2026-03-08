import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Converting review to Tenglish, text length:', text.length);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a Telugu movie reviewer who speaks in Tenglish (Telugu written in English/Roman script mixed with English words). Convert movie reviews into natural Tenglish that sounds like how Telugu people chat on WhatsApp.

Rules:
- Write Telugu words in English/Roman script (e.g., "cinema baagundi", "first half lo director")
- Keep English movie terms as-is (screenplay, twist, climax, thriller, direction, acting)
- Sound natural and conversational like a friend telling you about a movie
- Use common Tenglish phrases like "enti ante", "chala baagundi", "worth watch", "pakka hit"
- Add natural fillers like "ante", "kadha", "mari", "inka"
- Output ONLY the Tenglish text, nothing else
- No Telugu script characters at all - everything in Roman/English letters
- Keep section labels like "Review:", "First Half:", "Second Half:", "Positives:", "Negatives:", "Overall:", "Rating:"

Example style: "Cinema chala baagundi ra! First half lo koddiga slow ga anipinchina, second half lo director pakka mass ga handle chesadu. Twists inka screenplay top notch. Overall ga cheppali ante, idi oka solid thriller!"`,
          },
          {
            role: 'user',
            content: `Convert this movie review to Tenglish:\n\n${text}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI translation failed');
    }

    const aiData = await aiResponse.json();
    const tenglishText = aiData.choices?.[0]?.message?.content?.trim() || text;

    console.log('Tenglish conversion done, length:', tenglishText.length);

    return new Response(
      JSON.stringify({ teluguText: tenglishText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

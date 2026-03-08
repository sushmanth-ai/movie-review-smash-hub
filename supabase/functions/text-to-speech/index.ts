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
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at converting Telugu movie reviews into perfect Tenglish (Telugu transliterated in Roman/English script). Your output will be read aloud by a text-to-speech engine using an English-India voice, so accuracy and natural pronunciation are critical.

STRICT RULES:
1. Convert ALL Telugu words into accurate Roman transliteration. Use standard Telugu romanization:
   - Use "aa" for ఆ, "ee" for ఈ, "oo" for ఊ, "ai" for ఐ, "au" for ఔ
   - Use "ch" for చ, "th" for త/థ, "dh" for ద/ధ, "sh" for శ/ష, "kh" for ఖ, "gh" for ఘ, "bh" for భ, "ph" for ఫ
   - Use "nh" or "n" for ణ/న appropriately
   - Double consonants where Telugu has them: "tt", "dd", "pp", "kk"
2. Keep English words exactly as they are (screenplay, direction, acting, thriller, twist, climax, comedy, hero, heroine, interval, flashback)
3. DO NOT use any Telugu script (నుండి, సినిమా etc.) - everything must be in Roman letters
4. Sound natural like a Telugu person casually reviewing a movie on YouTube
5. Use natural Tenglish connectors: "ante", "kadha", "mari", "inka", "aithe", "kuda", "emo", "ra", "bro"
6. Keep section headers in English: "Review:", "First Half:", "Second Half:", "Positives:", "Negatives:", "Overall:", "Rating:"
7. Output ONLY the converted Tenglish text, nothing else - no explanations, no quotes
8. Maintain the same meaning and tone of the original review
9. For words already in English in the input, keep them exactly as-is
10. Make it sound like how Telugu people actually type in WhatsApp - casual but clear

Example conversions:
- "మొదటి సగం" → "First Half"
- "చాలా బాగుంది" → "chaala baagundi"
- "సినిమా ఎలా ఉందో" → "cinema ela undho"
- "దర్శకుడు బాగా హ్యాండిల్ చేశాడు" → "director baaga handle chesaadu"
- "ట్విస్ట్‌లు సూపర్" → "twists super"`,
          },
          {
            role: 'user',
            content: `Convert this movie review to natural Tenglish. Remember - NO Telugu script, only Roman letters and English words:\n\n${text}`
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

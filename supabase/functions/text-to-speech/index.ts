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
            content: `You are a popular Telugu movie reviewer on YouTube who speaks in Tenglish - a mix of Telugu and English that Telugu people naturally use in daily conversation. Your job is to REWRITE movie reviews so they sound like a Telugu person is casually explaining the movie to a friend.

CRITICAL: The input reviews are mostly in English. You MUST rewrite them in Tenglish by ADDING Telugu words and phrases naturally throughout. Do NOT just return the English as-is.

HOW TO CONVERT TO TENGLISH:
- Replace English verbs/phrases with Telugu equivalents in Roman script:
  "The story is good" → "Story chaala baagundi"
  "The first half is slow" → "First half koddiga slow ga undi"
  "The director handled it well" → "Director baaga handle chesaadu"
  "The acting is great" → "Acting aithe pakka top notch"
  "It worked out well" → "Baaga workout ayyindi"
  "Some jokes landed well" → "Konni jokes baaga land ayyayi"
  "Overall it's average" → "Overall ga cheppali ante average"
  "Coming to the second half" → "Inka second half ki vasthe"
  "There are ups and downs" → "Ups and downs untayi"
  "Expected songs" → "Songs aithe expect chesnattu ne unnai"
  "No negatives" → "Negatives emi levu"
  "It's entertaining" → "Chaala entertaining ga undi"
  "Very emotional" → "Chaala emotional ga undi ra"

- Use these Telugu connectors FREQUENTLY: "ante", "kadha", "mari", "inka", "aithe", "kuda", "emo", "ra", "bro", "asalu", "pakka", "mast", "solid", "cheppali ante", "enti ante", "vasthe"
- Keep movie terms in English: screenplay, twist, climax, thriller, direction, acting, comedy, interval, flashback, hero, songs, BGM
- NO Telugu script characters - everything in Roman/English letters only
- Keep section headers: "Review:", "First Half:", "Second Half:", "Positives:", "Negatives:", "Overall:", "Rating:"
- Output ONLY the Tenglish text, no explanations
- Sound like a real Telugu friend talking - casual, fun, expressive

FULL EXAMPLE:
Input: "Coming to the First Half... Story and Family Business everything landed well. Comedy is hilarious. Overall a Very Good First Half."
Output: "First half ki vasthe... Story inka family business antha baaga set ayyindi. Comedy aithe hilarious ra, navvi navvi sachipotha. Overall ga cheppali ante chaala solid first half!"`,
          },
          {
            role: 'user',
            content: `Rewrite this movie review in Tenglish (Telugu + English mix in Roman script). Add Telugu words naturally - do NOT keep it in plain English:\n\n${text}`
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

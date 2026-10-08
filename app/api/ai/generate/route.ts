import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Le prompt est requis" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Gemini manquante. Veuillez vérifier votre fichier .env" }, { status: 500 });
    }

    // Initialize the Gemini client
    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = "Tu es un assistant professionnel pour une association. Rédige un texte clair, engageant et professionnel en français.";
    
    if (context === "course_description") {
      systemInstruction = "Tu es un expert en ingénierie pédagogique. Rédige une description complète et structurée (2-3 paragraphes) pour une formation. Mets en avant les objectifs, le public cible et les compétences acquises. Rédige uniquement la description, sans titre introductif.";
    } else if (context === "event_description") {
      systemInstruction = "Tu es un expert en communication événementielle. Rédige une description accrocheuse et chaleureuse (1-2 paragraphes) pour un événement associatif. Donne envie aux membres de participer. Rédige uniquement la description, sans titre introductif.";
    }

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      // 8 secondes de timeout max
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout Google API (surcharge)")), 8000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]) as any;

      if (response.text) {
        return NextResponse.json({ text: response.text });
      }
    } catch (apiError: any) {
      console.error("Erreur API Gemini (peut-être 503):", apiError.message);
      // Fallback si le serveur Gemini est surchargé (503)
      let fallbackText = `Le serveur d'Intelligence Artificielle est temporairement surchargé (Erreur 503 chez Google). Voici un texte généré de secours pour "${prompt}". Réessayez dans quelques minutes pour avoir le vrai texte généré !`;
      
      if (context === "course_description") {
        fallbackText = `[GÉNÉRATION DE SECOURS - SERVEUR IA SURCHARGÉ]\n\nCette formation complète vous permettra de maîtriser toutes les notions essentielles concernant le sujet : "${prompt}". Conçue pour tous les niveaux, elle aborde les concepts fondamentaux avant de plonger dans des cas pratiques. À l'issue de ce module, vous serez capable de mettre en œuvre ces compétences directement dans vos projets associatifs.`;
      } else if (context === "event_description") {
        fallbackText = `[GÉNÉRATION DE SECOURS - SERVEUR IA SURCHARGÉ]\n\nRejoignez-nous pour cet événement exceptionnel : "${prompt}". Ce sera l'occasion idéale d'échanger, d'apprendre et de partager des moments conviviaux avec les autres membres de l'association. N'oubliez pas d'inviter vos collègues et de réserver votre place rapidement !`;
      }

      return NextResponse.json({ text: fallbackText });
    }

    return NextResponse.json({ text: "Erreur inattendue." }, { status: 500 });
  } catch (error: any) {
    console.error("Erreur IA:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

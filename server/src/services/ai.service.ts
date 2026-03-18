import OpenAI from 'openai';

const GROQ_API_KEY = process.env.GROK_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('WARNING: GROK_API_KEY is missing from environment variables');
}

const groqClient = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export class AiService {
  async analyzeTranscript(transcript: string) {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is missing from environment variables');
    }

    const prompt = `
      You are an expert English language tutor analyzing a user's spoken movie review transcript.
      Analyze the following transcript for grammar, fluency, vocabulary, and overall confidence.
      
      Transcript: "${transcript}"
      
      Provide the output EXACTLY in the following JSON format without any markdown blocks or backticks. Just raw JSON:
      {
        "grammarScore": number (0-100),
        "fluencyScore": number (0-100),
        "vocabularyScore": number (0-100),
        "confidenceScore": number (0-100),
        "mistakes": ["List of specific grammatical or structural mistakes made"],
        "suggestions": ["List of actionable tips for improvement"],
        "improvedVersion": "A polished, native-sounding version of the transcript"
      }
    `;

    try {
      const response = await groqClient.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are an API that only returns raw JSON objects. Do not wrap JSON in backticks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
      });

      const content = response.choices[0].message.content || '';

      try {
        const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Failed to parse AI response JSON:', content);
        throw new Error('AI returned malformed data');
      }

    } catch (error: any) {
      console.error('Groq API Error:', error.message);
      throw new Error('Failed to analyze transcript with AI');
    }
  }

  async transcribeAudio(audioBuffer: Buffer, mimetype: string, originalName: string) {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is missing from environment variables');
    }

    try {
      const file = await OpenAI.toFile(audioBuffer, originalName, { type: mimetype });

      const response = await groqClient.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3-turbo',
      });

      return response.text;
    } catch (error: any) {
      console.error('Groq Whisper API Error:', error.message);
      throw new Error('Failed to transcribe audio: ' + error.message);
    }
  }
}

export const aiService = new AiService();

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import os
import librosa
import numpy as np
import io

# ### --- UPDATED --- ### Import Google's library and remove OpenAI
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- MODEL INITIALIZATION (UNCHANGED) ---

# Model 1: Text Emotion Classifier (GoEmotions)
text_emotion_classifier = None

# Model 2: Speech Emotion Recognition (SER)
speech_emotion_classifier = None

# ### --- UPDATED --- ### Initialize the Google Gemini client
# It will automatically look for the GOOGLE_API_KEY in your environment
google_api_key = None
try:
    google_api_key = os.environ.get('GOOGLE_API_KEY')
    if not google_api_key:
        print("❌ WARNING: GOOGLE_API_KEY environment variable not set. LLM features will fail.")
    else:
        genai.configure(api_key=google_api_key)
        print("✅ Google AI (Gemini) client configured successfully.")
except Exception as e:
    print(f"❌ Error configuring Gemini client: {e}")


# This mapping is UNCHANGED
EMOTION_DIMENSIONS = {
    'admiration': {'valence': 0.7, 'arousal': 0.5},
    'amusement': {'valence': 0.8, 'arousal': 0.6},
    'anger': {'valence': -0.7, 'arousal': 0.8},
    'annoyance': {'valence': -0.4, 'arousal': 0.5},
    'approval': {'valence': 0.6, 'arousal': 0.3},
    'caring': {'valence': 0.7, 'arousal': 0.4},
    'confusion': {'valence': -0.3, 'arousal': 0.4},
    'curiosity': {'valence': 0.5, 'arousal': 0.6},
    'desire': {'valence': 0.6, 'arousal': 0.7},
    'disappointment': {'valence': -0.6, 'arousal': 0.3},
    'disapproval': {'valence': -0.5, 'arousal': 0.4},
    'disgust': {'valence': -0.8, 'arousal': 0.6},
    'embarrassment': {'valence': -0.4, 'arousal': 0.5},
    'excitement': {'valence': 0.9, 'arousal': 0.8},
    'fear': {'valence': -0.8, 'arousal': 0.9},
    'gratitude': {'valence': 0.8, 'arousal': 0.4},
    'grief': {'valence': -0.9, 'arousal': 0.2},
    'joy': {'valence': 0.9, 'arousal': 0.7},
    'love': {'valence': 0.9, 'arousal': 0.6},
    'nervousness': {'valence': -0.2, 'arousal': 0.7},
    'optimism': {'valence': 0.7, 'arousal': 0.5},
    'pride': {'valence': 0.7, 'arousal': 0.6},
    'realization': {'valence': 0.2, 'arousal': 0.4},
    'relief': {'valence': 0.6, 'arousal': 0.2},
    'remorse': {'valence': -0.5, 'arousal': 0.3},
    'sadness': {'valence': -0.8, 'arousal': 0.2},
    'surprise': {'valence': 0.4, 'arousal': 0.8},
    'neutral': {'valence': 0.0, 'arousal': 0.1},
}

# This function is UNCHANGED
def load_models():
    """Load both the text and speech emotion detection models."""
    global text_emotion_classifier, speech_emotion_classifier
    
    try:
        if text_emotion_classifier is None:
            text_emotion_classifier = pipeline(
                "text-classification",
                model="SamLowe/roberta-base-go_emotions",
                top_k=None
            )
            print("✅ GoEmotions (Text) model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading text model: {e}")
        text_emotion_classifier = None
        
    try:
        if speech_emotion_classifier is None:
            speech_emotion_classifier = pipeline(
                "audio-classification", 
                model="superb/wav2vec2-base-superb-er"
            )
            print("✅ Wav2Vec2 (Speech) model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading speech model: {e}")
        speech_emotion_classifier = None

load_models()

@app.route('/health', methods=['GET'])
def health_check():
    """ ### --- UPDATED --- ### Health check now verifies the Google API key configuration. """
    return jsonify({
        "status": "healthy",
        "text_model_loaded": text_emotion_classifier is not None,
        "speech_model_loaded": speech_emotion_classifier is not None,
        "llm_configured": google_api_key is not None
    }), 200

# This endpoint is UNCHANGED
@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    # ... This function remains exactly the same ...
    try:
        data = request.get_json()
        if not data or 'text' not in data or not data['text'].strip():
            return jsonify({"error": "Missing or empty 'text' field"}), 400
        text = data['text']
        if text_emotion_classifier is None:
            return jsonify({"error": "Text model not loaded"}), 503
        results = text_emotion_classifier(text)[0]
        sorted_emotions = sorted(results, key=lambda x: x['score'], reverse=True)
        top_emotions = [
            {"emotion": e['label'], "confidence": round(e['score'], 4)}
            for e in sorted_emotions[:5]
        ]
        primary_emotion = top_emotions[0]['emotion']
        dimensions = EMOTION_DIMENSIONS.get(primary_emotion, {'valence': 0.0, 'arousal': 0.0})
        return jsonify({
            "primary": primary_emotion,
            "emotions": top_emotions,
            "valence": dimensions['valence'],
            "arousal": dimensions['arousal']
        }), 200
    except Exception as e:
        print(f"Error in analyze_emotion: {e}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


# This endpoint is UNCHANGED
@app.route('/api/analyze-multimodal', methods=['POST'])
def analyze_multimodal():
    # ... This function remains exactly the same ...
    try:
        if text_emotion_classifier is None or speech_emotion_classifier is None:
            return jsonify({"error": "One or more models are not loaded"}), 503
        text = request.form.get('text', '').strip()
        text_analysis = {}
        if text:
            results = text_emotion_classifier(text)[0]
            sorted_text_emotions = sorted(results, key=lambda x: x['score'], reverse=True)
            primary_text_emotion = sorted_text_emotions[0]['label']
            dimensions = EMOTION_DIMENSIONS.get(primary_text_emotion, {'valence': 0.0, 'arousal': 0.0})
            text_analysis = {
                "primary": primary_text_emotion,
                "emotions": [{"emotion": e['label'], "confidence": round(e['score'], 4)} for e in sorted_text_emotions[:3]],
                "valence": dimensions['valence'],
                "arousal": dimensions['arousal']
            }
        if 'audio' not in request.files:
            return jsonify({"error": "Missing 'audio' file in request"}), 400
        audio_file = request.files['audio']
        audio_bytes = io.BytesIO(audio_file.read())
        audio_input, sample_rate = librosa.load(audio_bytes, sr=16000)
        speech_results = speech_emotion_classifier(audio_input)
        sorted_speech_emotions = sorted(speech_results, key=lambda x: x['score'], reverse=True)
        speech_analysis = {
            "primary": sorted_speech_emotions[0]['label'],
            "emotions": [{"emotion": e['label'], "confidence": round(e['score'], 4)} for e in sorted_speech_emotions]
        }
        final_primary = text_analysis.get("primary", speech_analysis["primary"])
        return jsonify({
            "primary": final_primary,
            "text_analysis": text_analysis,
            "speech_analysis": speech_analysis,
        }), 200
    except Exception as e:
        print(f"Error in analyze_multimodal: {e}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


### --- UPDATED --- ###
# This is the new endpoint for generating empathetic, context-aware responses using Google Gemini.
@app.route('/api/generate-empathetic-response', methods=['POST'])
def generate_empathetic_response():
    """
    Generates a contextual response using Google's Gemini model based on the conversation history.
    """
    try:
        if not google_api_key:
            return jsonify({"error": "LLM service is not configured"}), 503

        data = request.get_json()
        messages = data.get('messages', [])
        emotion_data = data.get('emotionData', {})
        user_name = data.get('userName', 'there') # Default to 'there' if no name provided

        if not messages:
            return jsonify({"error": "Missing 'messages' field"}), 400

        primary_emotion = emotion_data.get('primary', 'an unknown emotion')
        
        # The system prompt is the same, as it's excellent for guiding the AI.
        system_prompt = (
    f"You are Mindful, a compassionate AI counselor in the mental health application NeuroNest. "
    f"The user you are speaking with is named {user_name}. "
    f"Your primary role is to act as a supportive mental health professional, creating a safe, non-judgmental space where the user feels heard and understood. "
    f"Use a warm, caring, and consistently supportive tone. "

    f"--- Core Counseling Method ---"
    f"1. **Reflective Listening First:** ALWAYS start your response by summarizing or reflecting what the user has shared. This shows you are listening. Examples: 'It sounds like you had a really exhausting day, both at work and emotionally.', 'So, you're feeling a sense of uncertainty about what comes next after that difficult interaction.' "
    
    f"2. **Ask Gentle, Open-Ended Follow-Up Questions:** After reflecting, ask ONE thoughtful, open-ended question to encourage the user to explore their feelings further. Do not ask simple yes/no questions. Examples: 'How did that experience with your boss make you feel?', 'What was going through your mind when you came home?', 'Could you tell me more about the feeling of not wanting to go to work?'"

    f"3. **Connect to Detected Emotions:** Gently weave the detected emotion into your reflection. The primary emotion detected in the user's last message was '{primary_emotion}'. Example: 'It makes sense that you would feel a sense of '{primary_emotion}' given how that incident unfolded.'"

    f"--- Strict Guidelines ---"
    f"- **DO NOT Give Advice:** Do not offer solutions or tell the user what to do, unless they explicitly ask for a coping technique. Your job is to listen and help them explore, not to fix."
    f"- **ABSOLUTELY NO MEDICAL ADVICE:** Never provide diagnoses, medical recommendations, or psychiatric analysis. "
    f"- **Keep it Concise:** Your entire response should be thoughtful but brief, ideally 2-4 sentences. "
    f"- **Crisis Protocol:** If the user's language indicates a crisis (self-harm, etc.), gently and immediately guide them towards professional help without being alarming. "
)

        # Initialize the Gemini model with our system prompt.
        # 'gemini-1.5-flash-latest' is free, fast, and great for chat.
        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            system_instruction=system_prompt
        )

        # Convert the message history from your frontend's format to Gemini's format.
        gemini_history = []
        for msg in messages[:-1]:  # Process all messages except the very last one.
            # The 'assistant' role from the frontend maps to 'model' for the Gemini API.
            role = 'model' if msg['role'] == 'assistant' else 'user'
            gemini_history.append({'role': role, 'parts': [msg['content']]})
        
        # The last message from the user is what we're responding to.
        last_user_message = messages[-1]['content']

        # Start a chat session with the conversation history.
        chat = model.start_chat(history=gemini_history)
        
        # Send the final user message to get the new AI response.
        response = chat.send_message(last_user_message)
        
        response_text = response.text

        return jsonify({"response": response_text.strip()}), 200

    except Exception as e:
        print(f"Error in generate_empathetic_response: {e}")
        return jsonify({"error": "Internal server error during LLM call", "message": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
